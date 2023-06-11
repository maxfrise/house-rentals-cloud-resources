resource "aws_lambda_function" "hello-terraform" {
  filename      = "${var.building_path}/${var.lambda_code_filename}"
  handler       = "index.handler"
  runtime       = "Node.js 18.x"
  function_name = "hello-terraform"
  role          = aws_iam_role.iam_for_lambda.arn
  timeout       = 30
  depends_on = [
    null_resource.build_lambda_function
  ]
}

resource "null_resource" "build_lambda_function" {
    triggers = {
        build_number = "${timestamp()}" # TODO: this should be the sha of the code.
    }
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
