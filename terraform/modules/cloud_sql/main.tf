# Create Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "avalanche_db" {
  name             = var.db_instance_name
  database_version = "POSTGRES_14"
  region           = var.region

  settings {
    tier = "db-f1-micro"  # Free Tier
    ip_configuration {
      ipv4_enabled = true
    }
  }
}

# Create PostgreSQL Database
resource "google_sql_database" "avalanche_db" {
  name     = var.db_name
  instance = google_sql_database_instance.avalanche_db.name
}

# Create PostgreSQL User
resource "google_sql_user" "db_user" {
  name     = var.db_user
  instance = google_sql_database_instance.avalanche_db.name
  password = var.db_password
}
