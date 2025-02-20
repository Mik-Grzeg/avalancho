output "code_bucket_name" {
  value = module.storage.code_bucket_name
}

output "reports_bucket_name" {
  value = module.storage.reports_bucket_name
}

output "secret_name" {
  value = module.secret_manager.secret_name
}

output "db_instance" {
  value = module.cloud_sql.db_instance
}

output "function_url" {
  value = module.cloud_function.function_url
}
