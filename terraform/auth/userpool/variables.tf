variable "user_pool_name" {
  description = "The name of the user pool"
  type        = string
}

variable "number_schemas" {
  description = "A container with the number schema attributes of a user pool. Maximum of 50 attributes"
  type        = list(any)
  default     = []
}

variable "string_schemas" {
  description = "A container with the string schema attributes of a user pool. Maximum of 50 attributes"
  type        = list(any)
  default     = []
}

variable "clients" {
  description = "A container with the clients definitions"
  type        = any
  default     = []
}

variable "domain" {
  description = "Cognito User Pool domain"
  type        = string
  default     = null
}

variable "domain_certificate_arn" {
  description = "The ARN of an issued ACM certificate in us-east-1 for a custom domain"
  type        = string
  default     = null
}

variable "tags" {
  description = "A mapping of tags to be assigned to the User Pool"
  type        = map(string)
  default     = {}
}