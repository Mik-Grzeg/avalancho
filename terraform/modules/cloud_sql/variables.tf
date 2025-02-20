variable "db_instance_name" {
  description = "Cloud SQL instance name"
  type        = string
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
}

variable "db_user" {
  description = "Database user for Cloud SQL"
  type        = string
}

variable "region" {
  description = "Region for the Cloud SQL instance"
  type        = string
}

variable "secret_name" {
  description = "Secret Manager secret for DB password"
  type        = string
}

variable "db_password" {
  description = "Database password for the PostgreSQL user"
  type        = string
  sensitive   = true
}
