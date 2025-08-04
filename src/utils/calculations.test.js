import { describe, it, expect } from 'vitest';
import {
  calculatePlayerScore,
  calculateTeamScore,
  sortTeamsByScore,
  getPlayersByPosition,
  getPlayersByPlayoffTeam,
  isTeamEliminated
} from './calculations';

describe('Fantasy Football Calculations', () => {
  const mockScoringRules = {
    passingYards: 0.04,
    passingTD: 4,
    interceptions: -2,
    rushingYards: 0.1,
    rushingTD: 6,
    receivingYards: 0.1,
    receivingTD: 6,
    fumbles: -2
  };

  describe('calculatePlayerScore', () => {
    it('should calculate QB score correctly', () => {
      const qb = {
        stats: {
          passingYards: 300,
          passingTD: 2,
          interceptions: 1,
          rushingYards: 20,
          rushingTD: 0,
          fumbles: 0
        }
      };

      const score = calculatePlayerScore(qb, mockScoringRules);
      // 300 * 0.04 + 2 * 4 + 1 * (-2) + 20 * 0.1 = 12 + 8 - 2 + 2 = 20
      expect(score).toBe(20);
    });

    it('should calculate RB score correctly', () => {
      const rb = {
        stats: {
          rushingYards: 120,
          rushingTD: 1,
          receivingYards: 50,
          receivingTD: 0,
          fumbles: 1
        }
      };

      const score = calculatePlayerScore(rb, mockScoringRules);
      // 120 * 0.1 + 1 * 6 + 50 * 0.1 + 0 * 6 + 1 * (-2) = 12 + 6 + 5 - 2 = 21
      expect(score).toBe(21);
    });

    it('should handle missing stats', () => {
      const player = {
        stats: {
          passingYards: 200
        }
      };

      const score = calculatePlayerScore(player, mockScoringRules);
      // 200 * 0.04 = 8
      expect(score).toBe(8);
    });

    it('should handle player with no stats', () => {
      const player = { stats: {} };
      const score = calculatePlayerScore(player, mockScoringRules);
      expect(score).toBe(0);
    });
  });

  describe('calculateTeamScore', () => {
    it('should calculate team score with multiple players', () => {
      const team = {
        players: [
          {
            stats: {
              passingYards: 300,
              passingTD: 2,
              interceptions: 1
            }
          },
          {
            stats: {
              rushingYards: 100,
              rushingTD: 1
            }
          }
        ]
      };

      const score = calculateTeamScore(team, mockScoringRules);
      // QB: 300 * 0.04 + 2 * 4 + 1 * (-2) = 12 + 8 - 2 = 18
      // RB: 100 * 0.1 + 1 * 6 = 10 + 6 = 16
      // Total: 18 + 16 = 34
      expect(score).toBe(34);
    });

    it('should handle team with no players', () => {
      const team = { players: [] };
      const score = calculateTeamScore(team, mockScoringRules);
      expect(score).toBe(0);
    });

    it('should handle team with missing players array', () => {
      const team = {};
      const score = calculateTeamScore(team, mockScoringRules);
      expect(score).toBe(0);
    });
  });

  describe('sortTeamsByScore', () => {
    it('should sort teams by score in descending order', () => {
      const teams = [
        {
          id: 'team1',
          players: [{ stats: { rushingYards: 100, rushingTD: 1 } }]
        },
        {
          id: 'team2',
          players: [{ stats: { rushingYards: 200, rushingTD: 2 } }]
        },
        {
          id: 'team3',
          players: [{ stats: { rushingYards: 50, rushingTD: 0 } }]
        }
      ];

      const sorted = sortTeamsByScore(teams, mockScoringRules);
      expect(sorted[0].id).toBe('team2'); // Highest score
      expect(sorted[1].id).toBe('team1'); // Middle score
      expect(sorted[2].id).toBe('team3'); // Lowest score
    });
  });

  describe('getPlayersByPosition', () => {
    it('should filter players by position', () => {
      const players = [
        { id: '1', position: 'QB', name: 'Player 1' },
        { id: '2', position: 'RB', name: 'Player 2' },
        { id: '3', position: 'QB', name: 'Player 3' },
        { id: '4', position: 'WR', name: 'Player 4' }
      ];

      const qbs = getPlayersByPosition(players, 'QB');
      expect(qbs).toHaveLength(2);
      expect(qbs[0].name).toBe('Player 1');
      expect(qbs[1].name).toBe('Player 3');
    });
  });

  describe('getPlayersByPlayoffTeam', () => {
    it('should filter players by playoff team', () => {
      const players = [
        { id: '1', playoffTeam: 'KC', name: 'Player 1' },
        { id: '2', playoffTeam: 'BAL', name: 'Player 2' },
        { id: '3', playoffTeam: 'KC', name: 'Player 3' },
        { id: '4', playoffTeam: 'BUF', name: 'Player 4' }
      ];

      const kcPlayers = getPlayersByPlayoffTeam(players, 'KC');
      expect(kcPlayers).toHaveLength(2);
      expect(kcPlayers[0].name).toBe('Player 1');
      expect(kcPlayers[1].name).toBe('Player 3');
    });
  });

  describe('isTeamEliminated', () => {
    it('should return false for team with no players', () => {
      const team = { players: [] };
      expect(isTeamEliminated(team)).toBe(false);
    });

    it('should return false for team with active players', () => {
      const team = {
        players: [
          { isEliminated: false },
          { isEliminated: false }
        ]
      };
      expect(isTeamEliminated(team)).toBe(false);
    });

    it('should return true for team with all eliminated players', () => {
      const team = {
        players: [
          { isEliminated: true },
          { isEliminated: true }
        ]
      };
      expect(isTeamEliminated(team)).toBe(true);
    });

    it('should return false for team with mixed elimination status', () => {
      const team = {
        players: [
          { isEliminated: true },
          { isEliminated: false }
        ]
      };
      expect(isTeamEliminated(team)).toBe(false);
    });
  });
}); 