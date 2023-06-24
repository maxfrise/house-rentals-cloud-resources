resource "aws_api_gateway_rest_api" "agencies_api" {
  name        = "agencies_api"
  description = "Api Gateway for agencies management"
}

resource "aws_api_gateway_resource" "agency_resource" {
  rest_api_id = aws_api_gateway_rest_api.agencies_api.id
  parent_id   = aws_api_gateway_rest_api.agencies_api.root_resource_id
  path_part   = "agenciesapi"
}

resource "aws_api_gateway_method" "agency_resource_method" {
  rest_api_id   = aws_api_gateway_rest_api.agencies_api.id
  resource_id   = aws_api_gateway_resource.agency_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "agencies_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.agencies_api.id
  resource_id = aws_api_gateway_method.agency_resource_method.resource_id
  http_method = aws_api_gateway_method.agency_resource_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.agencies.invoke_arn
}

resource "aws_api_gateway_deployment" "test_deployment" {
  depends_on = [
    aws_api_gateway_integration.agencies_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  stage_name  = "test"

  variables = {
    "environment" = "test"
  }
}

resource "aws_api_gateway_deployment" "prod_deployment" {
  depends_on = [
    aws_api_gateway_integration.agencies_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.api_gateway_rest_api.id
  stage_name  = "prod"

  variables = {
    "environment" = "prod"
  }
}
