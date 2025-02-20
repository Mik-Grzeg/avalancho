variable "cloud_scheduler_name" {
  description = "Name of the Cloud Scheduler job"
  type        = string
}

variable "function_url" {
  description = "URL of the Cloud Function"
  type        = string
}

variable "gcp_project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Region for the Cloud Scheduler job"
  type        = string
}
