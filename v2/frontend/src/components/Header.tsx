import React from 'react';
import { Triangle as AlarmTriangle } from 'lucide-react';
import { Report } from '../types';
import { formatDate, getDangerLevelColor, getDangerLevelText } from '../utils/format';

interface HeaderProps {
  latestReport: Report | null;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ latestReport, isLoading }) => {
  return (
    <header className="bg-white shadow-lg py-6 px-4 sm:px-6 lg:px-8 mb-8 animate-slide-down">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0 group">
            <AlarmTriangle className="h-8 w-8 text-red-600 mr-3 transform group-hover:rotate-12 transition-transform duration-300" />
            <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Avalanche-Risk Dashboard
            </h1>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ) : latestReport ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center animate-fade-in">
              <div className="text-sm text-gray-500 mr-3 mb-2 sm:mb-0">
                Latest bulletin: {formatDate(latestReport.issued_at)}
              </div>
              <div 
                className={`${getDangerLevelColor(latestReport.mst_level)} 
                text-white px-4 py-2 rounded-md font-semibold flex items-center
                transform hover:scale-105 transition-transform duration-200`}
              >
                Level {latestReport.mst_level} - {getDangerLevelText(latestReport.mst_level)}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 animate-fade-in">No data available</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;