import React from 'react';
import { X, FileText } from 'lucide-react';
import { Report } from '../types';
import { formatDate, getDangerLevelColor, getDangerLevelText } from '../utils/format';
import { downloadReportPdf } from '../utils/api';

interface BulletinDetailsProps {
  report: Report | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

const BulletinDetails: React.FC<BulletinDetailsProps> = ({
  report,
  isOpen,
  isLoading,
  onClose
}) => {
  if (!isOpen) return null;

  // Handle click on the backdrop to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Open PDF in a new tab using the API proxy endpoint
  const handleDownloadPDF = () => {
    downloadReportPdf(report?.report_id);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300
                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
          </div>
        ) : report ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Bulletin #{report.report_id} - {formatDate(report.issued_at)}
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Danger Level */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Danger Level:</p>
                <div className={`${getDangerLevelColor(report.mst_level)} text-white px-3 py-1 rounded-md font-semibold inline-flex items-center`}>
                  Level {report.mst_level} - {getDangerLevelText(report.mst_level)}
                </div>
              </div>
              
              {/* Author and Expiration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Author:</p>
                  <p className="font-medium">{report.author}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valid Until:</p>
                  <p className="font-medium">{formatDate(report.expires_at)}</p>
                </div>
              </div>
              
              {/* Comment */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Comment:</p>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-line">{report.comment}</div>
              </div>
              
              {/* History Table */}
              {report.history && report.history.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">History and tendency:</p>
                  <div className="overflow-x-auto bg-gray-50 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conditions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.history.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(item.date)}</td>
                            <td className="px-4 py-2">
                              <span className={`${getDangerLevelColor(Number(item.level))} px-2 py-1 text-xs font-medium text-white rounded-full`}>
                                {Number.isFinite(Number(item.level)) ? item.level : '?'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">{item.wet || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinDetails;
