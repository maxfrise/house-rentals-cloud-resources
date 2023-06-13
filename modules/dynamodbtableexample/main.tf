resource "aws_dynamodb_table" "tf_example_table" {
  name         = "tf-test-table"
  billing_mode = "PROVISIONED"
  hash_key     = "houses"
  range_key    = "date"

  attribute {
    name = "houses"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "user"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  global_secondary_index {
    name      = "UserType"
    projection_type = "ALL"
    hash_key  = "user"
    range_key = "type"
  }
}
