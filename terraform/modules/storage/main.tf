resource "google_storage_bucket" "code" {
  name          = var.code_bucket_name
  location      = var.region
  storage_class = "STANDARD"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket" "reports" {
  name          = var.reports_bucket_name
  location      = var.region
  storage_class = "STANDARD"
  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

resource "google_storage_bucket_iam_binding" "public_reports" {
  bucket = google_storage_bucket.reports.name
  role   = "roles/storage.objectViewer"
  members = ["allUsers"]
}
