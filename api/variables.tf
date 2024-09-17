variable "open_api_body" {
  description = "the body of the open api spec"
  type        = any
}

variable "initLeaseLambdaArn" {
  description = "the arn of the initLeaseLambda"
  type        = string
}

variable "paymentCollectorLambdaArn" {
  description = "the arn of the paymentCollectorLambda"
  type        = string
}

variable "createHouseLambdaArn" {
  description = "the arn of the createHouseLambda"
  type        = string
}

variable "getHousesLambdaArn" {
  description = "the arn of the getHousesLambda"
  type        = string
}

variable "houseOverviewLambdaArn" {
  description = "the arn of the houseOverviewLambda"
  type        = string
}
