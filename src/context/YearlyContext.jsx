import React, {createContext, useContext, useState, useEffect} from 'react';

//Create the context
const YearlyContext = createContext();

//Provider component
export function YearlyProvider({children}) {
  const[currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const[currentWeek, setCurrentWeek] = useState(null);
  const[seasonType, setSeasonType] = useState(null);
  const[isPlayoffs, setIsPlayoffs] = useState(false);
  const[playoffRound, setPlayoffRound] = useState(null);
  const[weekStatusLoading, setWeekStatusLoading] = useState(true);
  const[weekStatusError, setWeekStatusError] = useState(null);

  // Playoff teams by year
  const playoffTeamsByYear = {
    2024: ["KC", "BAL", "BUF", "HOU", "SF", "DET", "GB", "TB"],
    2025: [] // Will be filled when 2025 playoffs are known
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
      
      // Update year if we got it from the API
      if (data.seasonYear) {
        setCurrentYear(data.seasonYear);
      }
      
      console.log('✅ Week status updated:', data);
      
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
    currentYear,
    setCurrentYear,
    currentWeek,
    seasonType,
    isPlayoffs,
    playoffRound,
    weekStatusLoading,
    weekStatusError,
    refreshWeekStatus: fetchWeekStatus,
    getPlayoffTeamsForYear
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
 