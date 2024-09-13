variable "function_name" {
  description = "The name of the lambda function"
  type        = string
}

variable "function_description" {
  description = "The description of the lambda function"
  type        = string
}

variable "source_file" {
  description = "The location of the zip file"
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

variable "iam_arn" {
  description = "The iam arn role for lambdas"
  type        = string
}