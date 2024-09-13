data "archive_file" "source_code" {
  type        = "zip"
  source_file = var.source_file
  output_path = var.lambda_output_path
}

resource "aws_s3_object" "source_s3_bucket" {
  bucket = var.bucket
  key    = var.bucketKey
  source = data.archive_file.source_code.output_path
  etag = data.archive_file.source_code.output_md5
}

resource "aws_lambda_function" "lambda_function" {
  function_name    = var.function_name
  description      = var.function_description
  s3_bucket        = var.bucket
  s3_key           = aws_s3_object.source_s3_bucket.key
  runtime          = "nodejs18.x"
  role             = var.iam_arn
  source_code_hash = data.archive_file.source_code.output_base64sha256
  handler          = "index.handler"
  architectures    = ["arm64"]
  timeout          = 900
}
