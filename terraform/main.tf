provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Cloud Storage Buckets Module
module "storage" {
  source             = "./modules/storage"
  code_bucket_name   = var.code_bucket_name
  reports_bucket_name = var.reports_bucket_name
  region             = var.gcp_region
}

# Secret Manager Module
module "secret_manager" {
  source                       = "./modules/secret_manager"
  secret_name                  = var.secret_name
  cloud_function_service_account = module.cloud_function.service_account
}

# Cloud SQL Module
module "cloud_sql" {
  source             = "./modules/cloud_sql"
  db_instance_name   = var.db_instance_name
  db_name            = var.db_name
  db_user            = var.db_user
  region             = var.gcp_region
  secret_name        = module.secret_manager.secret_name
  db_password        = module.secret_manager.db_password
}

# Cloud Function Module
module "cloud_function" {
  source               = "./modules/cloud_function"
  cloud_function_name  = var.cloud_function_name
  code_bucket_name     = module.storage.code_bucket_name
  reports_bucket_name  = module.storage.reports_bucket_name
  db_instance          = module.cloud_sql.db_instance
  gcp_project_id       = var.gcp_project_id
  region               = var.gcp_region
}

# Cloud Scheduler Module
module "cloud_scheduler" {
  source               = "./modules/cloud_scheduler"
  cloud_scheduler_name = var.cloud_scheduler_name
  function_url         = module.cloud_function.function_url
  gcp_project_id       = var.gcp_project_id
  region               = var.gcp_region
}
