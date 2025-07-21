variable "ovh_endpoint" {
  description = "OVH API endpoint"
  type        = string
  default     = "ovh-eu"  # ovh-eu, ovh-ca, ovh-us, kimsufi-eu, kimsufi-ca, soyoustart-eu, soyoustart-ca
}

variable "ovh_application_key" {
  description = "OVH Application Key"
  type        = string
  sensitive   = true
}

variable "ovh_application_secret" {
  description = "OVH Application Secret"
  type        = string
  sensitive   = true
}

variable "ovh_consumer_key" {
  description = "OVH Consumer Key"
  type        = string
  sensitive   = true
}

variable "ovh_project_id" {
  description = "OVH Cloud Project ID"
  type        = string
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "ssh_user" {
  description = "SSH user for the server"
  type        = string
  default     = "ubuntu"
}

variable "flavor_id" {
  description = "OVH flavor ID (instance type)"
  type        = string
  default     = "s1-2"  # 2GB RAM, 20GB SSD - €3.50/month
}

variable "image_id" {
  description = "OVH image ID (Ubuntu 22.04)"
  type        = string
  # You need to get this from OVH console or API
  # Example: "Ubuntu 22.04" image ID
}

variable "region" {
  description = "OVH datacenter region"
  type        = string
  default     = "WAW1"  # Warsaw, Poland (for Polish users)
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "avalanche-reporter.local"
} 