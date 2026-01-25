// Utility functions for fantasy football calculations

/**
 * Calculate points allowed score for D/ST
 * @param {number} pointsAllowed - Points allowed by defense
 * @param {Object} scoringRules - League scoring rules
 * @returns {number} Fantasy points for points allowed
 */
const getPointsAllowedScore = (pointsAllowed, scoringRules) => {
  // Use correct ranges: 0, 1-6, 7-13, 14-20, 21-27, 28-34, 35+
  const pointsAllowedRules = scoringRules.pointsAllowed || [10, 7, 4, 1, 0, -1, -4];
  
  if (pointsAllowed === 0) return pointsAllowedRules[0];
  else if (pointsAllowed <= 6) return pointsAllowedRules[1];
  else if (pointsAllowed <= 13) return pointsAllowedRules[2];
  else if (pointsAllowed <= 20) return pointsAllowedRules[3];
  else if (pointsAllowed <= 27) return pointsAllowedRules[4];
  else if (pointsAllowed <= 34) return pointsAllowedRules[5];
  else return pointsAllowedRules[6]; // 35+
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
    const ppr = scoringRules.PPR || scoringRules.receptionPoints || 1;
    console.log('  receptions:', stats.receptions, '×', ppr, '=', (stats.receptions || 0) * ppr);
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
  const passingYards = stats.passingYards || 0;
  const rushingYards = stats.rushingYards || 0;
  const receivingYards = stats.receivingYards || 0;
  
  totalScore += passingYards * (scoringRules.passingYards || 0);
  totalScore += (stats.passingTD || 0) * (scoringRules.passingTD || 0);
  // Only apply offensive interceptions (thrown) to offensive players, not D/ST
  // D/ST interceptions are handled in the defensive section below
  if (position !== 'D/ST' && position !== 'DEF') {
    totalScore += (stats.interceptions || 0) * (scoringRules.interceptions || 0);
  }
  totalScore += rushingYards * (scoringRules.rushingYards || 0);
  totalScore += (stats.rushingTD || 0) * (scoringRules.rushingTD || 0);
  totalScore += receivingYards * (scoringRules.receivingYards || 0);
  totalScore += (stats.receivingTD || 0) * (scoringRules.receivingTD || 0);
  totalScore += (stats.receptions || 0) * (scoringRules.PPR || scoringRules.receptionPoints || 1); // Points per reception
  totalScore += (stats.fumbles || 0) * (scoringRules.fumbles || 0);
  
  // 2-point conversions (2 points each for passer and receiver)
  totalScore += (stats.twoPointConversionsPassing || 0) * 2;
  totalScore += (stats.twoPointConversionsReceiving || 0) * 2;
  
  // Return touchdowns (for individual players - WR/RB/KR/PR who return kicks)
  // Note: D/ST return TDs are handled in the Defense section below
  if (position && position !== 'D/ST' && position !== 'DEF') {
    try {
      const puntReturnTDs = stats.puntReturnTD || stats.punt_return_touchdowns || 0;
      const kickoffReturnTDs = stats.kickoffReturnTD || stats.kickoff_return_touchdowns || 0;
      const puntReturnPoints = scoringRules?.puntReturnTD || scoringRules?.defensive?.specialTeams?.puntReturnTDPoints || 6;
      const kickoffReturnPoints = scoringRules?.kickoffReturnTD || scoringRules?.defensive?.specialTeams?.kickoffReturnTDPoints || 6;
      totalScore += puntReturnTDs * puntReturnPoints;
      totalScore += kickoffReturnTDs * kickoffReturnPoints;
    } catch (returnError) {
      console.error('Error calculating return TDs:', returnError);
      // Continue without return TDs if there's an error
    }
  }
  
  // Bonus points for milestones (boolean multipliers)
  if (passingYards >= 300) totalScore += 3; // 3 points for 300+ passing yards
  if (rushingYards >= 100) totalScore += 3; // 3 points for 100+ rushing yards
  if (receivingYards >= 100) totalScore += 3; // 3 points for 100+ receiving yards
  
  // Kicker stats (only for kickers)
  if (position === 'K' || position === 'PK') {
    // Use individual field goal distance categories for proper scoring
    totalScore += (stats.fieldGoals0_39 || 0) * 3;  // 0-39 yard field goals = 3 points
    totalScore += (stats.fieldGoals40_49 || 0) * 4; // 40-49 yard field goals = 4 points  
    totalScore += (stats.fieldGoals50_plus || 0) * 5; // 50+ yard field goals = 5 points
    totalScore += (stats.extraPointsMade || 0) * (scoringRules.extraPointsMade || 1);
    // Penalties for missed kicks (-1 point each)
    totalScore += (stats.fieldGoalsMissed || 0) * -1; // -1 point for missed field goal
    totalScore += (stats.extraPointsMissed || 0) * -1; // -1 point for missed extra point
  }
  
  // Defense stats (only for D/ST players)
  if (position === 'D/ST' || position === 'DEF') {
    totalScore += (stats.sacks || 0) * (scoringRules.sacks || 1);
    // D/ST interceptions are defensive (made) = +2 points each
    // Use defensive interception points if available, otherwise default to +2
    const defensiveInterceptionPoints = scoringRules.defensiveInterceptions || scoringRules.interceptionsDefense || 2;
    totalScore += (stats.interceptions || 0) * defensiveInterceptionPoints;
    totalScore += (stats.fumbleRecoveries || 0) * (scoringRules.fumbleRecoveries || 1); // Fixed: should be 1 point, not 2
    totalScore += (stats.safeties || 0) * (scoringRules.safeties || 2);
    totalScore += (stats.blockedKicks || 0) * (scoringRules.blockedKicks || 2);
    totalScore += (stats.puntReturnTD || 0) * (scoringRules.puntReturnTD || 6);
    totalScore += (stats.kickoffReturnTD || 0) * (scoringRules.kickoffReturnTD || 6);
    // Defensive TDs (if tracked separately from return TDs)
    totalScore += (stats.defensiveTDs || 0) * 6; // 6 points for any defensive TD (separate from return TDs)
    // Points allowed scoring (for D/ST only)
    if (stats.pointsAllowed !== undefined && stats.pointsAllowed !== null) {
      totalScore += getPointsAllowedScore(stats.pointsAllowed, scoringRules);
    }
    // Team win bonus (6 points if team won) - only for D/ST
    // Check for both camelCase and snake_case, handle boolean/truthy values
    // Must explicitly check for true/1/'true' to avoid counting false/0/'false' as true
    const teamWin = (stats.teamWin === true || stats.teamWin === 1 || stats.teamWin === 'true') ||
                    (stats.team_win === true || stats.team_win === 1 || stats.team_win === 'true');
    if (teamWin) {
      const teamWinPoints = scoringRules.teamWinPoints || 6;
      totalScore += teamWinPoints;
      
      // Debug logging for D/ST team win
      console.log(`🏈 D/ST Team Win Bonus: ${player.name || 'Unknown'} (${position}) - teamWin=${stats.teamWin}, team_win=${stats.team_win}, adding ${teamWinPoints} points`);
    } else {
      // Debug logging when team win should apply but doesn't
      if (position === 'D/ST' || position === 'DEF') {
        console.log(`🏈 D/ST NO Team Win: ${player.name || 'Unknown'} (${position}) - teamWin=${stats.teamWin}, team_win=${stats.team_win}, stats keys:`, Object.keys(stats));
      }
    }
  }
  // Ensure points_allowed and team_win don't get counted for non-D/ST players
  // (even if they somehow exist in the stats object)
  else if (stats.pointsAllowed !== undefined || stats.teamWin !== undefined || stats.team_win !== undefined) {
    // Do nothing - ignore these stats for non-D/ST players
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
 * Calculate team score for starting lineup only (excludes bench players)
 * Uses best-ball logic to pick highest-scoring players for each position
 * @param {Object} team - Team object with players array
 * @param {Object} scoringRules - Scoring rules object
 * @returns {number} Total starting lineup score
 */
export const calculateStartingLineupScore = (team, scoringRules) => {
  if (!team.players || !Array.isArray(team.players)) {
    return 0;
  }
  
  // Calculate scores for all players first
  const playersWithScores = team.players.map(player => ({
    ...player,
    calculatedScore: calculatePlayerScore(player, scoringRules)
  }));

  // Sort players by score (descending) for best-ball logic
  playersWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Create a copy of players to work with
  const availablePlayers = [...playersWithScores];
  
  // Define starting lineup requirements
  const requirements = {
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    K: 1,
    DEF: 1,
    FLEX: 1
  };

  let startingLineupScore = 0;

  // Fill positional spots first (highest scoring players at each position)
  Object.keys(requirements).forEach(position => {
    if (position === 'FLEX') return; // Handle FLEX separately
    
    // Handle position mapping for different position names
    let eligiblePlayers;
    if (position === 'DEF') {
      eligiblePlayers = availablePlayers.filter(p => p.position === 'D/ST' || p.position === 'DEF');
    } else if (position === 'K') {
      eligiblePlayers = availablePlayers.filter(p => p.position === 'K' || p.position === 'PK');
    } else {
      eligiblePlayers = availablePlayers.filter(p => p.position === position);
    }
    
    const sortedPlayers = eligiblePlayers.sort((a, b) => b.calculatedScore - a.calculatedScore);
    
    for (let i = 0; i < requirements[position] && i < sortedPlayers.length; i++) {
      startingLineupScore += sortedPlayers[i].calculatedScore;
      // Remove from available players
      const index = availablePlayers.indexOf(sortedPlayers[i]);
      if (index > -1) availablePlayers.splice(index, 1);
    }
  });

  // Fill FLEX spot with highest scoring remaining RB/WR/TE
  const flexEligible = availablePlayers.filter(p => ['RB', 'WR', 'TE'].includes(p.position));
  if (flexEligible.length > 0) {
    const bestFlex = flexEligible.sort((a, b) => b.calculatedScore - a.calculatedScore)[0];
    startingLineupScore += bestFlex.calculatedScore;
  }

  return startingLineupScore;
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
  const passingYards = weeklyStats.passingYards || 0;
  const rushingYards = weeklyStats.rushingYards || 0;
  const receivingYards = weeklyStats.receivingYards || 0;
  
  score += passingYards * scoringRules.passingYards;
  score += (weeklyStats.passingTD || 0) * scoringRules.passingTD;
  score += (weeklyStats.interceptions || 0) * scoringRules.interceptions;
  score += rushingYards * scoringRules.rushingYards;
  score += (weeklyStats.rushingTD || 0) * scoringRules.rushingTD;
  score += receivingYards * scoringRules.receivingYards;
  score += (weeklyStats.receivingTD || 0) * scoringRules.receivingTD;
  score += (weeklyStats.receptions || 0) * (scoringRules.PPR || scoringRules.receptionPoints || 1); // Points per reception
  score += (weeklyStats.fumbles || 0) * scoringRules.fumbles;
  
  // Bonus points for milestones (boolean multipliers)
  if (passingYards >= 300) score += 3; // 3 points for 300+ passing yards
  if (rushingYards >= 100) score += 3; // 3 points for 100+ rushing yards
  if (receivingYards >= 100) score += 3; // 3 points for 100+ receiving yards
  
  // Kicker stats (only for kickers)
  if (player.position === 'K' || player.position === 'PK') {
    score += (weeklyStats.fieldGoals0_39 || 0) * 3;  // 0-39 yard field goals = 3 points
    score += (weeklyStats.fieldGoals40_49 || 0) * 4; // 40-49 yard field goals = 4 points  
    score += (weeklyStats.fieldGoals50_plus || 0) * 5; // 50+ yard field goals = 5 points
    score += (weeklyStats.extraPointsMade || 0) * (scoringRules.extraPointsMade || 1);
    score += (weeklyStats.fieldGoalsMissed || 0) * -1; // -1 point for missed field goal
    score += (weeklyStats.extraPointsMissed || 0) * -1; // -1 point for missed extra point
  }
  
  // Defense stats (only for D/ST)
  if (player.position === 'D/ST' || player.position === 'DEF') {
    score += (weeklyStats.sacks || 0) * (scoringRules.sacks || 1);
    score += (weeklyStats.interceptions || 0) * (scoringRules.interceptions || 2);
    score += (weeklyStats.fumbleRecoveries || 0) * (scoringRules.fumbleRecoveries || 1);
    score += (weeklyStats.safeties || 0) * (scoringRules.safeties || 2);
    score += (weeklyStats.blockedKicks || 0) * (scoringRules.blockedKicks || 2);
    score += (weeklyStats.puntReturnTD || 0) * (scoringRules.puntReturnTD || 6);
    score += (weeklyStats.kickoffReturnTD || 0) * (scoringRules.kickoffReturnTD || 6);
    
    // Defense points allowed scoring (only for D/ST)
    if (weeklyStats.pointsAllowed !== undefined) {
      score += getPointsAllowedScore(weeklyStats.pointsAllowed, scoringRules);
    }
    
    // Team win bonus (6 points if team won) - only for D/ST
    // Check for both camelCase and snake_case, handle boolean/truthy values
    const teamWin = weeklyStats.teamWin === true || weeklyStats.teamWin === 'true' || 
                    weeklyStats.team_win === true || weeklyStats.team_win === 'true' ||
                    weeklyStats.teamWin === 1 || weeklyStats.team_win === 1 ||
                    Boolean(weeklyStats.teamWin) || Boolean(weeklyStats.team_win);
    if (teamWin) {
      const teamWinPoints = scoringRules.teamWinPoints || 6;
      score += teamWinPoints;
    }
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