# my_project/dags/topr_avalanche_dag.py

from airflow import DAG
from airflow.decorators import dag, task
from airflow.utils.dates import days_ago

import os
import datetime
from etl_utils.topr.fetch import fetch_topr_html, fetch_topr_pdf
from etl_utils.topr.store_in_s3 import store_in_minio
from etl_utils.topr.transform import parse_html, load_to_sqlite

# TODO get from envs
MINIO_ENDPOINT_URL = "http://minio:9000"
MINIO_ACCESS_KEY = "gUSR094pmiRTpvI0tQXh"
MINIO_SECRET_KEY = "c4MBP9HahdTIUPIRfTPKFI15Pl4XaPwEXaI0wqZ2"
MINIO_BUCKET = "avalanche-lake"
SQLITE_FILE = "/opt/airflow/warehouse/avalanche_reports.sqlite"  # SQLite database file

default_args = {"owner": "airflow", "retries": 1, "depends_on_past": False}


@dag(
    dag_id="topr_avalanche_dag",
    default_args=default_args,
    schedule_interval="0 0 * * *",
    start_date=days_ago(1),
    catchup=False,
)
def topr_avalanche_workflow():

    @task
    def get_html():
        return fetch_topr_html()

    @task
    def get_pdf():
        return fetch_topr_pdf()

    @task
    def store_raw(html: str, pdf: str, issued_at: str) -> dict:
        return store_in_minio(
            html_str=html,
            pdf_encoded=pdf,
            issued_at=issued_at,
            minio_endpoint=MINIO_ENDPOINT_URL,
            minio_access_key=MINIO_ACCESS_KEY,
            minio_secret_key=MINIO_SECRET_KEY,
            bucket_name=MINIO_BUCKET,
        )

    @task
    def transform(html: str) -> dict:
        data = parse_html(html)
        return data

    @task
    def enrich_with_keys(data: dict, keys: dict) -> dict:
        """
        Enrich the transformed data with keys from the store_raw task.
        """
        data["pdf_key"] = keys["pdf_key"]
        data["html_key"] = keys["html_key"]
        return data

    @task
    def load(data: dict):
        """
        Load the transformed data into the SQLite database
        """
        load_to_sqlite(data, SQLITE_FILE)

    html_data = get_html()
    pdf_data = get_pdf()

    transformed_data = transform(html_data)
    keys = store_raw(html_data, pdf_data, transformed_data["exp"])
    enriched_data = enrich_with_keys(transformed_data, keys)
    load(enriched_data)


dag = topr_avalanche_workflow()
