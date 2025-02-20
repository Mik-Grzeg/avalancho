variable "secret_name" {
  description = "The name of the Secret Manager secret"
  type        = string
}

variable "cloud_function_service_account" {
  description = "The service account used by Cloud Function to access the secret"
  type        = string
}
