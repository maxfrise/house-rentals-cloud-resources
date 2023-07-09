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
  source = "./terraform/auth/usespool"

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

  tags = {
    Owner       = "maxfrise"
    Environment = "production"
    Terraform   = true
  }
}

