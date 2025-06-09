from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from contextlib import contextmanager
from fastapi.responses import StreamingResponse

from .database import get_conn
from .schemas import ReportSummary, Report, HistoryRow
from . import repositories as repo
from .s3_utils import get_file_from_s3

router = APIRouter(prefix="/api", tags=["avalanches"])


# FastAPI injects an open, read-only DuckDB connection **per request**
def conn_dep():
    with get_conn() as conn:
        yield conn  # properly yield the SQLite connection


@router.get("/reports", response_model=List[ReportSummary])
def reports(
    start: date | None = Query(
        None, description="Start date for filtering reports (inclusive)"
    ),
    end: date | None = Query(
        None, description="End date for filtering reports (inclusive)"
    ),
    level: int | None = Query(
        None, ge=1, le=5, description="Filter by avalanche danger level (1-5)"
    ),
    limit: int | None = Query(
        50, ge=1, le=365, description="Maximum number of reports to return"
    ),
    conn=Depends(conn_dep),
):
    """
    List avalanche reports with optional filtering by date range and danger level, show history of the avalanche dangers.

    Returns a paginated list of report summaries ordered by issue date (descending).
    """
    # Get raw data from repository
    raw_reports = repo.list_reports(conn, start, end, level, limit)

    # Transform raw data into ReportSummary format
    formatted_reports = [
        ReportSummary(
            report_id=report.id,
            issued_at=report.iat,
            expires_at=report.exp,
            mst_level=report.mst_lev,
            author=report.iby,
            comment=report.comment,
        )
        for report in raw_reports
    ]

    return formatted_reports


@router.get("/reports/{report_id}", response_model=Report)
def one_report(
    report_id: int = Path(
        ..., gt=0, description="The unique ID of the report to retrieve"
    ),
    conn=Depends(conn_dep),
):
    """
    Get a single avalanche report by ID, including its detailed information and history.

    Returns the complete report with all available data fields and associated history entries.
    """
    (report, history) = repo.fetch_report(conn, report_id)
    if not report:
        raise HTTPException(404, "report not found")

    return Report(
        report_id=report.id,
        issued_at=report.iat,
        expires_at=report.exp,
        mst_level=report.mst_lev,
        author=report.iby,
        comment=report.comment,
        mst_tendency=report.mst_tnd,
        mst_wet=report.mst_wet,
        pdf_url=report.pdf_key,
        html_url=report.html_key,
        history=[
            HistoryRow(date=item.dat, level=item.lev, wet=item.wet or "")
            for item in history
        ],
    )


@router.get("/reports/{report_id}/history", response_model=List[HistoryRow])
def history_for_report(
    report_id: int = Path(..., gt=0, description="ID of the report to get history for"),
    conn=Depends(conn_dep),
):
    """
    Get historical avalanche danger data for a specific report.

    Returns a chronological list of historical avalanche danger level entries.
    """
    history = repo.fetch_history(conn, report_id)

    return [
        HistoryRow(date=item.dat, level=item.lev, wet=item.wet or "")
        for item in history
    ]


@router.get("/healthz", response_model=dict)
def healthz():
    """
    Simple health check endpoint to verify API availability.

    Returns a status object with "ok" status when the API is functioning.
    """
    return {"status": "ok"}


@router.get("/reports/{identifier}/{file_type}")
def get_report_file(identifier: str, file_type: str, conn=Depends(conn_dep)):
    """
    Unified proxy endpoint to fetch PDF or HTML reports by ID or date.

    Args:
        identifier: Either a report ID (numeric) or a date string (YYYY-MM-DD)
        file_type: Type of file to retrieve ("pdf" or "html")

    Returns:
        StreamingResponse with the requested file content
    """
    # Validate file type
    if file_type.lower() not in ["pdf", "html"]:
        raise HTTPException(
            status_code=400, detail="Invalid file type. Must be 'pdf' or 'html'"
        )

    file_type = file_type.lower()
    key_field = "pdf_key" if file_type == "pdf" else "html_key"

    # Check if the identifier is a numeric ID
    if identifier.isdigit():
        # Get the report by ID
        report_id = int(identifier)
        (report, _) = repo.fetch_report(conn, report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")

        file_key = getattr(report, key_field)
        if not file_key:
            raise HTTPException(
                status_code=404,
                detail=f"No {file_type.upper()} available for this report",
            )
    else:
        # Try to parse as a date
        try:
            # Parse date string
            search_date = date.fromisoformat(identifier)

            # Find reports for that date
            raw_reports = repo.list_reports(
                conn, start=search_date, end=search_date, limit=1
            )
            if not raw_reports:
                raise HTTPException(
                    status_code=404, detail=f"No report found for date {identifier}"
                )

            # Get the file key from the first report
            file_key = getattr(raw_reports[0], key_field)
            if not file_key:
                raise HTTPException(
                    status_code=404,
                    detail=f"No {file_type.upper()} available for date {identifier}",
                )
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid identifier format. Use numeric ID or YYYY-MM-DD date",
            )

    # Fetch and return the file
    return get_file_from_s3(file_key)


@router.get("/reports/expiry/{expiry_date}", response_model=List[ReportSummary])
def reports_by_expiry(
    expiry_date: date,
    limit: int = Query(
        10, ge=1, le=50, description="Maximum number of reports to return"
    ),
    conn=Depends(conn_dep),
):
    """
    Fetch reports that expire on the given date.

    Args:
        expiry_date: The date to check for expiring reports (YYYY-MM-DD)
        limit: Maximum number of reports to return
    """
    # Get raw data from repository
    raw_reports = repo.fetch_reports_by_expiry(conn, expiry_date, limit)

    # Transform raw data into ReportSummary format
    formatted_reports = [
        ReportSummary(
            report_id=report.id,
            issued_at=report.iat,
            expires_at=report.exp,
            mst_level=report.mst_lev,
            author=report.iby,
            comment=report.comment,
        )
        for report in raw_reports
    ]

    return formatted_reports
