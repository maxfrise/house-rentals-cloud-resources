resource "aws_s3_bucket" "lambda_bucket" {
  bucket = var.bucket_name

  tags = var.tags
}