variable "cloud_function_name" {
  description = "Name of the Cloud Function"
  type        = string
}

variable "code_bucket_name" {
  description = "Bucket name for source code"
  type        = string
}

variable "reports_bucket_name" {
  description = "Bucket name for PDF reports"
  type        = string
}

variable "db_instance" {
  description = "Cloud SQL instance connection name"
  type        = string
}

variable "gcp_project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Region for the Cloud Function"
  type        = string
}
