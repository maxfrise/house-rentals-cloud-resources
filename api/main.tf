data "template_file" "maxfrise_api_v2_spec" {
  template = file("./api_spec.yaml")

  vars = {
    region                    = "us-west--2"
    initLeaseLambdaArn        = module.api_lambdas["initLease"].lambda_function_arn
    paymentCollectorLambdaArn = module.api_lambdas["paymentCollector"].lambda_function_arn
    createHouseLambdaArn      = module.api_lambdas["createHouse"].lambda_function_arn
    getHousesLambdaArn        = module.api_lambdas["getHouses"].lambda_function_arn
    houseOverviewLambdaArn    = module.api_lambdas["houseOverview"].lambda_function_arn
  }
}

resource "aws_api_gateway_rest_api" "api_v2" {
  name = "MaxfriseApiV2"

  body = data.template_file.maxfrise_api_v2_spec.rendered

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}
