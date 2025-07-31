// Mock data for development and testing
// This will be replaced with real data storage later

export const mockLeagues = [
  {
    id: "league_1",
    name: "NFL Playoff Fantasy 2024",
    owner: "user_1",
    createdAt: "2024-01-15T10:00:00Z",
    status: "active",
    maxTeams: 8,
    currentTeams: 4,
    teams: [
      {
        id: "team_1",
        leagueId: "league_1",
        owner: "user_1",
        name: "Mahomes Magic",
        players: [
          {
            id: "player_1",
            name: "Patrick Mahomes",
            position: "QB",
            nflTeam: "KC",
            playoffTeam: "KC",
            stats: {
              passingYards: 345,
              passingTD: 4,
              interceptions: 1,
              rushingYards: 69,
              rushingTD: 1
            },
            isActive: true,
            isEliminated: false
          },
          {
            id: "player_2",
            name: "Christian McCaffrey",
            position: "RB",
            nflTeam: "SF",
            playoffTeam: "SF",
            stats: {
              rushingYards: 250,
              rushingTD: 2,
              receivingYards: 69,
              receivingTD: 2,
              fumbles: 1
            },
            isActive: true,
            isEliminated: false
          }
        ],
        totalScore: 0
      },
      {
        id: "team_2",
        leagueId: "league_1",
        owner: "user_2",
        name: "Lamar's Legends",
        players: [
          {
            id: "player_3",
            name: "Lamar Jackson",
            position: "QB",
            nflTeam: "BAL",
            playoffTeam: "BAL",
            stats: {
              passingYards: 0,
              passingTD: 0,
              interceptions: 0,
              rushingYards: 0,
              rushingTD: 0
            },
            isActive: true,
            isEliminated: false
          }
        ],
        totalScore: 0
      }
    ],
    settings: {
      scoringRules: {
        passingYards: 0.04,
        passingTD: 4,
        interceptions: -2,
        rushingYards: 0.1,
        rushingTD: 6,
        receivingYards: 0.1,
        receivingTD: 6,
        fumbles: -2
      },
      playoffTeams: ["KC", "BAL", "BUF", "HOU", "SF", "DET", "GB", "TB"]
    }
  }
];

export const mockTeams = [
  {
    id: "team_1",
    leagueId: "league_1",
    owner: "user_1",
    name: "Mahomes Magic",
    players: [
      {
        id: "player_1",
        name: "Patrick Mahomes",
        position: "QB",
        nflTeam: "KC",
        playoffTeam: "KC",
        stats: {
          passingYards: 0,
          passingTD: 0,
          interceptions: 0,
          rushingYards: 0,
          rushingTD: 0
        },
        isActive: true,
        isEliminated: false
      },
      {
        id: "player_2",
        name: "Christian McCaffrey",
        position: "RB",
        nflTeam: "SF",
        playoffTeam: "SF",
        stats: {
          rushingYards: 0,
          rushingTD: 0,
          receivingYards: 0,
          receivingTD: 0,
          fumbles: 0
        },
        isActive: true,
        isEliminated: false
      }
    ],
    totalScore: 0
  },
  {
    id: "team_2",
    leagueId: "league_1",
    owner: "user_2",
    name: "Lamar's Legends",
    players: [
      {
        id: "player_3",
        name: "Lamar Jackson",
        position: "QB",
        nflTeam: "BAL",
        playoffTeam: "BAL",
        stats: {
          passingYards: 0,
          passingTD: 0,
          interceptions: 0,
          rushingYards: 0,
          rushingTD: 0
        },
        isActive: true,
        isEliminated: false
      }
    ],
    totalScore: 0
  }
];

export const mockPlayers = [
  // Quarterbacks
  { id: "qb_1", name: "Patrick Mahomes", position: "QB", nflTeam: "KC", playoffTeam: "KC" },
  { id: "qb_2", name: "Lamar Jackson", position: "QB", nflTeam: "BAL", playoffTeam: "BAL" },
  { id: "qb_3", name: "Josh Allen", position: "QB", nflTeam: "BUF", playoffTeam: "BUF" },
  { id: "qb_4", name: "C.J. Stroud", position: "QB", nflTeam: "HOU", playoffTeam: "HOU" },
  { id: "qb_5", name: "Brock Purdy", position: "QB", nflTeam: "SF", playoffTeam: "SF" },
  { id: "qb_6", name: "Jared Goff", position: "QB", nflTeam: "DET", playoffTeam: "DET" },
  { id: "qb_7", name: "Jordan Love", position: "QB", nflTeam: "GB", playoffTeam: "GB" },
  { id: "qb_8", name: "Baker Mayfield", position: "QB", nflTeam: "TB", playoffTeam: "TB" },
  
  // Running Backs
  { id: "rb_1", name: "Christian McCaffrey", position: "RB", nflTeam: "SF", playoffTeam: "SF" },
  { id: "rb_2", name: "Isiah Pacheco", position: "RB", nflTeam: "KC", playoffTeam: "KC" },
  { id: "rb_3", name: "Gus Edwards", position: "RB", nflTeam: "BAL", playoffTeam: "BAL" },
  { id: "rb_4", name: "James Cook", position: "RB", nflTeam: "BUF", playoffTeam: "BUF" },
  { id: "rb_5", name: "Devin Singletary", position: "RB", nflTeam: "HOU", playoffTeam: "HOU" },
  { id: "rb_6", name: "Jahmyr Gibbs", position: "RB", nflTeam: "DET", playoffTeam: "DET" },
  { id: "rb_7", name: "Aaron Jones", position: "RB", nflTeam: "GB", playoffTeam: "GB" },
  { id: "rb_8", name: "Rachaad White", position: "RB", nflTeam: "TB", playoffTeam: "TB" },
  
  // Wide Receivers
  { id: "wr_1", name: "Tyreek Hill", position: "WR", nflTeam: "MIA", playoffTeam: "KC" },
  { id: "wr_2", name: "Zay Flowers", position: "WR", nflTeam: "BAL", playoffTeam: "BAL" },
  { id: "wr_3", name: "Stefon Diggs", position: "WR", nflTeam: "BUF", playoffTeam: "BUF" },
  { id: "wr_4", name: "Nico Collins", position: "WR", nflTeam: "HOU", playoffTeam: "HOU" },
  { id: "wr_5", name: "Brandon Aiyuk", position: "WR", nflTeam: "SF", playoffTeam: "SF" },
  { id: "wr_6", name: "Amon-Ra St. Brown", position: "WR", nflTeam: "DET", playoffTeam: "DET" },
  { id: "wr_7", name: "Jayden Reed", position: "WR", nflTeam: "GB", playoffTeam: "GB" },
  { id: "wr_8", name: "Mike Evans", position: "WR", nflTeam: "TB", playoffTeam: "TB" }
]; 