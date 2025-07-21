terraform {
  required_version = ">= 1.0"
  required_providers {
    ovh = {
      source  = "ovh/ovh"
      version = "~> 2.5.0"
    }
  }
}

# Configure the OVH Provider
provider "ovh" {
  endpoint           = var.ovh_endpoint
  application_key    = var.ovh_application_key
  application_secret = var.ovh_application_secret
  consumer_key       = var.ovh_consumer_key
}

# Get OVH project
data "ovh_cloud_project" "project" {
  service_name = var.ovh_project_id
}

# Create SSH key
resource "ovh_cloud_project_ssh_key" "avalanche_key" {
  service_name = data.ovh_cloud_project.project.service_name
  name         = "avalanche-reporter-key"
  public_key   = file(var.ssh_public_key_path)
}

# Create instance
resource "ovh_cloud_project_instance" "avalanche_server" {
  service_name = data.ovh_cloud_project.project.service_name
  name         = "avalanche-reporter"
  region       = var.region
  billing_period = "monthly"

  flavor {
    flavor_id = var.flavor_id
  }

  boot_from {
    image_id = var.image_id
  }

  network {
    public = true
  }

  ssh_key {
    name = ovh_cloud_project_ssh_key.avalanche_key.name
  }

  user_data = templatefile("${path.module}/cloud-init.yaml", {
    domain_name = var.domain_name
    ssh_public_key = file(var.ssh_public_key_path)
  })
}

# Output server information
output "server_ip" {
  description = "Server IP address"
  value       = [for addr in ovh_cloud_project_instance.avalanche_server.addresses : addr.ip if addr.version == 4][0]
}

output "ssh_command" {
  description = "SSH command to connect to server"
  value       = "ssh avalanche@${[for addr in ovh_cloud_project_instance.avalanche_server.addresses : addr.ip if addr.version == 4][0]}"
}

output "application_url" {
  description = "Application URL"
  value       = "http://${[for addr in ovh_cloud_project_instance.avalanche_server.addresses : addr.ip if addr.version == 4][0]}"
}

output "instance_id" {
  description = "Instance ID"
  value       = ovh_cloud_project_instance.avalanche_server.id
}

output "deployment_notes" {
  description = "Important deployment notes"
  value = <<-EOT
    🚀 VPS created successfully!
    
    📋 Next steps:
    1. SSH to server: ssh avalanche@${[for addr in ovh_cloud_project_instance.avalanche_server.addresses : addr.ip if addr.version == 4][0]}
  EOT
}
