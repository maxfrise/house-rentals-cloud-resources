variable "source_file" {
  description = "The of the zip file"
  type        = string
}

variable "lambda_output_path" {
  description = "The path of where the zip will be added"
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

variable "example_secret" {
  description = "The secret to be stored in the lambda"
  type        = string
}
