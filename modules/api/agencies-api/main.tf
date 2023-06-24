resource "aws_api_gateway_rest_api" "agencies_api" {
  name        = "agencies_api"
  description = "Api Gateway for agencies management"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
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

  rest_api_id = aws_api_gateway_rest_api.agencies_api.id

  variables = {
    "environment" = "test"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_deployment" "prod_deployment" {
  depends_on = [
    aws_api_gateway_integration.agencies_lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.agencies_api.id

  variables = {
    "environment" = "prod"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "test" {
  deployment_id = aws_api_gateway_deployment.test_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.agencies_api.id
  stage_name    = "test"
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.prod_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.agencies_api.id
  stage_name    = "prod"
}

### LAMBDA Function

resource "aws_lambda_function" "agencies" {
  filename         = "${var.building_path}/${var.lambda_code_filename}"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  function_name    = "agencies"
  architectures    = ["arm64"]
  role             = aws_iam_role.iam_for_agencies_lambda.arn
  timeout          = 30
  source_code_hash = filebase64sha256("${var.building_path}/${var.lambda_code_filename}")
}

resource "aws_iam_role" "iam_for_agencies_lambda" {
  name = "iam_for_agencies_lambda"

  assume_role_policy = <<EOF
    {
    "Version": "2012-10-17",
    "Statement": [
        {
        "Action": "sts:AssumeRole",
        "Principal": {
            "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
        }
    ]
    }
    EOF

}