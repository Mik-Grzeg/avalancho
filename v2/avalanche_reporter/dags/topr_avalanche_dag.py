# my_project/dags/topr_avalanche_dag.py

from airflow import DAG
from airflow.decorators import dag, task
from airflow.utils.dates import days_ago

import os
from etl_utils.topr.fetch import fetch_topr_html, fetch_topr_pdf
from etl_utils.topr.store_in_s3 import store_in_minio
from etl_utils.topr.transform import parse_html, load_to_duckdb

MINIO_ENDPOINT_URL = "http://minio:9000"
MINIO_ACCESS_KEY   = "gUSR094pmiRTpvI0tQXh"
MINIO_SECRET_KEY   = "c4MBP9HahdTIUPIRfTPKFI15Pl4XaPwEXaI0wqZ2"
MINIO_BUCKET       = "avalanche-lake"
DUCKDB_FILE        = "/opt/airflow/warehouse/avalanche_reports.duckdb"

default_args = {
    "owner": "airflow",
    "retries": 1,
    "depends_on_past": False
}

@dag(
    dag_id="topr_avalanche_dag",
    default_args=default_args,
    schedule_interval="0 6 * * *",
    start_date=days_ago(1),
    catchup=False
)
def topr_avalanche_workflow():

    @task
    def get_html():
        return fetch_topr_html()

    @task
    def get_pdf():
        return fetch_topr_pdf()

    @task
    def store_raw(html: str, pdf: str):
        return store_in_minio(
            html_str=html,
            pdf_encoded=pdf,
            minio_endpoint=MINIO_ENDPOINT_URL,
            minio_access_key=MINIO_ACCESS_KEY,
            minio_secret_key=MINIO_SECRET_KEY,
            bucket_name=MINIO_BUCKET
        )

    @task
    def transform(html: str):
        return parse_html(html)

    @task
    def load(data):
        # Convert back to DataFrame
        import pandas as pd
        df = pd.json_normalize(data)
        load_to_duckdb(df, DUCKDB_FILE)

    html_data = get_html()
    pdf_data  = get_pdf()

    store_raw(html_data, pdf_data)
    transformed_df_json = transform(html_data)
    load(transformed_df_json)

dag = topr_avalanche_workflow()
