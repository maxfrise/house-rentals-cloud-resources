resource "aws_api_gateway_rest_api" "maxfrise_api" {
  name        = "maxfrise_api"
  description = "Api Gateway for maxfrise"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "agencies_resource" {
  rest_api_id = aws_api_gateway_rest_api.maxfrise_api.id
  parent_id   = aws_api_gateway_rest_api.maxfrise_api.root_resource_id
  path_part   = "agencies"
}

resource "aws_api_gateway_method" "agencies_resource_method" {
  rest_api_id   = aws_api_gateway_rest_api.maxfrise_api.id
  resource_id   = aws_api_gateway_resource.agencies_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "agencies_lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.maxfrise_api.id
  resource_id = aws_api_gateway_method.agencies_resource_method.resource_id
  http_method = aws_api_gateway_method.agencies_resource_method.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.agencies_function_invoke_arn
}

resource "aws_api_gateway_deployment" "api_test_deployment" {
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.agencies_resource,
      aws_api_gateway_method.agencies_resource_method,
      aws_api_gateway_integration.agencies_lambda_integration,
    ]))
  }

  rest_api_id = aws_api_gateway_rest_api.maxfrise_api.id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_deployment" "api_prod_deployment" {
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.agencies_resource,
      aws_api_gateway_method.agencies_resource_method,
      aws_api_gateway_integration.agencies_lambda_integration,
    ]))
  }

  rest_api_id = aws_api_gateway_rest_api.maxfrise_api.id

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "test" {
  deployment_id = aws_api_gateway_deployment.api_test_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.maxfrise_api.id
  stage_name    = "test"

  variables = {
    "environment" = "test"
  }
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.api_prod_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.maxfrise_api.id
  stage_name    = "prod"

  variables = {
    "environment" = "prod"
  }
}

resource "aws_lambda_permission" "agencies_api_lambda_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.agencies_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.agencies_api.execution_arn}/*"
}
