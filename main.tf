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

module "maxfrise_api_gateway" {
  source = "./terraform/api/maxfrise-api"
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

  source_file        = "./functions/agencies/dist/index.js"
  lambda_output_path = "./functions/agencies/dist/lambda.zip"
  bucket             = "maxfrisedeployables"
  s3_suffix          = "agencies_lambda"
  bucketKey          = "agencies_lambda.zip"
}
