resource "aws_dynamodb_table" "login_test" {
  name           = "login-test"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "userId"
  range_key      = "date"

  global_secondary_index {
    name            = "ActiveSessionsIndex"
    write_capacity  = 1
    read_capacity   = 1
    projection_type = "ALL"
    hash_key        = "userId"
    range_key       = "status"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }
}
