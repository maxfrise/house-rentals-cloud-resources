
data "template_file" "maxfrise_api_v2_spec" {
  template = file("${path.module}/api_spec.yaml")

  vars = {
    region                    = "us-west--2"
    initLeaseLambdaArn        = var.initLeaseLambdaArn
    paymentCollectorLambdaArn = var.paymentCollectorLambdaArn
    createHouseLambdaArn      = var.createHouseLambdaArn
    getHousesLambdaArn        = var.getHousesLambdaArn
    houseOverviewLambdaArn    = var.houseOverviewLambdaArn
  }
}

resource "aws_api_gateway_rest_api" "api_v2" {
  name = "MaxfriseApiV2"

  body = data.template_file.maxfrise_api_v2_spec.rendered

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}


resource "aws_api_gateway_deployment" "test_deployment" {
  rest_api_id = aws_api_gateway_rest_api.api_v2.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api_v2.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_deployment" "prod_deployment" {
  rest_api_id = aws_api_gateway_rest_api.api_v2.id

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.api_v2.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}
