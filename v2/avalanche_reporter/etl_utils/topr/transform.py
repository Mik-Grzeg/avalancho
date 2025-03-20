# etl_utils/topr_transform.py

import json
import re
import json
import duckdb
import pandas as pd
from bs4 import BeautifulSoup

def parse_html(html_str: str) -> pd.DataFrame:
    """
    Parse the HTML to extract avalanche data (JSON or structured content).
    Example: if there's a <script id="avalanche-data"> containing JSON.
    
    Returns:
        pd.DataFrame: The parsed avalanche data in tabular form.
    """
    soup = BeautifulSoup(html_str, "html.parser")
    script_tag = soup.find("script", text=re.compile(r"const\s+oLawReport\s*="))
    if script_tag:
        script_text = script_tag.string
        pattern = r"const\s+oLawReport\s*=\s*(\{.*?\});"
        match = re.search(pattern, script_text, re.DOTALL)
        if match:
            json_str = match.group(1)  # the { ... } part
            try:
                return json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
        else:
            print("Could not find oLawReport JSON object.")



def load_to_duckdb(df: pd.DataFrame, duckdb_file: str) -> None:
    """
    Load the given DataFrame into a DuckDB table named 'avalanche_data'.
    Args:
        df: The DataFrame containing avalanche data.
        duckdb_file: Path to the DuckDB file (e.g., /opt/airflow/warehouse/avalanche_reports.duckdb)
    """
    if df.empty:
        print("DataFrame is empty, nothing to load.")
        return

    con = duckdb.connect(duckdb_file)

    # Create the table if it doesn't exist
    con.execute("CREATE TABLE IF NOT EXISTS avalanche_data AS SELECT * FROM df LIMIT 0")

    # Insert data
    con.execute("INSERT INTO avalanche_data SELECT * FROM df")

    con.close()
    print(f"Loaded {len(df)} rows into DuckDB '{duckdb_file}'")
