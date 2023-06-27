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

module "s3_bucket" {
  source = "./terraform/buckets/s3bucket"

  bucket_name = "testing-submodules-resources"

  tags = {
    Terraform   = "true"
    Environment = "dev"
    MaxfriseAPI = "true"
  }
}

module "sample_lambda" {
  source = "./functions/lambdaexample"

  building_path        = "./functions/lambdaexample/src/dist"
  lambda_code_filename = "index.zip"
  lambda_src_path      = "./functions/lambdaexample/src"
}