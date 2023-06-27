output "arn" {
  description = "ARN of the iam lambdas role"
  value       = aws_iam_role.iam_maxfrise_lambdas.arn
}
