import { Report, HistoryItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Function to fetch recent reports
export async function fetchRecentReports(limit = 10): Promise<Report[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
}

// Function to fetch a specific report by ID
export async function fetchReportById(reportId: number): Promise<Report> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching report with ID ${reportId}:`, error);
    throw error;
  }
}

// Function to fetch reports for a specific date range
export async function fetchReportsByDateRange(start?: string, end?: string, limit = 50): Promise<Report[]> {
  try {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/api/reports${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching reports by date range:', error);
    throw error;
  }
}

// Utility to download PDF for a report by ID
export function downloadReportPdf(reportId?: number | null) {
  if (!reportId) return;
  const url = `${API_BASE_URL}/api/reports/${reportId}/pdf`;
  window.open(url, '_blank');
}
