resource "aws_api_gateway_rest_api" "agencies_api" {
  name        = "agencies_api"
  description = "Api Gateway for agencies management"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}