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
                    "dynamodb:UpdateGlobalTable",
                    "dynamodb:DeleteTable",
                    "dynamodb:DescribeTable",
                    "dynamodb:GetItem",
                    "dynamodb:DescribeExport",
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:PutItem",
                    "dynamodb:Scan",
                    "dynamodb:UpdateItem",
                    "dynamodb:CreateTable",
                    "dynamodb:UpdateTable",
                    "dynamodb:GetRecords",
                    "dynamodb:DescribeImport",
                    "dynamodb:DeleteItem",
                    "dynamodb:CreateBackup",
                    "dynamodb:ConditionCheckItem",
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
                    "dynamodb:ListExports"
                ],
                "Resource": "*"
            }
        ]
    }
    EOF

}