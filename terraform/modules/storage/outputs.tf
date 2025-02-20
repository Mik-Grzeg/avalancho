output "code_bucket_name" {
  value = google_storage_bucket.code.name
}

output "reports_bucket_name" {
  value = google_storage_bucket.reports.name
}
