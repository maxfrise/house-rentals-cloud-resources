output "arn" {
  description = "ARN of the bucket"
  value       = aws_s3_bucket.lambda_bucket.arn
}

output "name" {
  description = "Name (id) of the bucket"
  value       = aws_s3_bucket.lambda_bucket.id
}