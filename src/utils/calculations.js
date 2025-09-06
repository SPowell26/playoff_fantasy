// Utility functions for fantasy football calculations

/**
 * Calculate points allowed score for D/ST
 * @param {number} pointsAllowed - Points allowed by defense
 * @param {Object} scoringRules - League scoring rules
 * @returns {number} Fantasy points for points allowed
 */
const getPointsAllowedScore = (pointsAllowed, scoringRules) => {
  const pointsAllowedRules = scoringRules.pointsAllowed || [10, 7, 4, 1, 0, -1, -4, -7, -10];
  
  if (pointsAllowed === 0) return pointsAllowedRules[0];
  else if (pointsAllowed <= 6) return pointsAllowedRules[1];
  else if (pointsAllowed <= 13) return pointsAllowedRules[2];
  else if (pointsAllowed <= 17) return pointsAllowedRules[3];
  else if (pointsAllowed <= 21) return pointsAllowedRules[4];
  else if (pointsAllowed <= 27) return pointsAllowedRules[5];
  else if (pointsAllowed <= 34) return pointsAllowedRules[6];
  else if (pointsAllowed <= 45) return pointsAllowedRules[7];
  else return pointsAllowedRules[8];
};

/**
 * Calculate fantasy points for a player based on their stats and scoring rules
 * @param {Object} player - Player object with stats
 * @param {Object} scoringRules - League scoring rules
 * @returns {number} Total fantasy points
 */
export const calculatePlayerScore = (player, scoringRules) => {
  const stats = player.stats || {};
  const position = player.position;
  
  // Debug for Saquon Barkley
  if (player.name && player.name.toLowerCase().includes('saquon')) {
    console.log('🎯 SAQUON CALCULATION DEBUG:');
    console.log('  Player stats:', stats);
    console.log('  Scoring rules:', scoringRules);
    console.log('  rushingYards:', stats.rushingYards, '×', scoringRules.rushingYards, '=', (stats.rushingYards || 0) * (scoringRules.rushingYards || 0));
    console.log('  rushingTD:', stats.rushingTD, '×', scoringRules.rushingTD, '=', (stats.rushingTD || 0) * (scoringRules.rushingTD || 0));
    console.log('  receptions:', stats.receptions, '× 1 =', (stats.receptions || 0) * 1);
  }
  
  // Debug for kickers
  if (position === 'K' || position === 'PK') {
    console.log('🦵 KICKER CALCULATION DEBUG:');
    console.log('  Player:', player.name, 'Position:', position);
    console.log('  Player stats:', stats);
    console.log('  Stats keys:', Object.keys(stats));
    console.log('  fieldGoals0_39:', stats.fieldGoals0_39, '× 3 =', (stats.fieldGoals0_39 || 0) * 3);
    console.log('  fieldGoals40_49:', stats.fieldGoals40_49, '× 4 =', (stats.fieldGoals40_49 || 0) * 4);
    console.log('  fieldGoals50_plus:', stats.fieldGoals50_plus, '× 5 =', (stats.fieldGoals50_plus || 0) * 5);
    console.log('  extraPointsMade:', stats.extraPointsMade, '×', (scoringRules.extraPointsMade || 1), '=', (stats.extraPointsMade || 0) * (scoringRules.extraPointsMade || 1));
    console.log('  All stat values:', Object.entries(stats).filter(([key, value]) => value > 0));
  }
  
  let totalScore = 0;
  
  // Offensive stats (for all offensive players)
  totalScore += (stats.passingYards || 0) * (scoringRules.passingYards || 0);
  totalScore += (stats.passingTD || 0) * (scoringRules.passingTD || 0);
  totalScore += (stats.interceptions || 0) * (scoringRules.interceptions || 0);
  totalScore += (stats.rushingYards || 0) * (scoringRules.rushingYards || 0);
  totalScore += (stats.rushingTD || 0) * (scoringRules.rushingTD || 0);
  totalScore += (stats.receivingYards || 0) * (scoringRules.receivingYards || 0);
  totalScore += (stats.receivingTD || 0) * (scoringRules.receivingTD || 0);
  totalScore += (stats.receptions || 0) * 1; // 1 point per reception
  totalScore += (stats.fumbles || 0) * (scoringRules.fumbles || 0);
  
  // Kicker stats (only for kickers)
  if (position === 'K' || position === 'PK') {
    // Use individual field goal distance categories for proper scoring
    totalScore += (stats.fieldGoals0_39 || 0) * 3;  // 0-39 yard field goals = 3 points
    totalScore += (stats.fieldGoals40_49 || 0) * 4; // 40-49 yard field goals = 4 points  
    totalScore += (stats.fieldGoals50_plus || 0) * 5; // 50+ yard field goals = 5 points
    totalScore += (stats.extraPointsMade || 0) * (scoringRules.extraPointsMade || 1);
    totalScore += (stats.fieldGoalsMissed || 0) * (scoringRules.fieldGoalsMissed || -1);
  }
  
  // Defense stats (only for D/ST)
  if (position === 'D/ST' || position === 'DEF') {
    totalScore += (stats.sacks || 0) * (scoringRules.sacks || 1);
    totalScore += (stats.interceptions || 0) * (scoringRules.interceptions || 2);
    totalScore += (stats.fumbleRecoveries || 0) * (scoringRules.fumbleRecoveries || 1);
    totalScore += (stats.safeties || 0) * (scoringRules.safeties || 2);
    totalScore += (stats.blockedKicks || 0) * (scoringRules.blockedKicks || 2);
    totalScore += (stats.puntReturnTD || 0) * (scoringRules.puntReturnTD || 6);
    totalScore += (stats.kickoffReturnTD || 0) * (scoringRules.kickoffReturnTD || 6);
    // Points allowed scoring (for D/ST)
    if (stats.pointsAllowed !== undefined) {
      totalScore += getPointsAllowedScore(stats.pointsAllowed, scoringRules);
    }
  }
  
  return totalScore;
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