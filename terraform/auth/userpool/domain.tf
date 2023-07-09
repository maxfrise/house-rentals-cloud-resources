resource "aws_cognito_user_pool_domain" "domain" {
  domain          = var.domain
  certificate_arn = var.domain_certificate_arn
  user_pool_id    = aws_cognito_user_pool.users_pool.id
}
