resource "aws_dynamodb_table" "users_prod" {
  name           = "users-prod"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "email"

  attribute {
    name = "email"
    type = "S"
  }
}
