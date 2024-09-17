resource "aws_api_gateway_rest_api" "api_v2" {
  name = "MaxfriseApiV2"

  body = var.open_api_body

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}
