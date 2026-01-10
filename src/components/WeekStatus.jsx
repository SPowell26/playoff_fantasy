import React, { useState } from 'react';
import { useYearly } from '../context/YearlyContext';
import { useAuth } from '../context/AuthContext';
import { getWeekDisplayName } from '../utils/weekDisplay';
import { API_URL } from '../config/api';

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
  
  const { isMaster } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

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
    }
    
    // Use the utility function which handles regular and postseason weeks correctly
    return getWeekDisplayName(week, seasonType || 'regular');
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
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshWeekStatus}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
          >
            Refresh
          </button>
          
          {/* Master account buttons */}
          {isMaster && (
            <>
              <button
                onClick={async () => {
                  console.log('📅 Schedule button clicked');
                  if (isUpdating) {
                    console.log('⚠️ Already updating, ignoring click');
                    return;
                  }
                  
                  setIsUpdating(true);
                  setUpdateMessage(null);
                  
                  try {
                    console.log(`🔄 Fetching schedule from ${API_URL}/api/status/fetch-schedule`);
                    
                    // Add timeout to fetch (longer timeout for ESPN API + DB operations)
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (ESPN API can be slow)
                    
                    const response = await fetch(`${API_URL}/api/status/fetch-schedule`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    console.log('📡 Response status:', response.status);
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('❌ Response error:', errorText);
                      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                    }
                    
                    const data = await response.json();
                    console.log('✅ Schedule fetched:', data);
                    setUpdateMessage({ type: 'success', text: data.message || 'Schedule fetched successfully!' });
                    setTimeout(() => setUpdateMessage(null), 5000);
                  } catch (error) {
                    console.error('❌ Failed to fetch schedule:', error);
                    let errorMessage = error.message;
                    if (error.name === 'AbortError') {
                      errorMessage = 'Request timed out. The backend may be processing the request - check server logs.';
                    } else if (error.message.includes('CONNECTION_REFUSED') || error.message.includes('Failed to fetch')) {
                      errorMessage = `Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`;
                    }
                    setUpdateMessage({ type: 'error', text: `Failed to fetch schedule: ${errorMessage}` });
                    setTimeout(() => setUpdateMessage(null), 8000);
                  } finally {
                    setIsUpdating(false);
                    console.log('✅ Update complete');
                  }
                }}
                disabled={isUpdating}
                className={`px-3 py-2 text-xs text-white rounded-lg transition-colors border ${
                  isUpdating 
                    ? 'bg-purple-800 cursor-not-allowed opacity-50 border-purple-600' 
                    : 'bg-purple-700 hover:bg-purple-600 border-purple-600 cursor-pointer'
                }`}
                title="Fetch and store weekly game schedule"
              >
                {isUpdating ? '⏳ Loading...' : '📅 Schedule'}
              </button>
              
              <button
                onClick={async () => {
                  console.log('🔄 Update Stats button clicked');
                  if (isUpdating) {
                    console.log('⚠️ Already updating, ignoring click');
                    return;
                  }
                  
                  setIsUpdating(true);
                  setUpdateMessage(null);
                  
                  try {
                    console.log(`🔄 Updating stats from ${API_URL}/api/stats/weekly-update`);
                    
                    // Add timeout to fetch
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (stats update can take longer)
                    
                    const response = await fetch(`${API_URL}/api/stats/weekly-update`, {
                      method: 'POST',
                      credentials: 'include',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    console.log('📡 Response status:', response.status);
                    
                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error('❌ Response error:', errorText);
                      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                    }
                    
                    const data = await response.json();
                    console.log('✅ Stats updated:', data);
                    setUpdateMessage({ type: 'success', text: data.message || 'Stats updated successfully!' });
                    
                    // Refresh the page data after stats update
                    setTimeout(() => {
                      refreshWeekStatus();
                      // Don't reload the whole page, just refresh the data
                      window.location.reload();
                    }, 2000);
                  } catch (error) {
                    console.error('❌ Failed to update stats:', error);
                    let errorMessage = error.message;
                    if (error.name === 'AbortError') {
                      errorMessage = 'Request timed out. The backend may be processing the request - check server logs.';
                    } else if (error.message.includes('CONNECTION_REFUSED') || error.message.includes('Failed to fetch')) {
                      errorMessage = `Cannot connect to backend at ${API_URL}. Make sure the backend server is running.`;
                    }
                    setUpdateMessage({ type: 'error', text: `Failed to update stats: ${errorMessage}` });
                    setTimeout(() => setUpdateMessage(null), 8000);
                  } finally {
                    setIsUpdating(false);
                    console.log('✅ Update complete');
                  }
                }}
                disabled={isUpdating}
                className={`px-3 py-2 text-xs text-white rounded-lg transition-colors border ${
                  isUpdating 
                    ? 'bg-green-800 cursor-not-allowed opacity-50 border-green-600' 
                    : 'bg-green-700 hover:bg-green-600 border-green-600 cursor-pointer'
                }`}
                title="Manually update weekly stats from ESPN"
              >
                {isUpdating ? '⏳ Loading...' : '🔄 Update Stats'}
              </button>
            </>
          )}
          
          {/* Debug: Show if master account */}
          {console.log('🔍 WeekStatus - isMaster:', isMaster, 'isUpdating:', isUpdating) || null}
        </div>
      </div>
      
      {/* Update message */}
      {updateMessage && (
        <div className={`mt-3 px-3 py-2 rounded text-sm ${
          updateMessage.type === 'success' 
            ? 'bg-green-900/30 text-green-300 border border-green-700' 
            : 'bg-red-900/30 text-red-300 border border-red-700'
        }`}>
          {updateMessage.text}
        </div>
      )}
      
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

