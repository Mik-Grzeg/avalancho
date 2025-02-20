output "secret_name" {
  value = google_secret_manager_secret.db_password.secret_id
}

output "secret_version" {
  value = google_secret_manager_secret_version.db_password_value.version
}

output "db_password" {
  value = google_secret_manager_secret_version.db_password_value.secret_data
  sensitive = true
}
