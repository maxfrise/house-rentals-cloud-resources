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

module "sayHi_bucket" {
  source = "./modules/sayhi"

  bucket_name = "testing_submodules"

  tags = {
    Terraform   = "true"
    Environment = "dev"
    MaxfriseAPI = "true"
  }
}
