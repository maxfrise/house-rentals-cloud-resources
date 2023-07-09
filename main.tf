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
      required                 = true

      string_attribute_constraints = {
        min_length = 7
        max_length = 15
      }
    },
    {
      attribute_data_type      = "String"
      developer_only_attribute = false
      mutable                  = false
      name                     = "name"
      required                 = true

      string_attribute_constraints = {
        min_length = 7
        max_length = 40
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
      explicit_auth_flows                  = []
      generate_secret                      = false
      logout_urls                          = ["https://www.maxfrise.com/logout"]
      name                                 = "maxfrise_web_client"
      read_attributes                      = ["address", "birthdate", "custom:number_of_properties", "name", "phone_number", "picture", "email", "profile"]
      write_attributes                     = ["address", "birthdate", "custom:number_of_properties", "name", "phone_number", "picture", "email", "profile"]
      supported_identity_providers         = ["COGNITO"]
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

