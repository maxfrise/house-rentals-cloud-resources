resource "aws_dynamodb_table" "tf_example_table" {
  name           = "tf-test-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "houses"
  range_key      = "date"

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
    name            = "UserType"
    write_capacity  = 1
    read_capacity   = 1
    projection_type = "ALL"
    hash_key        = "user"
    range_key       = "type"
  }
}
