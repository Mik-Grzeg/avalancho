import React, { useMemo } from 'react';
import { HistoryItem, Report } from '../types';
import { getDangerLevelColor, getDangerLevelText } from '../utils/format';
import { BarChart, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatisticsPanelProps {
  reports: Report[];
  isLoading: boolean;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ reports, isLoading }) => {
  // Flatten all history items from reports, including the main report danger level
  const historyData: HistoryItem[] = useMemo(() => {
    return reports.map(report => ({
      date: report.expires_at,
      level: report.mst_level,
      wet: report.mst_wet || ''
    }));
  }, [reports]);

  const stats = useMemo(() => {
    if (!historyData.length) return null;

    // Calculate distribution
    const distribution = historyData.reduce((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Calculate trend (last 7 days vs previous 7 days)
    const sortedData = [...historyData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const last7Days = sortedData.slice(0, 7);
    const previous7Days = sortedData.slice(7, 14);

    const currentAvg = last7Days.reduce((sum, item) => sum + item.level, 0) / last7Days.length;
    const previousAvg = previous7Days.reduce((sum, item) => sum + item.level, 0) / previous7Days.length;
    
    const trend = currentAvg - previousAvg;

    return {
      distribution,
      trend,
      currentAvg,
      maxLevel: Math.max(...historyData.map(item => item.level))
    };
  }, [historyData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-6">
        <BarChart className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-xl font-semibold">Risk Analysis</h2>
      </div>

      {/* Warning Banner for High Risk */}
      {stats.maxLevel >= 4 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                High avalanche risk detected in recent periods. Exercise extreme caution.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Risk Level Distribution</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(level => (
              <div key={level} className="flex items-center">
                <div className="w-24 text-sm">{getDangerLevelText(level)}</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getDangerLevelColor(level)}`}
                    style={{ 
                      width: `${((stats.distribution[level] || 0) / historyData.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="w-16 text-right text-sm text-gray-500">
                  {Math.round((stats.distribution[level] || 0) / historyData.length * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-4">7-Day Trend Analysis</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Risk Level</p>
              <p className="text-2xl font-semibold">{stats.currentAvg.toFixed(1)}</p>
            </div>
            <div className={`flex items-center ${
              stats.trend > 0 ? 'text-red-500' : 
              stats.trend < 0 ? 'text-green-500' : 
              'text-gray-500'
            }`}>
              {stats.trend > 0 ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : stats.trend < 0 ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : (
                <Minus className="h-5 w-5" />
              )}
              <span className="ml-1 font-medium">
                {Math.abs(stats.trend).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;