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
  source = "./modules/api/agencies-api"

  building_path        = "./modules/api/agencies-api/lambda/dist"
  lambda_code_filename = "index.zip"
  lambda_src_path      = "./modules/api/agencies-api/lambda/src"
}

module "dynamoDB_agencies_test_table" {
  source = "./modules/database/agencies-test-table"
}

module "dynamoDB_agencies_prod_table" {
  source = "./modules/database/agencies-prod-table"
}

module "s3_bucket" {
  source = "./modules/s3bucket"

  bucket_name = "testing-submodules-resources"

  tags = {
    Terraform   = "true"
    Environment = "dev"
    MaxfriseAPI = "true"
  }
}

module "sample_lambda" {
  source = "./modules/lambdaexample"

  building_path        = "./modules/lambdaexample/src/dist"
  lambda_code_filename = "index.zip"
  lambda_src_path      = "./modules/lambdaexample/src"
}

module "sample_s3_lambda" {
  source = "./modules/lambdas3example"

  source_file        = "./modules/lambdas3example/src/dist/index.js"
  lambda_output_path = "./modules/lambdas3example/src/dist/lambda.zip"
  bucket             = "maxfrisedeployables"
  s3_suffix          = "lambas3example"
  bucketKey          = "sample_s3_lambda.zip"
}

module "sample_dynamodb_table" {
  source = "./modules/dynamodbtableexample"
}


module "sample_api_gateway" {
  source = "./modules/apigatewayexamaple"

  source_file        = "./modules/apigatewayexamaple/src/dist/index.js"
  lambda_output_path = "./modules/apigatewayexamaple/src/dist/lambda.zip"
  bucket             = "maxfrisedeployables"
  bucketKey          = "tf-lambda-apigw-sample.zip"
  example_secret     = "this_is_a_secrete"
}
