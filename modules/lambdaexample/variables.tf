variable "building_path" {
  description = "The path of the build to find the lambda code"
  type        = string
}

variable "lambda_code_filename" {
  description = "The name of zip file that contains the lambda code"
  type        = string
}

variable "lambda_src_path" {
  description = "The path of the source code of the lambda"
  type        = string
}

variable "lambda_src_file" {
  description = "The src file of the lambda"
  type        = string
}
