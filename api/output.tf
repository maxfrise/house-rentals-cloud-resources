output "api_gateway_execution_arn" {
  value = aws_api_gateway_rest_api.api_v2.execution_arn
}

output "curl_stage_invoke_url" {
  description = "API Gateway Stage Test Invoke URL"
  value       = "curl ${aws_api_gateway_stage.test_stage.invoke_url}/{resource}}"
}