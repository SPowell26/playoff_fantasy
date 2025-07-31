import React, {createContext, useContext, useState} from 'react';

//Create the context
const YearlyContext = createContext();

//Provider component
export function YearlyProvider({children}) {
  const[currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Playoff teams by year
  const playoffTeamsByYear = {
    2024: ["KC", "BAL", "BUF", "HOU", "SF", "DET", "GB", "TB"],
    2025: [] // Will be filled when 2025 playoffs are known
  };

  const getPlayoffTeamsForYear = (year) => {
    return playoffTeamsByYear[year] || [];
  };

  const value = {
    currentYear,
    setCurrentYear,
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
 