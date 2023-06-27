resource "aws_api_gateway_rest_api" "maxfrise_api" {
  name        = "maxfrise_api"
  description = "Api Gateway for maxfrise"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}