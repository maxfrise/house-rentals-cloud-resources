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

module "agencies_api_gateway" {
  source = "./terraform/api/agencies-api"

  building_path        = "./terraform/api/agencies-api/lambda/dist"
  lambda_code_filename = "index.zip"
  lambda_src_path      = "./terraform/api/agencies-api/lambda/src"
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

module "sample_s3_lambda" {
  source = "./functions/lambdas3example"

  source_file        = "./functions/lambdas3example/src/dist/index.js"
  lambda_output_path = "./functions/lambdas3example/src/dist/lambda.zip"
  bucket             = "maxfrisedeployables"
  s3_suffix          = "lambas3example"
  bucketKey          = "sample_s3_lambda.zip"
}
