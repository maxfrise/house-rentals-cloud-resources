resource "aws_dynamodb_table" "agencies_test" {
  name           = "agencies-test-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "agencyId"
  range_key      = "owner"

  attribute {
    name = "agencyId"
    type = "S"
  }

  attribute {
    name = "address"
    type = "S"
  }

  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "phone"
    type = "S"
  }

  attribute {
    name = "mail"
    type = "S"
  }

  attribute {
    name = "owner"
    type = "S"
  }

  global_secondary_index {
    name            = "AgencyOwner"
    write_capacity  = 1
    read_capacity   = 1
    projection_type = "ALL"
    hash_key        = "owner"
    range_key       = "agencyId"
  }
}
