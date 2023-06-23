resource "aws_lambda_function" "agencies" {
  filename         = "${var.building_path}/${var.lambda_code_filename}"
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  function_name    = "agencies"
  architectures    = ["arm64"]
  role             = aws_iam_role.iam_for_lambda.arn
  timeout          = 30
  source_code_hash = filebase64sha256("${var.building_path}/${var.lambda_code_filename}")
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
