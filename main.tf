terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.59.0"
    }
  }

  required_version = ">= 1.2.0"

  cloud {
    organization = "maxfrise"

    workspaces {
      name = "maxfrise-infra"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

module "dynamoDB_agencies_test_table" {
  source = "./terraform/database/agencies-test-table"
}

module "dynamoDB_agencies_prod_table" {
  source = "./terraform/database/agencies-prod-table"
}

module "iam_maxfrise_lambdas" {
  source = "./terraform/certs/lambdas"
}

module "agencies_lambda" {
  source = "./terraform/lambdas/agencies"

  iam_arn            = module.iam_maxfrise_lambdas.arn
  source_file        = "./functions/agencies/dist/index.js"
  lambda_output_path = "./functions/agencies/dist/lambda.zip"
  bucket             = "maxfrisedeployables"
  s3_suffix          = "agencies_lambda"
  bucketKey          = "agencies_lambda.zip"
}

module "maxfrise_api_gateway" {
  source = "./terraform/api"

  agencies_function_name       = module.agencies_lambda.lambda_name
  agencies_function_invoke_arn = module.agencies_lambda.lambda_invoke_arn
}

module "maxfrise_user_pool" {
  source = "./terraform/auth/userpool"

  user_pool_name = "maxfrise_users"

  number_schemas = [
    {
      attribute_data_type      = "Number"
      developer_only_attribute = false
      mutable                  = true
      name                     = "number_of_properties"
      required                 = false

      number_attribute_constraints = {
        min_value = 0
        max_value = 500
      }
    }
  ]

  string_schemas = [
    {
      attribute_data_type      = "String"
      developer_only_attribute = false
      mutable                  = false
      name                     = "email"
      required                 = true // required attributes can only be se on pool creation

      string_attribute_constraints = {
        min_length = 0
        max_length = 2048
      }
    },
    {
      attribute_data_type      = "String"
      developer_only_attribute = false
      mutable                  = false
      name                     = "name"
      required                 = true // required attributes can only be se on pool creation

      string_attribute_constraints = {
        min_length = 0
        max_length = 2048
      }
    },
  ]

  domain = "maxfrise"

  clients = [
    {
      allowed_oauth_flows                  = ["code"]
      allowed_oauth_flows_user_pool_client = false
      allowed_oauth_scopes                 = ["email", "profile", "openid"]
      callback_urls                        = ["https://www.maxfrise.com/callback"]
      default_redirect_uri                 = "https://www.maxfrise.com/callback"
      explicit_auth_flows                  = ["ALLOW_REFRESH_TOKEN_AUTH", "ALLOW_USER_SRP_AUTH", "ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_USER_PASSWORD_AUTH"]
      generate_secret                      = false
      logout_urls                          = []
      name                                 = "maxfrise_web_client"
      read_attributes                      = ["address", "birthdate", "custom:number_of_properties", "name", "phone_number", "phone_number_verified", "picture", "email", "profile", "email_verified", "family_name", "gender", "given_name", "locale", "middle_name", "nickname", "preferred_username", "updated_at", "website", "zoneinfo"]
      write_attributes                     = ["address", "birthdate", "custom:number_of_properties", "name", "phone_number", "picture", "email", "profile", "family_name", "gender", "given_name", "locale", "middle_name", "nickname", "preferred_username", "updated_at", "website", "zoneinfo"]
      supported_identity_providers         = ["COGNITO"]
      prevent_user_existence_errors        = "ENABLED"
      access_token_validity                = 1
      id_token_validity                    = 1
      refresh_token_validity               = 60
      token_validity_units = {
        access_token  = "hours"
        id_token      = "hours"
        refresh_token = "days"
      }
    }
  ]

  tags = {
    Owner       = "maxfrise"
    Environment = "production"
    Terraform   = true
  }
}

module "api_lambdas" {
  for_each = tomap({
    initLease        = "function to init the lease",
    paymentCollector = "function to collect payments",
    createHouse      = "function to create houses",
    getHouses        = "function to get houses",
    houseOverview    = "function to get the house overview"
  })

  source               = "./terraform/lambdas/api"
  function_name        = "${each.key}_TF"
  function_description = each.value
  source_file          = "./functions/${each.key}/dist/index.js"
  lambda_output_path   = "./functions/${each.key}/dist/lambda.zip"
  bucket               = "maxfrisedeployables"
  bucketKey            = "${each.key}_lambda.zip"
  iam_arn              = module.iam_maxfrise_lambdas.arn
}

data "template_file" "maxfrise_api_v2_spec" {
  template = file("./api_spec.yaml")

  vars = {
    region                    = "us-west--2"
    initLeaseLambdaArn        = module.api_lambdas["initLease"].lambda_function_arn
    paymentCollectorLambdaArn = module.api_lambdas["paymentCollector"].lambda_function_arn
    createHouseLambdaArn      = module.api_lambdas["createHouse"].lambda_function_arn
    getHousesLambdaArn        = module.api_lambdas["getHouses"].lambda_function_arn
    houseOverviewLambdaArn    = module.api_lambdas["houseOverview"].lambda_function_arn
  }
}

module "maxfrise_api_v2" {
  source = "./api"

  open_api_body = data.template_file.maxfrise_api_v2_spec.rendered
}
