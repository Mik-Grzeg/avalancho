"""
S3/MinIO utility functions for the API.
"""

import boto3
import os
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO

# Get S3/MinIO configuration from environment variables
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "http://minio:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "")
MINIO_BUCKET = os.environ.get("MINIO_BUCKET", "avalanche-lake")


def get_s3_client():
    """
    Create and return an S3 client configured to connect to MinIO.
    """
    return boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
    )


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
        response = s3_client.get_object(Bucket=MINIO_BUCKET, Key=key_path)

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
