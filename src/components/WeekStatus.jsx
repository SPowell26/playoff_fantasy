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
    refreshWeekStatus,
    nflSeasonYear,
    seasonDisplay
  } = useYearly();

  if (weekStatusLoading) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-blue-300 font-medium">Loading week status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (weekStatusError) {
    return (
      <div className="bg-gray-800 border border-red-500 rounded-lg p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-300 font-medium">Error loading week status</span>
            <span className="text-red-400 text-sm">{weekStatusError}</span>
          </div>
          <button
            onClick={refreshWeekStatus}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getWeekLabel = (week) => {
    if (!week) return 'Unknown';
    
    if (seasonType === 'preseason') {
      return `Preseason Week ${week}`;
    } else if (seasonType === 'regular') {
      if (week <= 18) {
        return `Week ${week}`;
      }
    } else if (seasonType === 'postseason') {
      if (week === 19) return 'Wild Card Weekend';
      else if (week === 20) return 'Divisional Weekend';
      else if (week === 21) return 'Conference Championships';
      else if (week === 22) return 'Super Bowl';
    }
    return `Week ${week}`;
  };

  const getSeasonTypeLabel = (type) => {
    switch (type) {
      case 'preseason':
        return 'Preseason';
      case 'regular':
        return 'Regular Season';
      case 'postseason':
        return 'Playoffs';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    if (seasonType === 'preseason') {
      return 'bg-gray-800 border-yellow-500 text-yellow-200';
    } else if (isPlayoffs) {
      return 'bg-gray-800 border-purple-500 text-purple-200';
    }
    return 'bg-gray-800 border-green-500 text-green-200';
  };

  return (
    <div className={`border rounded-lg p-6 mb-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-xl text-white">
            {getWeekLabel(currentWeek)}
          </h3>
          <p className="text-gray-300">
            {getSeasonTypeLabel(seasonType)}
            {isPlayoffs && playoffRound && ` • ${playoffRound}`}
          </p>
          <p className="text-sm text-gray-400">
            {seasonDisplay} NFL Season
          </p>
        </div>
        <button
          onClick={refreshWeekStatus}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
        >
          Refresh
        </button>
      </div>
      
      {currentWeek && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Fantasy Week:</span>
              <span className="ml-2 font-medium text-white">{currentWeek}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className="ml-2 font-medium text-white">
                {isPlayoffs ? 'Playoffs' : getSeasonTypeLabel(seasonType)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekStatus;

