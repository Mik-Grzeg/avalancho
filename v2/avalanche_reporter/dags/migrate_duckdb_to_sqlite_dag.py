from airflow import DAG
from airflow.decorators import dag, task
from airflow.utils.dates import days_ago
import duckdb
import sqlite3
import pandas as pd

DUCKDB_FILE = "/opt/airflow/warehouse/avalanche_reports.duckdb"
SQLITE_FILE = "/opt/airflow/warehouse/avalanche_reports.sqlite"

default_args = {"owner": "airflow", "retries": 1, "depends_on_past": False}


@dag(
    dag_id="migrate_duckdb_to_sqlite",
    default_args=default_args,
    schedule_interval=None,  # Run manually
    start_date=days_ago(1),
    catchup=False,
)
def migrate_duckdb_to_sqlite_workflow():

    @task
    def export_from_duckdb():
        """
        Export data from DuckDB to a CSV file.
        """
        conn = duckdb.connect(DUCKDB_FILE)
        csv_file = "/opt/airflow/warehouse/avalanche_data.csv"
        conn.execute(f"COPY avalanche_data TO '{csv_file}' (HEADER, DELIMITER ',')")
        conn.close()
        return csv_file

    @task
    def transform_and_import(csv_file: str):
        """
        Transform the data to match the new schema and import it into SQLite.
        """
        import json  # Import the JSON module for safe parsing

        # Load the CSV into a DataFrame
        df = pd.read_csv(csv_file)

        # Rename columns to match the new schema
        df.rename(columns=lambda x: x.replace(".", "_"), inplace=True)

        # Extract and normalize the "history" column into a separate DataFrame
        history_data = []
        for index, row in df.iterrows():
            print(f"{row = }")
            if pd.notna(row["history"]):  # Ensure the history column is not empty
                try:
                    history_items = json.loads(
                        row["history"]
                    )  # Safely parse the JSON string
                    for item in history_items:
                        history_data.append(
                            {
                                "avalanche_id": row["id"],
                                "dat": item.get("dat"),
                                "lev": item.get("lev"),
                                "wet": item.get("wet"),
                            }
                        )
                except json.JSONDecodeError as e:
                    print(f"Error parsing history for row {index}: {e}")

        print(history_data)
        history_df = pd.DataFrame(history_data)

        # Drop the "history" column from the main DataFrame
        df.drop(columns=["history"], inplace=True)

        # Connect to the new SQLite database
        conn = sqlite3.connect(SQLITE_FILE)

        # Insert the transformed data into the new schema
        df.to_sql("reports", conn, if_exists="replace", index=False)
        history_df.to_sql("history", conn, if_exists="replace", index=False)

        conn.close()
        print(f"Data successfully migrated to SQLite: {SQLITE_FILE}")

    # Define the workflow
    csv_file = export_from_duckdb()
    transform_and_import(csv_file)


dag = migrate_duckdb_to_sqlite_workflow()
