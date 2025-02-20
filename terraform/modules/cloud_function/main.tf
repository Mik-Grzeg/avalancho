resource "google_cloudfunctions_function" "avalanche_scraper" {
  name        = var.cloud_function_name
  runtime     = "python39"
  region      = var.region
  source_archive_bucket = var.code_bucket_name
  source_archive_object = "scraper_source.zip"
  entry_point = "avalanche_scraper"

  environment_variables = {
    DB_INSTANCE   = var.db_instance
    REPORTS_BUCKET = var.reports_bucket_name
    GCP_PROJECT   = var.gcp_project_id
  }

  trigger_http = true
}

resource "google_storage_bucket_object" "source_code" {
  name   = "scraper_source.zip"
  bucket = var.code_bucket_name
  source = "../scraper_source.zip"
}
