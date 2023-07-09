resource "aws_cognito_user_pool_client" "client" {
  count = length(local.clients_parsed)

  allowed_oauth_flows                  = lookup(element(local.clients_parsed, count.index), "allowed_oauth_flows", null)
  allowed_oauth_flows_user_pool_client = lookup(element(local.clients_parsed, count.index), "allowed_oauth_flows_user_pool_client", null)
  allowed_oauth_scopes                 = lookup(element(local.clients_parsed, count.index), "allowed_oauth_scopes", null)
  auth_session_validity                = 3
  callback_urls                        = lookup(element(local.clients_parsed, count.index), "callback_urls", null)
  default_redirect_uri                 = lookup(element(local.clients_parsed, count.index), "default_redirect_uri", null)
  explicit_auth_flows                  = lookup(element(local.clients_parsed, count.index), "explicit_auth_flows", null)
  generate_secret                      = lookup(element(local.clients_parsed, count.index), "generate_secret", null)
  logout_urls                          = lookup(element(local.clients_parsed, count.index), "logout_urls", null)
  name                                 = lookup(element(local.clients_parsed, count.index), "name", null)
  read_attributes                      = lookup(element(local.clients_parsed, count.index), "read_attributes", null)
  access_token_validity                = lookup(element(local.clients_parsed, count.index), "access_token_validity", null)
  id_token_validity                    = lookup(element(local.clients_parsed, count.index), "id_token_validity", null)
  refresh_token_validity               = lookup(element(local.clients_parsed, count.index), "refresh_token_validity", null)
  supported_identity_providers         = lookup(element(local.clients_parsed, count.index), "supported_identity_providers", null)
  prevent_user_existence_errors        = lookup(element(local.clients_parsed, count.index), "prevent_user_existence_errors", null)
  write_attributes                     = lookup(element(local.clients_parsed, count.index), "write_attributes", null)
  enable_token_revocation              = true
  user_pool_id                         = aws_cognito_user_pool.users_pool.id

  # token_validity_units
  dynamic "token_validity_units" {
    for_each = length(lookup(element(local.clients_parsed, count.index), "token_validity_units", {})) == 0 ? [] : [lookup(element(local.clients_parsed, count.index), "token_validity_units")]
    content {
      access_token  = lookup(token_validity_units.value, "access_token", null)
      id_token      = lookup(token_validity_units.value, "id_token", null)
      refresh_token = lookup(token_validity_units.value, "refresh_token", null)
    }
  }
}

locals {
  clients_parsed = [for e in var.clients : {
    allowed_oauth_flows                  = lookup(e, "allowed_oauth_flows", null)
    allowed_oauth_flows_user_pool_client = lookup(e, "allowed_oauth_flows_user_pool_client", null)
    allowed_oauth_scopes                 = lookup(e, "allowed_oauth_scopes", null)
    callback_urls                        = lookup(e, "callback_urls", null)
    default_redirect_uri                 = lookup(e, "default_redirect_uri", null)
    explicit_auth_flows                  = lookup(e, "explicit_auth_flows", null)
    generate_secret                      = lookup(e, "generate_secret", null)
    logout_urls                          = lookup(e, "logout_urls", null)
    name                                 = lookup(e, "name", null)
    read_attributes                      = lookup(e, "read_attributes", null)
    access_token_validity                = lookup(e, "access_token_validity", null)
    id_token_validity                    = lookup(e, "id_token_validity", null)
    refresh_token_validity               = lookup(e, "refresh_token_validity", null)
    token_validity_units                 = lookup(e, "token_validity_units", {})
    supported_identity_providers         = lookup(e, "supported_identity_providers", null)
    prevent_user_existence_errors        = lookup(e, "prevent_user_existence_errors", null)
    write_attributes                     = lookup(e, "write_attributes", null)
    }
  ]
}
