export interface Report {
  report_id: number;
  issued_at: string;
  expires_at: string;
  mst_level: number;
  comment: string | null;
  author: string;
  mst_tendency?: number | null;
  mst_wet?: string;
  pdf_url?: string | null;
  html_url?: string | null;
  history?: HistoryItem[];
}

export interface HistoryItem {
  date: string; // date in ISO format
  level: number; // danger level (1-5)
  wet: string; // wet conditions
}

export interface DateRange {
  start: string;
  end: string;
}