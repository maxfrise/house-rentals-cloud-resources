resource "aws_iam_role" "iam_maxfrise_lambdas" {
  name = "iam_maxfrise_lambdas"

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
            },
            {
                "Sid": "TouchDynamoTables",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:Query"
                ],
                "Resource": "arn:aws:dynamodb:*:914036813947:table/*"
            },
            {
                "Sid": "ListDynamoTables",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:ListGlobalTables",
                    "dynamodb:ListTables",
                    "dynamodb:ListBackups",
                    "dynamodb:ListImports",
                    "dynamodb:ListExports
                ],
                "Resource": "*"
            }
        ]
    }
    EOF

}