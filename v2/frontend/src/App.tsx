import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DangerLevelChart from './components/DangerLevelChart';
import StatisticsPanel from './components/StatisticsPanel';
import BulletinTable from './components/BulletinTable';
import BulletinDetails from './components/BulletinDetails';
import { Report, DateRange } from './types';
import { fetchRecentReports, fetchReportById, fetchReportsByDateRange } from './utils/api';

function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [historicalReports, setHistoricalReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportsLoading, setIsReportsLoading] = useState(true);
  const [isReportDetailsLoading, setIsReportDetailsLoading] = useState(false);
  const [isHistoricalDataLoading, setIsHistoricalDataLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: '',
    end: ''
  });

  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsReportsLoading(true);
        const data = await fetchRecentReports(10);
        setReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsReportsLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    const loadHistoricalReports = async () => {
      try {
        setIsHistoricalDataLoading(true);
        // Initially fetch with no date range to get recent historical data
        const data = await fetchReportsByDateRange();
        setHistoricalReports(data);
      } catch (error) {
        console.error('Failed to load historical report data:', error);
      } finally {
        setIsHistoricalDataLoading(false);
      }
    };

    loadHistoricalReports();
  }, []);

  const handleApplyFilter = async () => {
    try {
      setIsHistoricalDataLoading(true);
      const data = await fetchReportsByDateRange(dateRange.start, dateRange.end);
      setHistoricalReports(data);
    } catch (error) {
      console.error('Failed to filter historical data:', error);
    } finally {
      setIsHistoricalDataLoading(false);
    }
  };

  const handleViewDetails = async (reportId: number) => {
    try {
      setIsReportDetailsLoading(true);
      setIsModalOpen(true);
      const report = await fetchReportById(reportId);
      setSelectedReport(report);
    } catch (error) {
      console.error(`Failed to load report details for ID ${reportId}:`, error);
    } finally {
      setIsReportDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedReport(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        latestReport={reports.length > 0 ? reports[0] : null} 
        isLoading={isReportsLoading}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DangerLevelChart 
          reports={historicalReports}
          isLoading={isHistoricalDataLoading}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onApplyFilter={handleApplyFilter}
        />
        
        <StatisticsPanel 
          reports={historicalReports}
          isLoading={isHistoricalDataLoading}
        />
        
        <BulletinTable 
          reports={reports}
          isLoading={isReportsLoading}
          onViewDetails={handleViewDetails}
        />
        
        <BulletinDetails 
          report={selectedReport}
          isOpen={isModalOpen}
          isLoading={isReportDetailsLoading}
          onClose={handleCloseDetails}
        />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Avalanche-Risk Dashboard - Data provided by TOPR (Tatra Mountain Rescue Service)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;