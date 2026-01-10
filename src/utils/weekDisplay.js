/**
 * Utility functions for displaying week information
 * Handles mapping of playoff weeks to friendly names
 */

/**
 * Get the display name for a week based on season type
 * @param {number} week - Week number (1-4 for playoffs, 1-18 for regular)
 * @param {string} seasonType - Season type ('postseason', 'regular', 'preseason')
 * @returns {string} Display name for the week
 */
export function getWeekDisplayName(week, seasonType) {
  if (seasonType === 'postseason') {
    const playoffWeekNames = {
      1: 'Wild Card',
      2: 'Divisional',
      3: 'Conference',
      4: 'Super Bowl'
    };
    return playoffWeekNames[week] || `Week ${week}`;
  }
  
  return `Week ${week}`;
}

/**
 * Get a short display name for playoff weeks
 * @param {number} week - Playoff week number (1-4)
 * @returns {string} Short display name
 */
export function getPlayoffWeekShortName(week) {
  const shortNames = {
    1: 'WC',
    2: 'DIV',
    3: 'CC',
    4: 'SB'
  };
  return shortNames[week] || `W${week}`;
}

