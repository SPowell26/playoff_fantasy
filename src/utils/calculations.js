// Utility functions for fantasy football calculations

/**
 * Calculate fantasy points for a player based on their stats and scoring rules
 * @param {Object} player - Player object with stats
 * @param {Object} scoringRules - League scoring rules
 * @returns {number} Total fantasy points
 */
export const calculatePlayerScore = (player, scoringRules) => {
  const stats = player.stats || {};
  
  return (
    (stats.passingYards || 0) * scoringRules.passingYards +
    (stats.passingTD || 0) * scoringRules.passingTD +
    (stats.interceptions || 0) * scoringRules.interceptions +
    (stats.rushingYards || 0) * scoringRules.rushingYards +
    (stats.rushingTD || 0) * scoringRules.rushingTD +
    (stats.receivingYards || 0) * scoringRules.receivingYards +
    (stats.receivingTD || 0) * scoringRules.receivingTD +
    (stats.fumbles || 0) * scoringRules.fumbles
  );
};

/**
 * Calculate total team score
 * @param {Object} team - Team object with players
 * @param {Object} scoringRules - League scoring rules
 * @returns {number} Total team score
 */
export const calculateTeamScore = (team, scoringRules) => {
  if (!team.players || !Array.isArray(team.players)) {
    return 0;
  }
  
  return team.players.reduce((total, player) => {
    return total + calculatePlayerScore(player, scoringRules);
  }, 0);
};

/**
 * Sort teams by score (highest first)
 * @param {Array} teams - Array of team objects
 * @param {Object} scoringRules - League scoring rules
 * @returns {Array} Sorted teams
 */
export const sortTeamsByScore = (teams, scoringRules) => {
  return [...teams].sort((a, b) => {
    const scoreA = calculateTeamScore(a, scoringRules);
    const scoreB = calculateTeamScore(b, scoringRules);
    return scoreB - scoreA; // Highest first
  });
};

/**
 * Get players by position
 * @param {Array} players - Array of player objects
 * @param {string} position - Position to filter by
 * @returns {Array} Filtered players
 */
export const getPlayersByPosition = (players, position) => {
  return players.filter(player => player.position === position);
};

/**
 * Get players by playoff team
 * @param {Array} players - Array of player objects
 * @param {string} playoffTeam - Playoff team to filter by
 * @returns {Array} Filtered players
 */
export const getPlayersByPlayoffTeam = (players, playoffTeam) => {
  return players.filter(player => player.playoffTeam === playoffTeam);
};

/**
 * Check if a team is eliminated (all players eliminated)
 * @param {Object} team - Team object
 * @returns {boolean} True if team is eliminated
 */
export const isTeamEliminated = (team) => {
  if (!team.players || team.players.length === 0) {
    return false;
  }
  
  return team.players.every(player => player.isEliminated);
};

/**
 * Calculate fantasy points for a player for a specific week
 * @param {Object} player - Player object with weeklyStats
 * @param {Object} scoringRules - League scoring rules
 * @param {number} week - Week number (1-4)
 * @returns {number} Weekly fantasy points
 */
export const calculatePlayerWeeklyScore = (player, scoringRules, week) => {
  const weeklyStats = player.weeklyStats?.[week] || {};
  
  let score = 0;
  
  // Offensive stats
  score += (weeklyStats.passingYards || 0) * scoringRules.passingYards;
  score += (weeklyStats.passingTD || 0) * scoringRules.passingTD;
  score += (weeklyStats.interceptions || 0) * scoringRules.interceptions;
  score += (weeklyStats.rushingYards || 0) * scoringRules.rushingYards;
  score += (weeklyStats.rushingTD || 0) * scoringRules.rushingTD;
  score += (weeklyStats.receivingYards || 0) * scoringRules.receivingYards;
  score += (weeklyStats.receivingTD || 0) * scoringRules.receivingTD;
  score += (weeklyStats.fumbles || 0) * scoringRules.fumbles;
  
  // Kicker stats
  score += (weeklyStats.fieldGoalsMade || 0) * scoringRules.fieldGoalsMade;
  score += (weeklyStats.extraPointsMade || 0) * scoringRules.extraPointsMade;
  score += (weeklyStats.fieldGoalsMissed || 0) * scoringRules.fieldGoalsMissed;
  
  // Defense stats
  score += (weeklyStats.sacks || 0) * scoringRules.sacks;
  score += (weeklyStats.interceptions || 0) * scoringRules.interceptions;
  score += (weeklyStats.fumbleRecoveries || 0) * scoringRules.fumbleRecoveries;
  score += (weeklyStats.safeties || 0) * scoringRules.safeties;
  
  // Defense points allowed scoring
  if (weeklyStats.pointsAllowed !== undefined && scoringRules.pointsAllowed) {
    const pointsAllowed = weeklyStats.pointsAllowed;
    let pointsAllowedScore = 0;
    
    if (pointsAllowed === 0) pointsAllowedScore = scoringRules.pointsAllowed[0];
    else if (pointsAllowed <= 6) pointsAllowedScore = scoringRules.pointsAllowed[1];
    else if (pointsAllowed <= 13) pointsAllowedScore = scoringRules.pointsAllowed[2];
    else if (pointsAllowed <= 17) pointsAllowedScore = scoringRules.pointsAllowed[3];
    else if (pointsAllowed <= 21) pointsAllowedScore = scoringRules.pointsAllowed[4];
    else if (pointsAllowed <= 27) pointsAllowedScore = scoringRules.pointsAllowed[5];
    else if (pointsAllowed <= 34) pointsAllowedScore = scoringRules.pointsAllowed[6];
    else if (pointsAllowed <= 45) pointsAllowedScore = scoringRules.pointsAllowed[7];
    else pointsAllowedScore = scoringRules.pointsAllowed[8];
    
    score += pointsAllowedScore;
  }
  
  return score;
};

/**
 * Calculate total team score for a specific week
 * @param {Object} team - Team object with players
 * @param {Object} scoringRules - League scoring rules
 * @param {number} week - Week number (1-4)
 * @returns {number} Weekly team score
 */
export const calculateTeamWeeklyScore = (team, scoringRules, week) => {
  if (!team.players || !Array.isArray(team.players)) {
    return 0;
  }
  
  return team.players.reduce((total, player) => {
    return total + calculatePlayerWeeklyScore(player, scoringRules, week);
  }, 0);
};

/**
 * Calculate cumulative team score up to a specific week
 * @param {Object} team - Team object with players
 * @param {Object} scoringRules - League scoring rules
 * @param {number} week - Week number (1-4)
 * @returns {number} Cumulative team score
 */
export const calculateTeamCumulativeScore = (team, scoringRules, week) => {
  if (!team.players || !Array.isArray(team.players)) {
    return 0;
  }
  
  let totalScore = 0;
  for (let w = 1; w <= week; w++) {
    totalScore += calculateTeamWeeklyScore(team, scoringRules, w);
  }
  
  return totalScore;
};

/**
 * Get the best weekly score for a team (for best ball format)
 * @param {Object} team - Team object with players
 * @param {Object} scoringRules - League scoring rules
 * @param {number} week - Week number (1-4)
 * @returns {number} Best weekly score
 */
export const getTeamBestWeeklyScore = (team, scoringRules, week) => {
  if (!team.players || !Array.isArray(team.players)) {
    return 0;
  }
  
  // Group players by position and get the best score at each position
  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  let bestBallScore = 0;
  
  positions.forEach(position => {
    const positionPlayers = team.players.filter(p => p.position === position);
    if (positionPlayers.length > 0) {
      const positionScores = positionPlayers.map(player => 
        calculatePlayerWeeklyScore(player, scoringRules, week)
      );
      bestBallScore += Math.max(...positionScores);
    }
  });
  
  return bestBallScore;
}; 