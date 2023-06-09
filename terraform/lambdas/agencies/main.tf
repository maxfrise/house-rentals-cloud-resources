data "archive_file" "agencies_source" {
  type        = "zip"
  source_file = var.source_file
  output_path = var.lambda_output_path
}

resource "aws_s3_object" "agencies_s3_bucket" {
  bucket = var.bucket
  key    = var.bucketKey
  source = data.archive_file.agencies_source.output_path
  etag = data.archive_file.agencies_source.output_md5
}

resource "aws_lambda_function" "agencies_lambda" {
  function_name    = "agencies_lambda"
  description      = "Lambda to manage agencies"
  s3_bucket        = var.bucket
  s3_key           = aws_s3_object.agencies_s3_bucket.key
  runtime          = "nodejs18.x"
  role             = var.iam_arn
  source_code_hash = data.archive_file.agencies_source.output_base64sha256
  handler          = "index.handler"
  architectures    = ["arm64"]
  timeout          = 900
}
