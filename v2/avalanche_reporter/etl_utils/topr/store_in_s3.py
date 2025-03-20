# etl_utils/minio_store.py

import datetime
import boto3
import base64

def store_in_minio(html_str: str, pdf_encoded: str,
                   minio_endpoint: str,
                   minio_access_key: str,
                   minio_secret_key: str,
                   bucket_name: str
                   ) -> dict:
    """
    Store raw HTML and PDF in MinIO, using a date-partitioned path.
    Args:
        html_str: HTML content fetched from the TOPR website.
        pdf_encoded: PDF file content (None if no PDF found).
        minio_endpoint: e.g., "http://minio:9000"
        minio_access_key: MinIO access key
        minio_secret_key: MinIO secret key
        bucket_name: Name of the bucket to store in (e.g., "topr-lake")
    Returns:
        dict: A dictionary with the keys for the stored objects, e.g.,
              {"html_key": "...", "pdf_key": "..."}
    """
    s3_client = boto3.client(
        "s3",
        endpoint_url=minio_endpoint,
        aws_access_key_id=minio_access_key,
        aws_secret_access_key=minio_secret_key
    )

    today = datetime.date.today()
    partition_prefix = f"raw/topr/{today.year}/{today.month:02d}/{today.day:02d}"

    html_key = f"{partition_prefix}/report.html"
    s3_client.put_object(
        Bucket=bucket_name,
        Key=html_key,
        Body=html_str.encode("utf-8"),
        ContentType="text/html"
    )

    pdf_key = None
    pdf_bytes = base64.b64decode(pdf_encoded)
    if pdf_bytes:
        pdf_key = f"{partition_prefix}/report.pdf"
        s3_client.put_object(
            Bucket=bucket_name,
            Key=pdf_key,
            Body=pdf_bytes,
            ContentType="application/pdf"
        )

    return {"html_key": html_key, "pdf_key": pdf_key}
