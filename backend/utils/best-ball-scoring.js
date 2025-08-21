/**
 * Best Ball Scoring Engine
 * Calculates optimal weekly lineups and team scores using Best Ball logic
 */

import { LEAGUE_RULES } from '../../league-rules.js';

/**
 * Calculate fantasy points for a player based on their stats and scoring rules
 * @param {Object} playerStats - Player statistics from database
 * @param {string} position - Player position (QB, RB, WR, TE, K, DEF)
 * @param {Object} scoringRules - League scoring rules (optional, uses defaults if not provided)
 * @returns {number} Total fantasy points
 */
export function calculatePlayerFantasyPoints(playerStats, position, scoringRules = null) {
  const rules = scoringRules || LEAGUE_RULES.scoringRules;
  let points = 0;

  switch (position) {
    case 'QB':
      // Passing stats
      points += (playerStats.passing_yards || 0) * rules.offensive.passing.yardsPerPoint;
      points += (playerStats.passing_touchdowns || 0) * rules.offensive.passing.touchdownPoints;
      points += (playerStats.interceptions || 0) * rules.offensive.passing.interceptionPoints;
      
      // Rushing stats (QBs can rush too)
      points += (playerStats.rushing_yards || 0) * rules.offensive.rushing.yardsPerPoint;
      points += (playerStats.rushing_touchdowns || 0) * rules.offensive.rushing.touchdownPoints;
      
      // Fumbles
      points += (playerStats.fumbles_lost || 0) * rules.offensive.fumbles.lostPoints;
      break;

    case 'RB':
    case 'WR':
    case 'TE':
      // Rushing stats
      points += (playerStats.rushing_yards || 0) * rules.offensive.rushing.yardsPerPoint;
      points += (playerStats.rushing_touchdowns || 0) * rules.offensive.rushing.touchdownPoints;
      
      // Receiving stats
      points += (playerStats.receiving_yards || 0) * rules.offensive.receiving.yardsPerPoint;
      points += (playerStats.receiving_touchdowns || 0) * rules.offensive.receiving.touchdownPoints;
      
      // Fumbles
      points += (playerStats.fumbles_lost || 0) * rules.offensive.fumbles.lostPoints;
      break;

    case 'K':
      // Field goals by distance
      points += (playerStats.field_goals_0_39 || 0) * rules.kicker.fieldGoals.zeroToThirtyNinePoints;
      points += (playerStats.field_goals_40_49 || 0) * rules.kicker.fieldGoals.fortyToFortyNinePoints;
      points += (playerStats.field_goals_50_plus || 0) * rules.kicker.fieldGoals.fiftyPlusPoints;
      
      // Extra points
      points += (playerStats.extra_points || 0) * rules.kicker.extraPointPoints;
      break;

    case 'DEF':
      // Special teams and defensive plays
      points += (playerStats.sacks || 0) * rules.defensive.specialTeams.sackPoints;
      points += (playerStats.interceptions || 0) * rules.defensive.specialTeams.interceptionPoints;
      points += (playerStats.fumble_recoveries || 0) * rules.defensive.specialTeams.fumbleRecoveryPoints;
      points += (playerStats.safeties || 0) * rules.defensive.specialTeams.safetyPoints;
      points += (playerStats.blocked_kicks || 0) * rules.defensive.specialTeams.blockedKickPoints;
      points += (playerStats.punt_return_touchdowns || 0) * rules.defensive.specialTeams.puntReturnTDPoints;
      points += (playerStats.kickoff_return_touchdowns || 0) * rules.defensive.specialTeams.kickoffReturnTDPoints;
      
      // Points allowed
      const pointsAllowed = playerStats.points_allowed || 0;
      if (pointsAllowed === 0) points += rules.defensive.pointsAllowed.shutoutPoints;
      else if (pointsAllowed <= 6) points += rules.defensive.pointsAllowed.oneToSixPoints;
      else if (pointsAllowed <= 13) points += rules.defensive.pointsAllowed.sevenToThirteenPoints;
      else if (pointsAllowed <= 20) points += rules.defensive.pointsAllowed.fourteenToTwentyPoints;
      else if (pointsAllowed <= 27) points += rules.defensive.pointsAllowed.twentyOneToTwentySevenPoints;
      else if (pointsAllowed <= 34) points += rules.defensive.pointsAllowed.twentyEightToThirtyFourPoints;
      else points += rules.defensive.pointsAllowed.thirtyFivePlusPoints;
      
      // Team win
      if (playerStats.team_win) points += rules.defensive.teamWinPoints;
      break;
  }

  return Math.round(points * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate Best Ball weekly team score
 * @param {Array} teamPlayers - Array of players with their weekly stats
 * @param {Object} leagueSettings - League roster settings
 * @param {Object} scoringRules - League scoring rules
 * @returns {Object} Best Ball lineup and total score
 */
export function calculateBestBallWeeklyScore(teamPlayers, leagueSettings = null, scoringRules = null) {
  const settings = leagueSettings || LEAGUE_RULES.rosterSettings;
  const rules = scoringRules || LEAGUE_RULES.scoringRules;

  // Group players by position
  const playersByPosition = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    K: [],
    DEF: []
  };

  // Calculate fantasy points for each player and group by position
  teamPlayers.forEach(player => {
    const fantasyPoints = calculatePlayerFantasyPoints(player.stats, player.position, rules);
    playersByPosition[player.position].push({
      ...player,
      fantasyPoints
    });
  });

  // Sort each position by fantasy points (descending)
  Object.keys(playersByPosition).forEach(position => {
    playersByPosition[position].sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  });

  // Build optimal lineup based on Best Ball rules
  const optimalLineup = {
    QB: playersByPosition.QB[0] || null,
    RB1: playersByPosition.RB[0] || null,
    RB2: playersByPosition.RB[1] || null,
    WR1: playersByPosition.WR[0] || null,
    WR2: playersByPosition.WR[1] || null,
    TE: playersByPosition.TE[0] || null,
    FLEX: null, // Will be determined from remaining RB/WR/TE
    K: playersByPosition.K[0] || null,
    DEF: playersByPosition.DEF[0] || null
  };

  // Determine FLEX player (best remaining RB/WR/TE not already in lineup)
  const flexCandidates = [];
  
  // Add remaining RBs (skip RB1 and RB2)
  if (playersByPosition.RB.length > 2) {
    flexCandidates.push(...playersByPosition.RB.slice(2));
  }
  
  // Add remaining WRs (skip WR1 and WR2)
  if (playersByPosition.WR.length > 2) {
    flexCandidates.push(...playersByPosition.WR.slice(2));
  }
  
  // Add remaining TEs (skip TE1)
  if (playersByPosition.TE.length > 1) {
    flexCandidates.push(...playersByPosition.TE.slice(1));
  }

  // Sort flex candidates by fantasy points and pick the best
  flexCandidates.sort((a, b) => b.fantasyPoints - a.fantasyPoints);
  optimalLineup.FLEX = flexCandidates[0] || null;

  // Calculate total weekly score
  let weeklyScore = 0;
  let lineupBreakdown = {};

  Object.entries(optimalLineup).forEach(([position, player]) => {
    if (player) {
      weeklyScore += player.fantasyPoints;
      lineupBreakdown[position] = {
        playerId: player.id,
        playerName: player.name,
        position: player.position,
        fantasyPoints: player.fantasyPoints
      };
    } else {
      lineupBreakdown[position] = null;
    }
  });

  return {
    weeklyScore: Math.round(weeklyScore * 100) / 100,
    optimalLineup: lineupBreakdown,
    playersByPosition: playersByPosition,
    totalPlayers: teamPlayers.length
  };
}

/**
 * Calculate season total score from weekly scores
 * @param {Array} weeklyScores - Array of weekly scores
 * @returns {number} Total season score
 */
export function calculateSeasonTotal(weeklyScores) {
  return weeklyScores.reduce((total, weekScore) => total + weekScore, 0);
}

/**
 * Get default roster settings from league rules
 * @returns {Object} Default roster configuration
 */
export function getDefaultRosterSettings() {
  return LEAGUE_RULES.rosterSettings;
}

/**
 * Get default scoring rules from league rules
 * @returns {Object} Default scoring configuration
 */
export function getDefaultScoringRules() {
  return LEAGUE_RULES.scoringRules;
}
