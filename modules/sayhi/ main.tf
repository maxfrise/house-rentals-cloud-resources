resource "aws_s3_bucket" "lambda_bucket" {
  bucket = var.bucket_name

  tags = var.tags
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}