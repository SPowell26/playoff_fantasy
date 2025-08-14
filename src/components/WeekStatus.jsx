import React from 'react';
import { useYearly } from '../context/YearlyContext';

const WeekStatus = () => {
  const { 
    currentWeek, 
    seasonType, 
    isPlayoffs, 
    playoffRound, 
    weekStatusLoading, 
    weekStatusError,
    refreshWeekStatus 
  } = useYearly();

  if (weekStatusLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">Loading week status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (weekStatusError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-700 font-medium">Error loading week status</span>
            <span className="text-red-600 text-sm">{weekStatusError}</span>
          </div>
          <button
            onClick={refreshWeekStatus}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getWeekLabel = (week) => {
    if (!week) return 'Unknown';
    
    if (week <= 18) {
      return `Week ${week}`;
    } else if (week === 19) {
      return 'Wild Card Weekend';
    } else if (week === 20) {
      return 'Divisional Weekend';
    } else if (week === 21) {
      return 'Conference Championships';
    } else if (week === 22) {
      return 'Super Bowl';
    }
    return `Week ${week}`;
  };

  const getSeasonTypeLabel = (type) => {
    switch (type) {
      case 'regular':
        return 'Regular Season';
      case 'postseason':
        return 'Playoffs';
      case 'preseason':
        return 'Preseason';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (isPlayoffs) {
      return 'bg-purple-50 border-purple-200 text-purple-800';
    }
    return 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">
            {getWeekLabel(currentWeek)}
          </h3>
          <p className="text-sm opacity-80">
            {getSeasonTypeLabel(seasonType)}
            {isPlayoffs && playoffRound && ` • ${playoffRound}`}
          </p>
        </div>
        <button
          onClick={refreshWeekStatus}
          className="px-3 py-1 text-sm bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      {currentWeek && (
        <div className="mt-3 pt-3 border-t border-opacity-30">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-70">Fantasy Week:</span>
              <span className="ml-2 font-medium">{currentWeek}</span>
            </div>
            <div>
              <span className="opacity-70">Status:</span>
              <span className="ml-2 font-medium">
                {isPlayoffs ? 'Playoffs' : 'Regular Season'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekStatus;

