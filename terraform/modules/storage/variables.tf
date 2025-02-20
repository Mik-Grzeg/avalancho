variable "code_bucket_name" {
  description = "Bucket name for source code"
  type        = string
}

variable "reports_bucket_name" {
  description = "Bucket name for PDF reports"
  type        = string
}

variable "region" {
  description = "Region for the buckets"
  type        = string
}
