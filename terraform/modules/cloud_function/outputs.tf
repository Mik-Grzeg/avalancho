output "function_url" {
  value = google_cloudfunctions_function.avalanche_scraper.https_trigger_url
}

output "service_account" {
  value = google_cloudfunctions_function.avalanche_scraper.service_account_email
}
