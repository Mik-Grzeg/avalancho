output "db_instance" {
  value = google_sql_database_instance.avalanche_db.connection_name
}
