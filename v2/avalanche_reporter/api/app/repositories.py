"""
Every function receives an *open* SQLAlchemy connection and
returns plain Python objects – no FastAPI imports.
"""

from datetime import date
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy import select, and_

# Import the models from the shared module
from app.shared.models import reports, history, Report, History


def list_reports(conn, start=None, end=None, level=None, limit=50) -> List[Report]:
    """
    List reports with optional filters for date range and level.
    Returns a list of raw report dictionaries from the database.
    """
    # Query the full reports table - we'll do the mapping in the router
    query = select(reports)

    filters = []
    if start:
        filters.append(reports.c.exp >= start)
    if end:
        filters.append(reports.c.exp <= end)
    if level:
        filters.append(reports.c.mst_lev == level)
    if filters:
        query = query.where(and_(*filters))
    query = query.order_by(reports.c.iat.desc()).limit(limit)

    result = conn.execute(query).all()
    return result


def fetch_report(conn, report_id) -> Optional[Tuple[Report, List[History]]]:
    """
    Fetch a single report by its ID, including its history.
    """
    # Fetch the main report
    query = select(reports).where(reports.c.id == report_id)
    report = conn.execute(query).fetchone()
    if not report:
        return None

    # Fetch the associated history
    history = fetch_history(conn, report_id)

    return (report, history)


def fetch_history(conn, report_id) -> List[History]:
    """
    Fetch the history for a specific report by its ID.
    """
    query = (
        select(history)
        .where(history.c.report_id == report_id)
        .order_by(history.c.dat.asc())
    )
    history_results = conn.execute(query).all()
    return history_results


def fetch_full_history(conn, start=None, end=None):
    """
    Fetch all history records with optional filters for date range.
    """
    query = select(
        history.c.dat,
        history.c.lev,
        history.c.wet,
        reports.c.id.label("report_id"),
        reports.c.iss,
        reports.c.sub,
    ).join(reports, history.c.report_id == reports.c.id)

    filters = []
    if start:
        filters.append(history.c.dat >= start)
    if end:
        filters.append(history.c.dat <= end)
    if filters:
        query = query.where(and_(*filters))
    query = query.order_by(history.c.dat.asc())
    result = conn.execute(query).all()
    return result


def fetch_reports_by_expiry(conn, expiry_date, limit=10) -> List[Report]:
    """
    Fetch reports that expire on a specific date.

    Args:
        conn: SQLAlchemy connection
        expiry_date: Date when reports expire
        limit: Maximum number of reports to return

    Returns:
        A list of reports expiring on the specified date
    """
    # We use DATE() function to compare only the date part
    query = (
        select(reports)
        .where(
            # SQLite-specific date extraction - adjust if using a different DB engine
            reports.c.exp.between(
                # Start of the day
                expiry_date.replace(hour=0, minute=0, second=0),
                # End of the day
                expiry_date.replace(hour=23, minute=59, second=59),
            )
        )
        .order_by(reports.c.exp.asc())
        .limit(limit)
    )

    result = conn.execute(query).all()
    return result
