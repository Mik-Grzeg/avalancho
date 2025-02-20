resource "google_cloud_scheduler_job" "scraper_schedule" {
  name        = var.cloud_scheduler_name
  region      = var.region
  schedule    = "0 0 * * *"
  time_zone   = "UTC"

  http_target {
    uri         = var.function_url
    http_method = "POST"
    oidc_token {
      service_account_email = "cloudscheduler@${var.gcp_project_id}.iam.gserviceaccount.com"
    }
  }
}
