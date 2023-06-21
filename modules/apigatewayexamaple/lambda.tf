data "archive_file" "function_archive" {
  type        = "zip"
  source_file = var.source_file
  output_path = var.lambda_output_path
}

resource "aws_s3_object" "file_upload" {
  bucket = var.bucket
  key    = var.bucketKey
  source = data.archive_file.source.output_path
  etag   = filemd5(data.archive_file.source.source_file)
}

resource "aws_lambda_function" "lamba_apigateway_example" {
  function_name    = "tf-api-gateway"
  description      = "Example of a lambda integration with api gateway"
  s3_bucket        = var.bucket
  s3_key           = aws_s3_object.file_upload.key
  runtime          = "nodejs18.x"
  role             = aws_iam_role.lambda_role.arn
  source_code_hash = base64sha256(data.archive_file.source.output_path)
  handler          = "index.handler"
  architectures    = ["arm64"]
  timeout          = 900

  environment {
    variables = {
      "EXAMPLE_SECRET" = "${var.example_secret}"
    }
  }
}

resource "aws_lambda_permission" "lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lamba_apigateway_example.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api_gateway_rest_api.execution_arn}/*/*"
}
