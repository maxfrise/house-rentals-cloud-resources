resource "aws_api_gateway_stage" "test_stage" {
  rest_api_id  = aws_api_gateway_rest_api.api_v2.id
  deployment_id = aws_api_gateway_deployment.test_deployment.id
  stage_name   = "test"

  description = "Maxfrise api stage connected to test resources"

  variables = {
    "environment" = "test"
  }
}

resource "aws_api_gateway_stage" "prod_stage" {
  rest_api_id  = aws_api_gateway_rest_api.api_v2.id
  deployment_id = aws_api_gateway_deployment.prod_deployment.id
  stage_name   = "prod"

  description = "Maxfrise api stage connected to Production resources"

  variables = {
    "environment" = "prod"
  }
}

