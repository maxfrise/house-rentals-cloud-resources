variable "user_pool_name" {
  description = "The name of the user pool"
  type        = string
}

variable "number_schemas" {
  description = "A container with the number schema attributes of a user pool. Maximum of 50 attributes"
  type        = list(any)
  default     = []
}

variable "clients" {
  description = "A container with the clients definitions"
  type        = any
  default     = []
}

variable "tags" {
  description = "A mapping of tags to be assigned to the User Pool"
  type        = map(string)
  default     = {}
}