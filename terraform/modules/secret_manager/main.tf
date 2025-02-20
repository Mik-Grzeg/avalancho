# Generate a Secure Password
resource "random_password" "secret_value" {
  length  = 16
  special = false
}

# Create Secret in Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = var.secret_name
  replication {
    auto {}
  }
}

# Store Secret Value
resource "google_secret_manager_secret_version" "db_password_value" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.secret_value.result
}

# Grant Access to Cloud Function
resource "google_secret_manager_secret_iam_member" "cloud_function_access" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.cloud_function_service_account}"
}
