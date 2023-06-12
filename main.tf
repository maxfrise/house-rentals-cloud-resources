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

  building_path      = "./modules/lambdaexample/src/dist"
  lambda_output_path = "./modules/lambdaexample/src/dist/lambda.zip"
  bucket             = "maxfriselambdaresources"
  s3_suffix          = "lambas3example"
}
