variable "building_path" {
  description = "The path of the build to find the lambda code"
  type        = string
}

variable "lambda_output_path" {
  description = "The path of where the zip will be added"
  type        = string
}

variable "s3_suffix" {
  description = "Sufix of the bucket where the code is deployed"
  type        = string
}

variable "bucket" {
  description = "The name of the bucket where the code will be deployed"
  type        = string
}

variable "bucketKey" {
  description = "The name of the file where the lambda code exisits"
  type        = string
}