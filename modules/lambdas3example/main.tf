data "archive_file" "source" {
  type        = "zip"
  source_dir  = var.building_path
  output_path = var.lambda_output_path
}

resource "aws_s3_object" "file_upload" {
  bucket = var.bucket
  key    = var.lambda_output_path
  source = data.archive_file.source.output_path
}

resource "aws_lambda_function" "lamba_s3_example" {
  function_name    = "lambdaS3Example"
  description      = "Example of a lambda where the code lives on s3"
  s3_bucket        = var.bucket
  s3_key           = aws_s3_object.file_upload.key
  runtime          = "nodejs18.x"
  role             = aws_iam_role.iam_for_lambda.arn
  source_code_hash = base64sha256(data.archive_file.source.output_path)
  handler          = "index.handler"
  architectures    = ["arm64"]
  timeout          = 900
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_lambda_s3"

  assume_role_policy = <<EOF
    {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowLoggingToCloudWatch",
        "Effect": "Allow",
        "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        "Resource": "arn:aws:logs:*:*:*"
      }
    ]
    }
    EOF

}
