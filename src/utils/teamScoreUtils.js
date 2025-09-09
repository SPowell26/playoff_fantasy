// Modular utilities for team score calculations
import { calculateStartingLineupScore } from './calculations';

/**
 * Calculate team score with real stats (modular for both TeamPage and LeaguePage)
 * @param {Object} team - Team object with players array
 * @param {Object} league - League object with scoring rules
 * @param {Function} getPlayerWithRealStats - Function to get player stats
 * @param {number} currentWeek - Current week number
 * @returns {Object} Team with calculated scores and processed players
 */
export const calculateTeamScoreWithStats = (team, league, getPlayerWithRealStats, currentWeek) => {
  if (!team || !team.players || team.players.length === 0) {
    return {
      ...team,
      weeklyScore: 0,
      totalScore: 0,
      players: []
    };
  }

  // Get scoring rules from league
  let scoringRules = league.scoring_rules || {};
  if (scoringRules.offensive) {
    scoringRules = scoringRules.offensive;
  }
  
  // Fallback to default rules if not found
  if (!scoringRules.passingYards) {
    scoringRules = {
      passingYards: 0.04,
      passingTD: 4,
      interceptions: -2,
      rushingYards: 0.1,
      rushingTD: 6,
      receivingYards: 0.1,
      receivingTD: 6,
      fumbles: -2
    };
  }
  
  // Add D/ST scoring rules
  scoringRules = {
    ...scoringRules,
    sacks: 1,
    fumbleRecoveries: 2,
    safeties: 2,
    blockedKicks: 2,
    puntReturnTD: 6,
    kickoffReturnTD: 6,
    pointsAllowed: [10, 7, 4, 1, 0, -1, -4, -7, -10]
  };

  // Get real stats for each player
  const playersWithStats = team.players.map(player => {
    const playerWithStats = getPlayerWithRealStats(player.player_id, currentWeek);
    if (playerWithStats) {
      return {
        ...player,
        ...playerWithStats
      };
    } else {
      return {
        ...player,
        stats: {}
      };
    }
  });

  // Create team object with processed players
  const teamWithRealStats = {
    ...team,
    players: playersWithStats
  };

  // Calculate weekly score using best-ball logic
  const weeklyScore = calculateStartingLineupScore(teamWithRealStats, scoringRules);
  
  // For now, total score = weekly score
  const totalScore = weeklyScore;

  return {
    ...team,
    weeklyScore: parseFloat(weeklyScore.toFixed(2)),
    totalScore: parseFloat(totalScore.toFixed(2)),
    players: playersWithStats, // Include processed players
    scoringRules // Include for debugging
  };
};

/**
 * Calculate scores for multiple teams (for league standings)
 * @param {Array} teams - Array of team objects
 * @param {Object} league - League object with scoring rules
 * @param {Function} getPlayerWithRealStats - Function to get player stats
 * @param {number} currentWeek - Current week number
 * @returns {Array} Teams with calculated scores, sorted by total score
 */
export const calculateLeagueStandings = (teams, league, getPlayerWithRealStats, currentWeek) => {
  if (!teams || teams.length === 0) return [];

  // Calculate scores for each team
  const teamsWithScores = teams.map(team => 
    calculateTeamScoreWithStats(team, league, getPlayerWithRealStats, currentWeek)
  );

  // Sort by total score (descending) and add rankings
  return teamsWithScores
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((team, index) => ({
      ...team,
      rank: index + 1
    }));
};