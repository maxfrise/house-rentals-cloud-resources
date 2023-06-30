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
                    "dynamodb:DescribeContributorInsights",
                    "dynamodb:RestoreTableToPointInTime",
                    "dynamodb:UpdateGlobalTable",
                    "dynamodb:DeleteTable",
                    "dynamodb:UpdateTableReplicaAutoScaling",
                    "dynamodb:DescribeTable",
                    "dynamodb:PartiQLInsert",
                    "dynamodb:GetItem",
                    "dynamodb:DescribeContinuousBackups",
                    "dynamodb:DescribeExport",
                    "dynamodb:EnableKinesisStreamingDestination",
                    "dynamodb:BatchGetItem",
                    "dynamodb:DisableKinesisStreamingDestination",
                    "dynamodb:UpdateTimeToLive",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:PutItem",
                    "dynamodb:PartiQLUpdate",
                    "dynamodb:Scan",
                    "dynamodb:StartAwsBackupJob",
                    "dynamodb:UpdateItem",
                    "dynamodb:UpdateGlobalTableSettings",
                    "dynamodb:CreateTable",
                    "dynamodb:RestoreTableFromAwsBackup",
                    "dynamodb:GetShardIterator",
                    "dynamodb:ExportTableToPointInTime",
                    "dynamodb:DescribeBackup",
                    "dynamodb:UpdateTable",
                    "dynamodb:GetRecords",
                    "dynamodb:DescribeTableReplicaAutoScaling",
                    "dynamodb:DescribeImport",
                    "dynamodb:DeleteItem",
                    "dynamodb:CreateTableReplica",
                    "dynamodb:ListTagsOfResource",
                    "dynamodb:UpdateContributorInsights",
                    "dynamodb:CreateBackup",
                    "dynamodb:UpdateContinuousBackups",
                    "dynamodb:PartiQLSelect",
                    "dynamodb:UpdateGlobalTableVersion",
                    "dynamodb:CreateGlobalTable",
                    "dynamodb:DescribeKinesisStreamingDestination",
                    "dynamodb:ImportTable",
                    "dynamodb:ConditionCheckItem",
                    "dynamodb:Query",
                    "dynamodb:DescribeStream",
                    "dynamodb:DeleteTableReplica",
                    "dynamodb:DescribeTimeToLive",
                    "dynamodb:DescribeGlobalTableSettings",
                    "dynamodb:DescribeGlobalTable",
                    "dynamodb:RestoreTableFromBackup",
                    "dynamodb:DeleteBackup",
                    "dynamodb:PartiQLDelete"
                ],
                "Resource": "arn:aws:dynamodb:*:914036813947:table/*"
            },
            {
                "Sid": "ListDynamoTables",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:ListContributorInsights",
                    "dynamodb:DescribeReservedCapacityOfferings",
                    "dynamodb:ListGlobalTables",
                    "dynamodb:ListTables",
                    "dynamodb:DescribeReservedCapacity",
                    "dynamodb:ListBackups",
                    "dynamodb:PurchaseReservedCapacityOfferings",
                    "dynamodb:ListImports",
                    "dynamodb:DescribeLimits",
                    "dynamodb:DescribeEndpoints",
                    "dynamodb:ListExports",
                    "dynamodb:ListStreams"
                ],
                "Resource": "*"
            }
        ]
    }
    EOF

}