// Utility functions for Team operations
import { Team, Player } from '../data/models.js';

/**
 * Create a new team
 */
export const createTeam = (leagueId, owner, name) => {
  return new Team(generateId(), leagueId, owner, name);
};

/**
 * Add a player to a team
 */
export const addPlayerToTeam = (team, player) => {
  team.addPlayer(player);
  return true;
};

/**
 * Remove a player from a team
 */
export const removePlayerFromTeam = (team, playerId) => {
  team.removePlayer(playerId);
  return true;
};

/**
 * Get players by position on a team
 */
export const getTeamPlayersByPosition = (team, position) => {
  return team.getPlayersByPosition(position);
};

/**
 * Calculate team's total score
 */
export const calculateTeamScore = (team, scoringRules) => {
  return team.calculateTotalScore(scoringRules);
};

/**
 * Check if team is eliminated
 */
export const isTeamEliminated = (team) => {
  return team.checkElimination();
};

/**
 * Get team roster summary
 */
export const getTeamRosterSummary = (team) => {
  const positionCounts = {};
  team.players.forEach(player => {
    positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
  });
  
  return {
    totalPlayers: team.players.length,
    positionCounts,
    totalScore: team.totalScore,
    isEliminated: team.isEliminated
  };
};

/**
 * Generate a simple ID
 */
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}; 