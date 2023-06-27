output "lambda_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.agencies_lambda.function_name
}

output "lambda_invoke_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.agencies_lambda.invoke_arn
}
