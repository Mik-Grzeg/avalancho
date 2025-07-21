# OVH Cloud Deployment for Avalanche Reporter

Simple Terraform configuration to deploy Avalanche Reporter on OVH Cloud.

## 🚀 Quick Deploy

### 1. Get OVH API Credentials

1. Go to [OVH API Token Generator](https://api.ovh.com/createToken/)
2. Create a new token with these rights:
   - `GET /cloud/project/*`
   - `POST /cloud/project/*`
   - `PUT /cloud/project/*`
   - `DELETE /cloud/project/*`
   - `GET /auth/time`
3. Note down: Application Key, Application Secret, Consumer Key

### 2. Get OVH Project ID

1. Go to [OVH Cloud Console](https://www.ovh.com/manager/public-cloud/)
2. Note your Project ID (visible in URL or project settings)

### 3. Configure Deployment

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit with your credentials
vim terraform.tfvars
```

**Required changes:**
```hcl
ovh_application_key = "your-actual-application-key"
ovh_application_secret = "your-actual-application-secret"
ovh_consumer_key = "your-actual-consumer-key"
ovh_project_id = "your-actual-project-id"
domain_name = "your-actual-domain.com"
```

### 4. Deploy

```bash
# Initialize Terraform
terraform init

# Deploy
terraform apply
```

### 5. Access Your Server

**SSH to server:**
```bash
ssh avalanche@$(terraform output -raw server_ip)
```

**Check application status:**
```bash
docker-compose -f /opt/avalanche-reporter/docker-compose.prod.yaml -f airflow/docker-compose.yaml ps
```

## 📋 What Gets Deployed

- **VPS**: Ubuntu 22.04 with 2GB RAM, 20GB SSD
- **Location**: Warsaw, Poland (WAW1)
- **Services**: 
  - Frontend (React)
  - Backend API (FastAPI)
  - MinIO (Object Storage)
  - Airflow (Data Pipeline)
  - Nginx (Reverse Proxy)

## 🔧 Useful Commands

```bash
# View logs
docker-compose -f /opt/avalanche-reporter/docker-compose.prod.yaml -f airflow/docker-compose.yaml logs -f

# Restart application
sudo systemctl restart avalanche-reporter

# Check systemd service
sudo systemctl status avalanche-reporter

# Destroy infrastructure
terraform destroy
```

## 🆘 Troubleshooting

**SSH connection fails:**
```bash
# Check server IP
terraform output server_ip

# Wait a few minutes for cloud-init to complete
```

**Application not accessible:**
```bash
# SSH to server and check logs
ssh avalanche@$(terraform output -raw server_ip)
``` 