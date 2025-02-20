variable "gcp_project_id" {
  description = "The Google Cloud project ID"
  type        = string
}

variable "gcp_region" {
  description = "The Google Cloud region for resources"
  type        = string
  default     = "europe-west3"
}

variable "code_bucket_name" {
  description = "Cloud Storage bucket for storing source code"
  type        = string
  default     = "avalanche-code-bucket"
}

variable "reports_bucket_name" {
  description = "Cloud Storage bucket for storing PDF reports"
  type        = string
  default     = "avalanche-reports-bucket"
}

variable "secret_name" {
  description = "Secret Manager secret for DB password"
  type        = string
  default     = "avalanche-db-password"
}

variable "db_instance_name" {
  description = "Cloud SQL instance name"
  type        = string
  default     = "avalanche-db"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "avalanche_db"
}

variable "db_user" {
  description = "Database user for Cloud SQL"
  type        = string
  default     = "avalanche_user"
}

variable "cloud_function_name" {
  description = "Cloud Function name"
  type        = string
  default     = "avalanche_scraper"
}

variable "cloud_scheduler_name" {
  description = "Cloud Scheduler name"
  type        = string
  default     = "daily-avalanche-scraper"
}
