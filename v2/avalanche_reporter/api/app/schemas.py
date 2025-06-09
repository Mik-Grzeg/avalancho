from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel


class HistoryRow(BaseModel):
    date: date
    level: int
    wet: Optional[str] = ""


class ReportSummary(BaseModel):
    report_id: int
    issued_at: datetime
    expires_at: datetime
    mst_level: int
    author: str
    comment: Optional[str] = None


class Report(ReportSummary):
    mst_tendency: Optional[int] = None
    mst_wet: Optional[str] = ""
    pdf_url: Optional[str] = None
    html_url: Optional[str] = None
    history: List[HistoryRow] = []
