import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Report } from '../types';
import { formatDate, getDangerLevelColor, truncateText } from '../utils/format';

interface BulletinTableProps {
  reports: Report[];
  isLoading: boolean;
  onViewDetails: (reportId: number) => void;
}

const BulletinTable: React.FC<BulletinTableProps> = ({ reports, isLoading, onViewDetails }) => {
  // Deduplicate reports by expires_at, keeping the latest (highest report_id) for each expires_at
  const dedupedReports = React.useMemo(() => {
    const map = new Map<string, Report>();
    reports.forEach(r => {
      if (!map.has(r.expires_at) || r.report_id > (map.get(r.expires_at)?.report_id ?? 0)) {
        map.set(r.expires_at, r);
      }
    });
    // Sort by expires_at descending
    return Array.from(map.values()).sort((a, b) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime());
  }, [reports]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Recent Bulletins</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Recent Bulletins</h2>
      
      {dedupedReports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No bulletins available</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Expires
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dedupedReports.map((report) => (
                <tr 
                  key={report.report_id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => onViewDetails(report.report_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.expires_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${getDangerLevelColor(report.mst_level)} px-2 py-1 text-xs font-medium text-white rounded-full`}>
                      {report.mst_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.author}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    {truncateText(report.comment || '', 100)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-150 inline-flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(report.report_id);
                      }}
                    >
                      View <ExternalLink className="h-4 w-4 ml-1" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BulletinTable;