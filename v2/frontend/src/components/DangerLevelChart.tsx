import React, { useEffect, useRef, useMemo } from 'react';
import { Report, HistoryItem, DateRange } from '../types';
import { formatDate } from '../utils/format';

interface DangerLevelChartProps {
  reports: Report[];
  isLoading: boolean;
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  onApplyFilter: () => void;
}

const DangerLevelChart: React.FC<DangerLevelChartProps> = ({
  reports,
  isLoading,
  dateRange,
  setDateRange,
  onApplyFilter
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  // Extract history data from reports
  const historyData: HistoryItem[] = React.useMemo(() => {
    const items: HistoryItem[] = [];
    console.log('Extracting history data from reports:', reports);
    reports.forEach(report => {
      // Add the main report danger level, using expires_at
      items.push({
        date: report.expires_at,
        level: report.mst_level,
        wet: report.mst_wet || ''
      });
      // Add all history items
      console.log('Report history:', report.history);
      if (report.history && report.history.length > 0) {
        items.push(...report.history);
      }
    });
    return items;
  }, [reports]);

  // Set initial date range to last 7 days if not set
  useEffect(() => {
    if (!dateRange.start && !dateRange.end) {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6); // last 7 days including today
      setDateRange({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      });
    }
  }, []);

  // Apply filter automatically when dateRange changes (including on mount)
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      onApplyFilter();
    }
  }, [dateRange.start, dateRange.end]);

  // Filter historyData by dateRange before charting
  const filteredHistoryData = React.useMemo(() => {
    if (!dateRange.start || !dateRange.end) return historyData;
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    // Include items where date is between start and end (inclusive)
    return historyData.filter(item => {
      const d = new Date(item.date);
      // Make end inclusive by setting time to end of day
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      return d >= startDate && d <= endOfDay;
    });
  }, [historyData, dateRange.start, dateRange.end]);

  useEffect(() => {
    if (isLoading || !filteredHistoryData.length || !chartRef.current) return;

    const loadChart = async () => {
      try {
        const Chart = await import('chart.js/auto');
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        // Clear chart container before appending new canvas
        if (chartRef.current) chartRef.current.innerHTML = '';
        const ctx = document.createElement('canvas');
        if (chartRef.current) chartRef.current.appendChild(ctx);
        // Deduplicate by date
        const processedData = filteredHistoryData
          .reduce((acc: HistoryItem[], curr) => {
            const existingIndex = acc.findIndex(item => item.date === curr.date);
            if (existingIndex === -1) {
              acc.push(curr);
            }
            return acc;
          }, [])
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const labels = processedData.map(item => formatDate(item.date));
        const dangerLevels = processedData.map(item => item.level);
        const wetConditions = processedData.map(item => item.wet === "w");

        // Create gradient colors for points based on danger level
        const colors = dangerLevels.map(level => {
          switch (level) {
            case 1: return '#8BC34A';
            case 2: return '#FFC107';
            case 3: return '#FF9800';
            case 4: return '#F44336';
            case 5: return '#B71C1C';
            default: return '#6B7280';
          }
        });

        chartInstance.current = new Chart.default(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Danger Level',
                data: dangerLevels,
                borderColor: 'rgb(75, 85, 99)',
                backgroundColor: colors,
                borderWidth: 1,
                tension: 0.1,
                pointBackgroundColor: colors,
                pointBorderColor: 'white',
                pointRadius: 6,
                pointHoverRadius: 8,
              },
              {
                label: 'Wet Conditions',
                data: wetConditions.map((wet, i) => wet ? dangerLevels[i] : null),
                pointBackgroundColor: 'rgba(59, 130, 246, 0.5)',
                pointBorderColor: 'rgb(59, 130, 246)',
                pointStyle: 'star',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 0,
                max: 5,
                ticks: {
                  stepSize: 1
                },
                title: {
                  display: true,
                  text: 'Danger Level'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Date'
                },
                ticks: {
                  maxTicksLimit: 10, // Limit the number of ticks shown
                  maxRotation: 45,
                  minRotation: 45,
                  callback: function(val, index) {
                    // Show fewer labels on mobile
                    const labels = this.getLabelForValue(val as number);
                    const totalLabels = this.chart.data.labels?.length || 0;
                    return window.innerWidth < 768 
                      ? index % Math.ceil(totalLabels / 5) === 0 ? labels : ''
                      : index % Math.ceil(totalLabels / 10) === 0 ? labels : '';
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    if (context.dataset.label === 'Wet Conditions' && context.raw !== null) {
                      return 'Wet Conditions';
                    }
                    const level = context.raw as number;
                    let label = `Danger Level: ${level}`;
                    switch (level) {
                      case 1: label += ' (Low)'; break;
                      case 2: label += ' (Moderate)'; break;
                      case 3: label += ' (Considerable)'; break;
                      case 4: label += ' (High)'; break;
                      case 5: label += ' (Extreme)'; break;
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
        
        ctx.style.opacity = '0';
        setTimeout(() => {
          ctx.style.transition = 'opacity 0.5s ease-in-out';
          ctx.style.opacity = '1';
        }, 100);
        
      } catch (error) {
        console.error('Error loading Chart.js:', error);
        if (chartRef.current) {
          chartRef.current.innerHTML = `
            <div class="p-4 bg-red-50 text-red-600 rounded-md">
              Failed to load chart. Please check the console for errors.
            </div>
          `;
        }
      }
    };

    loadChart();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, [filteredHistoryData, isLoading]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, start: e.target.value }));
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateRange(prev => ({ ...prev, end: e.target.value }));
  };

  const handleApplyFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onApplyFilter();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">Avalanche Danger Level History</h2>
      
      {/* Chart Container */}
      <div className="relative h-80 mb-6">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-full"></div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 border-t border-b border-gray-200 py-4">
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-[#8BC34A] mr-2"></span>
          <span className="text-sm">Low (1)</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-[#FFC107] mr-2"></span>
          <span className="text-sm">Moderate (2)</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-[#FF9800] mr-2"></span>
          <span className="text-sm">Considerable (3)</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-[#F44336] mr-2"></span>
          <span className="text-sm">High (4)</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 rounded-full bg-[#B71C1C] mr-2"></span>
          <span className="text-sm">Extreme (5)</span>
        </div>
        <div className="flex items-center">
          <span className="w-4 h-4 text-blue-500">★</span>
          <span className="text-sm ml-2">Wet Conditions</span>
        </div>
      </div>
      
      {/* Date Filter Controls */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row items-center justify-between pt-4">
        <div className="text-sm font-medium text-gray-500 mb-4 sm:mb-0">Filter by date range:</div>
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <label htmlFor="start-date" className="block text-xs text-gray-500">From</label>
            <input
              type="date"
              id="start-date"
              value={dateRange.start}
              onChange={handleStartDateChange}
              className="input"
            />
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="end-date" className="block text-xs text-gray-500">To</label>
            <input
              type="date"
              id="end-date"
              value={dateRange.end}
              onChange={handleEndDateChange}
              className="input"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="button-primary w-full sm:w-auto mt-3 sm:mt-6"
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};

export default DangerLevelChart;