import React, {createContext, useContext, useState, useEffect} from 'react';

//Create the context
const YearlyContext = createContext();

//Provider component
export function YearlyProvider({children}) {
  // Calendar year (what year it actually is)
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  // NFL Season year (the season that started in this calendar year)
  // Default to 2025 for the 2025-26 season
  const [nflSeasonYear, setNflSeasonYear] = useState(2025);
  
  const [currentWeek, setCurrentWeek] = useState(null);
  const [seasonType, setSeasonType] = useState(null);
  const [isPlayoffs, setIsPlayoffs] = useState(false);
  const [playoffRound, setPlayoffRound] = useState(null);
  const [weekStatusLoading, setWeekStatusLoading] = useState(true);
  const [weekStatusError, setWeekStatusError] = useState(null);

  // Playoff teams by year
  const playoffTeamsByYear = {
    2024: ["KC", "BAL", "BUF", "HOU", "SF", "DET", "GB", "TB"],
    2025: [] // Will be filled when 2025 playoffs are known
  };

  // Helper function to determine NFL season year based on calendar year and month
  const getNflSeasonYear = (year, month) => {
    // NFL season typically starts in September (month 8)
    // If we're in January-July, we're still in the previous year's season
    // If we're in August-December, we're in the new season
    if (month >= 8) {
      return year; // New season starting
    } else {
      return year - 1; // Still in previous year's season
    }
  };

  // Helper function to get season display string
  const getSeasonDisplayString = (nflYear) => {
    return nflYear.toString();
  };

  // Fetch current week status from backend API
  const fetchWeekStatus = async () => {
    try {
      setWeekStatusLoading(true);
      setWeekStatusError(null);
      
      const response = await fetch('http://localhost:3001/api/status/current-week');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setCurrentWeek(data.currentWeek);
      setSeasonType(data.seasonType);
      setIsPlayoffs(data.isPlayoffs);
      setPlayoffRound(data.playoffRound);
      
      // Update calendar year
      const now = new Date();
      const currentCalendarYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // January = 1
      
      setCalendarYear(currentCalendarYear);
      
      // Determine NFL season year based on calendar year and month
      const seasonYear = getNflSeasonYear(currentCalendarYear, currentMonth);
      setNflSeasonYear(seasonYear);
      
      // If we got season year from API, use that instead
      if (data.seasonYear) {
        setNflSeasonYear(data.seasonYear);
      }
      
      console.log('✅ Week status updated:', {
        ...data,
        calendarYear: currentCalendarYear,
        nflSeasonYear: seasonYear,
        seasonDisplay: getSeasonDisplayString(seasonYear)
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch week status:', error);
      setWeekStatusError(error.message);
    } finally {
      setWeekStatusLoading(false);
    }
  };

  // Fetch week status on component mount and refresh every hour
  useEffect(() => {
    fetchWeekStatus();
    
    // Refresh every hour
    const interval = setInterval(fetchWeekStatus, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);

  const getPlayoffTeamsForYear = (year) => {
    return playoffTeamsByYear[year] || [];
  };

  const value = {
    // Calendar year (what year it actually is)
    calendarYear,
    setCalendarYear,
    
    // NFL Season year (the season that started in this calendar year)
    nflSeasonYear,
    setNflSeasonYear,
    
    // Season display string (e.g., "2024-25")
    seasonDisplay: getSeasonDisplayString(nflSeasonYear),
    
    // Week and season info
    currentWeek,
    seasonType,
    isPlayoffs,
    playoffRound,
    
    // Loading states
    weekStatusLoading,
    weekStatusError,
    refreshWeekStatus: fetchWeekStatus,
    
    // Helper functions
    getPlayoffTeamsForYear,
    getNflSeasonYear,
    getSeasonDisplayString
  };

  return (
    <YearlyContext.Provider value={value}>
      {children}
    </YearlyContext.Provider>
  )
}

//Custom hook to use the context
export function useYearly() {
  const context = useContext(YearlyContext);
  if(!context) {
    throw new Error('useYearly must be within a YearlyProvider');
  }
  return context;
}
 