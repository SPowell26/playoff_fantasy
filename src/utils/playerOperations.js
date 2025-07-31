// Utility functions for Player operations
import { Player } from '../data/models.js';

/**
 * Create a new player
 */
export const createPlayer = (name, position, nflTeam) => {
  return new Player(generateId(), name, position, nflTeam);
};

/**
 * Update player stats
 */
export const updatePlayerStats = (player, newStats) => {
  player.updateStats(newStats);
  return true;
};

/**
 * Calculate player's fantasy points
 */
export const calculatePlayerScore = (player, scoringRules) => {
  return player.getFantasyPoints(scoringRules);
};

/**
 * Mark player as eliminated
 */
export const eliminatePlayer = (player) => {
  player.eliminate();
  return true;
};

/**
 * Get player summary
 */
export const getPlayerSummary = (player, scoringRules) => {
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    nflTeam: player.nflTeam,
    stats: player.stats,
    fantasyPoints: player.getFantasyPoints(scoringRules),
    isActive: player.isActive,
    isEliminated: player.isEliminated
  };
};

/**
 * Get players by position from a list
 */
export const getPlayersByPosition = (players, position) => {
  return players.filter(player => player.position === position);
};

/**
 * Get players by NFL team from a list
 */
export const getPlayersByNflTeam = (players, nflTeam) => {
  return players.filter(player => player.nflTeam === nflTeam);
};

/**
 * Get active players from a list
 */
export const getActivePlayers = (players) => {
  return players.filter(player => player.isActive && !player.isEliminated);
};

/**
 * Generate a simple ID
 */
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}; 