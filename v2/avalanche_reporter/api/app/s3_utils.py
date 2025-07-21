"""
S3/MinIO utility functions for the API.
"""

import boto3
import os
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO

# Get S3/MinIO configuration from environment variables
# Support both AWS S3 and MinIO with interchangeable credentials

# Storage type detection
STORAGE_TYPE = os.environ.get("STORAGE_TYPE", "minio").lower()  # "minio" or "s3"

# Common configuration
ACCESS_KEY = os.environ.get("ACCESS_KEY", "")
SECRET_KEY = os.environ.get("SECRET_KEY", "")
BUCKET_NAME = os.environ.get("BUCKET_NAME", "avalanche-lake")

# MinIO specific configuration
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "http://minio:9000")

# AWS S3 specific configuration
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY", "")

# Cloudflare R2 specific configuration
R2_ENDPOINT = os.environ.get("R2_ENDPOINT", None)


def get_s3_client():
    """
    Create and return an S3 client configured to connect to MinIO, AWS S3, or Cloudflare R2.
    """
    config = {}
    
    if STORAGE_TYPE == "minio":
        # MinIO configuration
        config.update({
            "endpoint_url": MINIO_ENDPOINT,
            "aws_access_key_id": ACCESS_KEY,
            "aws_secret_access_key": SECRET_KEY,
        })
    elif STORAGE_TYPE == "s3":
        # AWS S3 configuration
        config.update({
            "region_name": AWS_REGION,
            "aws_access_key_id": AWS_ACCESS_KEY_ID or ACCESS_KEY,
            "aws_secret_access_key": AWS_SECRET_ACCESS_KEY or SECRET_KEY,
        })
    elif STORAGE_TYPE == "r2":
        # Cloudflare R2 configuration
        config.update({
            "endpoint_url": R2_ENDPOINT,
            "region_name": "auto",
            "aws_access_key_id": ACCESS_KEY,
            "aws_secret_access_key": SECRET_KEY,
        })
    else:
        raise ValueError(f"Unsupported storage type: {STORAGE_TYPE}")
    
    return boto3.client("s3", **config)


def get_file_from_s3(key_path: str):
    """
    Fetch a file from S3/MinIO.

    Args:
        key_path: The key (path) to the file in the bucket

    Returns:
        StreamingResponse with the file content

    Raises:
        HTTPException: If the file is not found or other S3 errors occur
    """
    s3_client = get_s3_client()

    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=key_path)

        # Get the file content
        file_content = response["Body"].read()

        # Create a BytesIO object for streaming
        file_stream = BytesIO(file_content)

        # Determine content type based on file extension (default to application/pdf)
        content_type = "application/pdf"
        if key_path.endswith(".html"):
            content_type = "text/html"

        # Return as a streaming response
        return StreamingResponse(
            file_stream,
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={os.path.basename(key_path)}"
            },
        )

    except s3_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching file: {str(e)}")
