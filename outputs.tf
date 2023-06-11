output "sayhi_bucket_arn" {
  description = "ARN of the bucket"
  value       = module.sayhi.arn
}

output "sayhi_bucket_name" {
  description = "Name (id) of the bucket"
  value       = module.sayhi.name
}

output "sayhi_bucket_domain" {
  description = "Domain name of the bucket"
  value       = module.sayhi.domain
}