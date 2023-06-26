data "archive_file" "hello-terraform-src" {
  type        = "zip"
  source_file = "${var.lambda_src_file}"
  output_path = "${var.building_path}/${var.lambda_code_filename}"
}

resource "aws_lambda_function" "hello-terraform" {
  filename         = data.archive_file.hello-terraform-src.output_path
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  function_name    = "hello-terraform"
  architectures    = ["arm64"]
  role             = aws_iam_role.iam_for_lambda.arn
  timeout          = 30
  source_code_hash = data.archive_file.hello-terraform-src.output_base64sha256
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

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
