"""
Context-managed SQLAlchemy connection.
"""

from pathlib import Path
from contextlib import contextmanager
from sqlalchemy import create_engine

DB_FILE = Path("/app/data/avalanche_reports.sqlite")  # SQLite database file
engine = create_engine(f"sqlite:///{DB_FILE}", future=True)  # SQLAlchemy Engine


@contextmanager
def get_conn():
    with engine.connect() as conn:
        yield conn  # Yield the SQLAlchemy connection
