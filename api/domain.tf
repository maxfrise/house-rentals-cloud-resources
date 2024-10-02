data "aws_acm_certificate" "maxfrise" {
  domain = "*.maxfrise.com"

  most_recent = true

  statuses = ["ISSUED"]
}

#
# Staging
#
resource "aws_api_gateway_domain_name" "staging_v2_domain" {
  domain_name              = "staging.apiv2.maxfrise.com"
  regional_certificate_arn =  data.aws_acm_certificate.maxfrise.arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "staging_v2_domain" {
  api_id      = aws_api_gateway_rest_api.api_v2.id
  domain_name = aws_api_gateway_domain_name.staging_v2_domain.domain_name
  stage_name  = aws_api_gateway_stage.test_stage.stage_name
}

#
# Production
#
resource "aws_api_gateway_domain_name" "production_v2_domain" {
  domain_name              = "apiv2.maxfrise.com"
  regional_certificate_arn = data.aws_acm_certificate.maxfrise.arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_base_path_mapping" "production_v2_domain" {
  api_id      = aws_api_gateway_rest_api.api_v2.id
  domain_name = aws_api_gateway_domain_name.staging_v2_domain.domain_name
  stage_name  = aws_api_gateway_stage.prod_stage.stage_name
}