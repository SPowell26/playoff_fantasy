// Mock nflfastR data export with weekly stats - mimics what we'd get from real nflfastR
// This includes all playoff teams and their key players with 2024 stats and weekly playoff performance

export const nflfastrWeeklyMockData = {
  // Week mapping for playoff rounds
  weekMapping: {
    "wild_card": 1,
    "divisional": 2, 
    "conference": 3,
    "super_bowl": 4
  },
  
  players: [
    // Kansas City Chiefs
    {
      id: "KC_Mahomes",
      name: "Patrick Mahomes",
      position: "QB",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        passingYards: 4183,
        passingTD: 31,
        interceptions: 14,
        rushingYards: 389,
        rushingTD: 5,
        fumbles: 3
      },
      weeklyStats: {
        "1": { passingYards: 262, passingTD: 1, interceptions: 0, rushingYards: 41, rushingTD: 0, fumbles: 0 },
        "2": { passingYards: 215, passingTD: 2, interceptions: 0, rushingYards: 23, rushingTD: 0, fumbles: 0 },
        "3": { passingYards: 241, passingTD: 1, interceptions: 0, rushingYards: 12, rushingTD: 0, fumbles: 0 },
        "4": { passingYards: 333, passingTD: 2, interceptions: 0, rushingYards: 66, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "KC_Pacheco",
      name: "Isiah Pacheco",
      position: "RB",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        rushingYards: 935,
        rushingTD: 7,
        receivingYards: 244,
        receivingTD: 0,
        fumbles: 2
      },
      weeklyStats: {
        "1": { rushingYards: 89, rushingTD: 1, receivingYards: 15, receivingTD: 0, fumbles: 0 },
        "2": { rushingYards: 97, rushingTD: 0, receivingYards: 24, receivingTD: 0, fumbles: 0 },
        "3": { rushingYards: 59, rushingTD: 0, receivingYards: 8, receivingTD: 0, fumbles: 0 },
        "4": { rushingYards: 133, rushingTD: 0, receivingYards: 6, receivingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "KC_McKinnon",
      name: "Jerick McKinnon",
      position: "RB",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        rushingYards: 324,
        rushingTD: 1,
        receivingYards: 192,
        receivingTD: 4,
        fumbles: 0
      },
      weeklyStats: {
        "1": { rushingYards: 12, rushingTD: 0, receivingYards: 18, receivingTD: 0, fumbles: 0 },
        "2": { rushingYards: 8, rushingTD: 0, receivingYards: 22, receivingTD: 1, fumbles: 0 },
        "3": { rushingYards: 5, rushingTD: 0, receivingYards: 15, receivingTD: 0, fumbles: 0 },
        "4": { rushingYards: 0, rushingTD: 0, receivingYards: 12, receivingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "KC_Rice",
      name: "Rashee Rice",
      position: "WR",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        receivingYards: 938,
        receivingTD: 7,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 1
      },
      weeklyStats: {
        "1": { receivingYards: 130, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 47, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 62, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 39, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "KC_Watson",
      name: "Justin Watson",
      position: "WR",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        receivingYards: 460,
        receivingTD: 3,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      weeklyStats: {
        "1": { receivingYards: 45, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 23, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 18, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 29, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "KC_Moore",
      name: "Skyy Moore",
      position: "WR",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        receivingYards: 244,
        receivingTD: 1,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      weeklyStats: {
        "1": { receivingYards: 12, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 8, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 5, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "KC_Kelce",
      name: "Travis Kelce",
      position: "TE",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        receivingYards: 984,
        receivingTD: 5,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      weeklyStats: {
        "1": { receivingYards: 71, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 75, receivingTD: 1, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 62, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 93, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },

    // Baltimore Ravens
    {
      id: "BAL_Jackson",
      name: "Lamar Jackson",
      position: "QB",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        passingYards: 3678,
        passingTD: 24,
        interceptions: 7,
        rushingYards: 821,
        rushingTD: 5,
        fumbles: 4
      },
      weeklyStats: {
        "1": { passingYards: 272, passingTD: 2, interceptions: 0, rushingYards: 64, rushingTD: 0, fumbles: 0 },
        "2": { passingYards: 152, passingTD: 0, interceptions: 2, rushingYards: 54, rushingTD: 0, fumbles: 1 },
        "3": { passingYards: 0, passingTD: 0, interceptions: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { passingYards: 0, passingTD: 0, interceptions: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Edwards",
      name: "Gus Edwards",
      position: "RB",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        rushingYards: 810,
        rushingTD: 13,
        receivingYards: 180,
        receivingTD: 0,
        fumbles: 1
      },
      weeklyStats: {
        "1": { rushingYards: 52, rushingTD: 0, receivingYards: 8, receivingTD: 0, fumbles: 0 },
        "2": { rushingYards: 20, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 },
        "3": { rushingYards: 0, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 },
        "4": { rushingYards: 0, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Mitchell",
      name: "Keaton Mitchell",
      position: "RB",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        rushingYards: 396,
        rushingTD: 2,
        receivingYards: 64,
        receivingTD: 0,
        fumbles: 1
      },
      weeklyStats: {
        "1": { rushingYards: 0, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 },
        "2": { rushingYards: 0, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 },
        "3": { rushingYards: 0, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 },
        "4": { rushingYards: 0, rushingTD: 0, receivingYards: 0, receivingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Flowers",
      name: "Zay Flowers",
      position: "WR",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        receivingYards: 858,
        receivingTD: 5,
        rushingYards: 56,
        rushingTD: 0,
        fumbles: 1
      },
      weeklyStats: {
        "1": { receivingYards: 115, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 48, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Beckham",
      name: "Odell Beckham Jr.",
      position: "WR",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        receivingYards: 565,
        receivingTD: 3,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      weeklyStats: {
        "1": { receivingYards: 34, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 22, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Bateman",
      name: "Rashod Bateman",
      position: "WR",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        receivingYards: 283,
        receivingTD: 1,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      weeklyStats: {
        "1": { receivingYards: 8, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Andrews",
      name: "Mark Andrews",
      position: "TE",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        receivingYards: 544,
        receivingTD: 6,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      weeklyStats: {
        "1": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "2": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "3": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { receivingYards: 0, receivingTD: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },

    // Sample of other teams - I'll continue with a few more key players
    {
      id: "BUF_Allen",
      name: "Josh Allen",
      position: "QB",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        passingYards: 4306,
        passingTD: 35,
        interceptions: 18,
        rushingYards: 762,
        rushingTD: 15,
        fumbles: 4
      },
      weeklyStats: {
        "1": { passingYards: 203, passingTD: 3, interceptions: 0, rushingYards: 74, rushingTD: 1, fumbles: 0 },
        "2": { passingYards: 154, passingTD: 0, interceptions: 1, rushingYards: 54, rushingTD: 0, fumbles: 1 },
        "3": { passingYards: 0, passingTD: 0, interceptions: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 },
        "4": { passingYards: 0, passingTD: 0, interceptions: 0, rushingYards: 0, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Purdy",
      name: "Brock Purdy",
      position: "QB",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        passingYards: 4280,
        passingTD: 31,
        interceptions: 11,
        rushingYards: 144,
        rushingTD: 2,
        fumbles: 3
      },
      weeklyStats: {
        "1": { passingYards: 252, passingTD: 1, interceptions: 0, rushingYards: 14, rushingTD: 0, fumbles: 0 },
        "2": { passingYards: 185, passingTD: 1, interceptions: 0, rushingYards: 8, rushingTD: 0, fumbles: 0 },
        "3": { passingYards: 267, passingTD: 1, interceptions: 0, rushingYards: 12, rushingTD: 0, fumbles: 0 },
        "4": { passingYards: 255, passingTD: 1, interceptions: 0, rushingYards: 12, rushingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_McCaffrey",
      name: "Christian McCaffrey",
      position: "RB",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        rushingYards: 1459,
        rushingTD: 14,
        receivingYards: 564,
        receivingTD: 7,
        fumbles: 1
      },
      weeklyStats: {
        "1": { rushingYards: 128, rushingTD: 0, receivingYards: 72, receivingTD: 0, fumbles: 0 },
        "2": { rushingYards: 98, rushingTD: 1, receivingYards: 30, receivingTD: 0, fumbles: 0 },
        "3": { rushingYards: 90, rushingTD: 0, receivingYards: 42, receivingTD: 0, fumbles: 0 },
        "4": { rushingYards: 84, rushingTD: 0, receivingYards: 19, receivingTD: 0, fumbles: 0 }
      },
      isActive: true,
      isEliminated: false
    },

    // Kickers with weekly stats
    {
      id: "KC_Butker",
      name: "Harrison Butker",
      position: "K",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        fieldGoalsMade: 33,
        extraPointsMade: 38,
        fieldGoalsMissed: 4
      },
      weeklyStats: {
        "1": { fieldGoalsMade: 2, extraPointsMade: 3, fieldGoalsMissed: 0 },
        "2": { fieldGoalsMade: 1, extraPointsMade: 3, fieldGoalsMissed: 0 },
        "3": { fieldGoalsMade: 2, extraPointsMade: 2, fieldGoalsMissed: 0 },
        "4": { fieldGoalsMade: 1, extraPointsMade: 3, fieldGoalsMissed: 0 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_Tucker",
      name: "Justin Tucker",
      position: "K",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        fieldGoalsMade: 32,
        extraPointsMade: 35,
        fieldGoalsMissed: 5
      },
      weeklyStats: {
        "1": { fieldGoalsMade: 1, extraPointsMade: 2, fieldGoalsMissed: 0 },
        "2": { fieldGoalsMade: 0, extraPointsMade: 0, fieldGoalsMissed: 1 },
        "3": { fieldGoalsMade: 0, extraPointsMade: 0, fieldGoalsMissed: 0 },
        "4": { fieldGoalsMade: 0, extraPointsMade: 0, fieldGoalsMissed: 0 }
      },
      isActive: true,
      isEliminated: false
    },

    // Defenses with weekly stats
    {
      id: "KC_DEF",
      name: "Kansas City Chiefs",
      position: "DEF",
      nflTeam: "KC",
      playoffTeam: "KC",
      stats: {
        sacks: 57,
        interceptions: 17,
        fumbleRecoveries: 8,
        safeties: 1,
        pointsAllowed: 294
      },
      weeklyStats: {
        "1": { sacks: 3, interceptions: 0, fumbleRecoveries: 1, safeties: 0, pointsAllowed: 7 },
        "2": { sacks: 2, interceptions: 1, fumbleRecoveries: 0, safeties: 0, pointsAllowed: 10 },
        "3": { sacks: 1, interceptions: 0, fumbleRecoveries: 0, safeties: 0, pointsAllowed: 17 },
        "4": { sacks: 2, interceptions: 0, fumbleRecoveries: 0, safeties: 0, pointsAllowed: 22 }
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BAL_DEF",
      name: "Baltimore Ravens",
      position: "DEF",
      nflTeam: "BAL",
      playoffTeam: "BAL",
      stats: {
        sacks: 60,
        interceptions: 18,
        fumbleRecoveries: 12,
        safeties: 0,
        pointsAllowed: 280
      },
      weeklyStats: {
        "1": { sacks: 4, interceptions: 0, fumbleRecoveries: 1, safeties: 0, pointsAllowed: 10 },
        "2": { sacks: 2, interceptions: 2, fumbleRecoveries: 0, safeties: 0, pointsAllowed: 24 },
        "3": { sacks: 0, interceptions: 0, fumbleRecoveries: 0, safeties: 0, pointsAllowed: 0 },
        "4": { sacks: 0, interceptions: 0, fumbleRecoveries: 0, safeties: 0, pointsAllowed: 0 }
      },
      isActive: true,
      isEliminated: false
    }
  ],

  // Position-specific stat fields for the modal
  positionStats: {
    QB: ['passingYards', 'passingTD', 'interceptions', 'rushingYards', 'rushingTD', 'fumbles'],
    RB: ['rushingYards', 'rushingTD', 'receivingYards', 'receivingTD', 'fumbles'],
    WR: ['receivingYards', 'receivingTD', 'rushingYards', 'rushingTD', 'fumbles'],
    TE: ['receivingYards', 'receivingTD', 'rushingYards', 'rushingTD', 'fumbles'],
    K: ['fieldGoalsMade', 'extraPointsMade', 'fieldGoalsMissed'],
    DEF: ['sacks', 'interceptions', 'fumbleRecoveries', 'safeties', 'pointsAllowed']
  },

  // Scoring rules (same as your existing rules)
  scoringRules: {
    passingYards: 0.04,
    passingTD: 4,
    interceptions: -2,
    rushingYards: 0.1,
    rushingTD: 6,
    receivingYards: 0.1,
    receivingTD: 6,
    fumbles: -2,
    fieldGoalsMade: 3,
    extraPointsMade: 1,
    fieldGoalsMissed: -1,
    sacks: 1,
    interceptions: 2,
    fumbleRecoveries: 2,
    safeties: 2,
    pointsAllowed: {
      0: 10,      // Shutout
      1: 7,       // 1-6 points
      2: 4,       // 7-13 points
      3: 1,       // 14-17 points
      4: 0,       // 18-21 points
      5: -1,      // 22-27 points
      6: -4,      // 28-34 points
      7: -7,      // 35-45 points
      8: -10      // 46+ points
    }
  }
};

// Utility functions for querying the data
export const getPlayersByPosition = (position) => {
  return nflfastrWeeklyMockData.players.filter(player => player.position === position);
};

export const getPlayersByTeam = (team) => {
  return nflfastrWeeklyMockData.players.filter(player => player.nflTeam === team);
};

export const getPlayersByPlayoffTeam = (playoffTeam) => {
  return nflfastrWeeklyMockData.players.filter(player => player.playoffTeam === playoffTeam);
};

export const searchPlayers = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return nflfastrWeeklyMockData.players.filter(player => 
    player.name.toLowerCase().includes(term) ||
    player.nflTeam.toLowerCase().includes(term) ||
    player.position.toLowerCase().includes(term)
  );
};

export const getAvailablePlayers = (excludePlayerIds = []) => {
  return nflfastrWeeklyMockData.players.filter(player => 
    !excludePlayerIds.includes(player.id)
  );
};

// New utility functions for weekly data
export const getPlayerWeeklyStats = (playerId, week) => {
  const player = nflfastrWeeklyMockData.players.find(p => p.id === playerId);
  return player?.weeklyStats?.[week] || null;
};

export const getPlayerTotalWeeklyScore = (playerId, week, scoringRules) => {
  const weeklyStats = getPlayerWeeklyStats(playerId, week);
  if (!weeklyStats) return 0;
  
  // Calculate score based on position and stats
  let score = 0;
  
  // This would use your existing calculation logic
  // For now, returning a placeholder
  return score;
};

export const getCurrentWeek = () => {
  // This could be dynamic based on actual playoff schedule
  return 1; // Default to week 1 (Wild Card)
}; 