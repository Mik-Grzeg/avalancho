# etl_utils/topr_transform.py

import json
import re
import pandas as pd
from bs4 import BeautifulSoup
import sqlite3
from datetime import datetime
import inspect
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from shared.models import Report, History, Base


def parse_html(html_str: str) -> dict:
    """
    Parse the HTML to extract avalanche data (JSON or structured content).
    Example: if there's a <script id="avalanche-data"> containing JSON.

    Returns:
        dict: The parsed avalanche data in dictionary form.
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
                data = json.loads(json_str)
                print(f"Parsed data: {data}")
                return data
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
        else:
            print("Could not find oLawReport JSON object.")


def load_to_sqlite(data: dict, sqlite_file: str) -> None:
    """
    Load the given data into SQLite tables using SQLAlchemy ORM entities.
    Args:
        data: The parsed avalanche data in dictionary form.
        sqlite_file: Path to the SQLite file (e.g., /opt/airflow/warehouse/avalanche_reports.sqlite)
    """
    print(f"Data before processing: {data}")

    # Create SQLAlchemy engine with the detect_types parameter for legacy mode
    engine = create_engine(
        f"sqlite:///{sqlite_file}",
        connect_args={"detect_types": sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES},
    )

    # Create tables if they don't exist
    Base.metadata.create_all(engine)

    # Create a session factory
    Session = sessionmaker(bind=engine)
    session = Session()

    # Extract history data before creating the main report
    history_data = data.pop("history", [])

    # Handle mst_desc0.a field renaming
    if "mst" in data and "desc0.a" in data["mst"]:
        data["mst"]["desc0_a"] = data["mst"].pop("desc0.a")

        # Create a new Report entity object
        report = Report(
            # Main report fields
            iss=data.get("iss"),
            sub=data.get("sub"),
            iat=datetime.fromisoformat(data.get("iat")),
            exp=datetime.fromisoformat(data.get("exp")),
            iby=data.get("iby"),
            crc=data.get("crc"),
            comment=data.get("comment"),
            rights=data.get("rights"),
            pdf_key=data.get("pdf_key"),
            html_key=data.get("html_key"),
            # Master section
            mst_lev=data.get("mst", {}).get("lev"),
            mst_wet=data.get("mst", {}).get("wet"),
            mst_tnd=data.get("mst", {}).get("tnd"),
            mst_img=data.get("mst", {}).get("img"),
            mst_desc0=data.get("mst", {}).get("desc0"),
            mst_desc1=data.get("mst", {}).get("desc1"),
            mst_desc2=data.get("mst", {}).get("desc2"),
            mst_desc0_a=data.get("mst", {}).get("desc0_a"),
            # AM section
            am_mode=data.get("am", {}).get("mode"),
            am_height=data.get("am", {}).get("height"),
            am_img=data.get("am", {}).get("img"),
            am_upper_lev=data.get("am", {}).get("upper", {}).get("lev"),
            am_upper_wet=data.get("am", {}).get("upper", {}).get("wet"),
            am_upper_prb=data.get("am", {}).get("upper", {}).get("prb"),
            am_upper_exp=data.get("am", {}).get("upper", {}).get("exp"),
            am_lower_lev=data.get("am", {}).get("lower", {}).get("lev"),
            am_lower_wet=data.get("am", {}).get("lower", {}).get("wet"),
            am_lower_prb=data.get("am", {}).get("lower", {}).get("prb"),
            am_lower_exp=data.get("am", {}).get("lower", {}).get("exp"),
            # PM section
            pm_mode=data.get("pm", {}).get("mode"),
            pm_height=data.get("pm", {}).get("height"),
            pm_img=data.get("pm", {}).get("img"),
            pm_upper_lev=data.get("pm", {}).get("upper", {}).get("lev"),
            pm_upper_wet=data.get("pm", {}).get("upper", {}).get("wet"),
            pm_upper_prb=data.get("pm", {}).get("upper", {}).get("prb"),
            pm_upper_exp=data.get("pm", {}).get("upper", {}).get("exp"),
            pm_lower_lev=data.get("pm", {}).get("lower", {}).get("lev"),
            pm_lower_wet=data.get("pm", {}).get("lower", {}).get("wet"),
            pm_lower_prb=data.get("pm", {}).get("lower", {}).get("prb"),
            pm_lower_exp=data.get("pm", {}).get("lower", {}).get("exp"),
        )

        # Use the new pretty_print method
        report.pretty_print()

        # Add the report to the session
        session.add(report)
        session.flush()  # This will assign an ID to the report

        # Create History entities for each history item
        for hist_item in history_data:
            history = History(
                report_id=report.id,
                dat=datetime.fromisoformat(hist_item.get("dat")),
                lev=hist_item.get("lev"),
                wet=hist_item.get("wet"),
            )

            # Pretty print the first history object
            if history_data.index(hist_item) == 0:
                history.pretty_print()

            session.add(history)

        # Commit all changes
        session.commit()
        print(
            f"Successfully added Report with ID {report.id} and {len(history_data)} history records to database"
        )

        session.close()
