// Utility functions for League operations
import { League, Team, Player } from '../data/models.js';

/**
 * Create a new league with default settings
 */
export const createLeague = (name, owner, maxTeams = 8) => {
  return new League(generateId(), name, owner, maxTeams);
};

/**
 * Add a team to a league
 */
export const addTeamToLeague = (league, team) => {
  const success = league.addTeam(team);
  if (!success) {
    throw new Error(`League ${league.name} is full (${league.teams.length}/${league.maxTeams} teams)`);
  }
  return success;
};

/**
 * Remove a team from a league
 */
export const removeTeamFromLeague = (league, teamId) => {
  league.removeTeam(teamId);
  return true;
};

/**
 * Start a league (change status to active)
 */
export const startLeague = (league) => {
  const success = league.startLeague();
  if (!success) {
    throw new Error(`League needs at least 2 teams to start (currently has ${league.teams.length})`);
  }
  return success;
};

/**
 * Get league standings with rankings
 */
export const getLeagueStandings = (league) => {
  const standings = league.getStandings();
  return standings.map((team, index) => ({
    ...team,
    rank: index + 1,
    isEliminated: team.checkElimination()
  }));
};

/**
 * Get available players for drafting
 */
export const getAvailablePlayers = (league, allPlayers) => {
  return league.getAvailablePlayers(allPlayers);
};

/**
 * Generate a simple ID
 */
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}; 