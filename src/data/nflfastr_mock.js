// Mock nflfastR data export - mimics what we'd get from real nflfastR
// This includes all playoff teams and their key players with 2024 stats

export const nflfastrMockData = {
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
        "1": {
          passingYards: 262,
          passingTD: 1,
          interceptions: 0,
          rushingYards: 41,
          rushingTD: 0,
          fumbles: 0
        },
        "2": {
          passingYards: 215,
          passingTD: 2,
          interceptions: 0,
          rushingYards: 23,
          rushingTD: 0,
          fumbles: 0
        },
        "3": {
          passingYards: 241,
          passingTD: 1,
          interceptions: 0,
          rushingYards: 12,
          rushingTD: 0,
          fumbles: 0
        },
        "4": {
          passingYards: 333,
          passingTD: 2,
          interceptions: 0,
          rushingYards: 66,
          rushingTD: 0,
          fumbles: 0
        }
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
      isActive: true,
      isEliminated: false
    },

    // Buffalo Bills
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
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Cook",
      name: "James Cook",
      position: "RB",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        rushingYards: 1122,
        rushingTD: 2,
        receivingYards: 445,
        receivingTD: 4,
        fumbles: 2
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Murray",
      name: "Latavius Murray",
      position: "RB",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        rushingYards: 300,
        rushingTD: 4,
        receivingYards: 89,
        receivingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Diggs",
      name: "Stefon Diggs",
      position: "WR",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        receivingYards: 1183,
        receivingTD: 8,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Davis",
      name: "Gabe Davis",
      position: "WR",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        receivingYards: 746,
        receivingTD: 7,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Shakir",
      name: "Khalil Shakir",
      position: "WR",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        receivingYards: 611,
        receivingTD: 2,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Knox",
      name: "Dawson Knox",
      position: "TE",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        receivingYards: 186,
        receivingTD: 2,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },

    // Houston Texans
    {
      id: "HOU_Stroud",
      name: "C.J. Stroud",
      position: "QB",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        passingYards: 4108,
        passingTD: 23,
        interceptions: 5,
        rushingYards: 167,
        rushingTD: 3,
        fumbles: 2
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Singletary",
      name: "Devin Singletary",
      position: "RB",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        rushingYards: 898,
        rushingTD: 4,
        receivingYards: 193,
        receivingTD: 0,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Pierce",
      name: "Dameon Pierce",
      position: "RB",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        rushingYards: 416,
        rushingTD: 2,
        receivingYards: 101,
        receivingTD: 0,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Collins",
      name: "Nico Collins",
      position: "WR",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        receivingYards: 1297,
        receivingTD: 8,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Dell",
      name: "Tank Dell",
      position: "WR",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        receivingYards: 709,
        receivingTD: 7,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Brown",
      name: "Noah Brown",
      position: "WR",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        receivingYards: 567,
        receivingTD: 2,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Schultz",
      name: "Dalton Schultz",
      position: "TE",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        receivingYards: 635,
        receivingTD: 5,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },

    // San Francisco 49ers
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
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Mason",
      name: "Jordan Mason",
      position: "RB",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        rushingYards: 257,
        rushingTD: 1,
        receivingYards: 45,
        receivingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Aiyuk",
      name: "Brandon Aiyuk",
      position: "WR",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        receivingYards: 1342,
        receivingTD: 7,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Deebo",
      name: "Deebo Samuel",
      position: "WR",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        receivingYards: 892,
        receivingTD: 7,
        rushingYards: 225,
        rushingTD: 5,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Jennings",
      name: "Jauan Jennings",
      position: "WR",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        receivingYards: 265,
        receivingTD: 1,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Kittle",
      name: "George Kittle",
      position: "TE",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        receivingYards: 1020,
        receivingTD: 6,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },

    // Detroit Lions
    {
      id: "DET_Goff",
      name: "Jared Goff",
      position: "QB",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        passingYards: 4575,
        passingTD: 30,
        interceptions: 12,
        rushingYards: 21,
        rushingTD: 0,
        fumbles: 2
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_Gibbs",
      name: "Jahmyr Gibbs",
      position: "RB",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        rushingYards: 945,
        rushingTD: 10,
        receivingYards: 316,
        receivingTD: 1,
        fumbles: 2
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_Montgomery",
      name: "David Montgomery",
      position: "RB",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        rushingYards: 1015,
        rushingTD: 13,
        receivingYards: 117,
        receivingTD: 0,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_StBrown",
      name: "Amon-Ra St. Brown",
      position: "WR",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        receivingYards: 1515,
        receivingTD: 10,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_Reynolds",
      name: "Josh Reynolds",
      position: "WR",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        receivingYards: 608,
        receivingTD: 5,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_LaPorta",
      name: "Sam LaPorta",
      position: "TE",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        receivingYards: 889,
        receivingTD: 10,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },

    // Green Bay Packers
    {
      id: "GB_Love",
      name: "Jordan Love",
      position: "QB",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        passingYards: 4159,
        passingTD: 32,
        interceptions: 11,
        rushingYards: 247,
        rushingTD: 4,
        fumbles: 3
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Jones",
      name: "Aaron Jones",
      position: "RB",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        rushingYards: 656,
        rushingTD: 2,
        receivingYards: 233,
        receivingTD: 1,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Dillon",
      name: "AJ Dillon",
      position: "RB",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        rushingYards: 613,
        rushingTD: 2,
        receivingYards: 223,
        receivingTD: 0,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Reed",
      name: "Jayden Reed",
      position: "WR",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        receivingYards: 793,
        receivingTD: 8,
        rushingYards: 119,
        rushingTD: 2,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Wicks",
      name: "Dontayvion Wicks",
      position: "WR",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        receivingYards: 581,
        receivingTD: 4,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Doubs",
      name: "Romeo Doubs",
      position: "WR",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        receivingYards: 674,
        receivingTD: 8,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Musgrave",
      name: "Luke Musgrave",
      position: "TE",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        receivingYards: 352,
        receivingTD: 1,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },

    // Tampa Bay Buccaneers
    {
      id: "TB_Mayfield",
      name: "Baker Mayfield",
      position: "QB",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        passingYards: 4044,
        passingTD: 28,
        interceptions: 10,
        rushingYards: 163,
        rushingTD: 1,
        fumbles: 2
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_White",
      name: "Rachaad White",
      position: "RB",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        rushingYards: 990,
        rushingTD: 6,
        receivingYards: 549,
        receivingTD: 3,
        fumbles: 1
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_Edmonds",
      name: "Chase Edmonds",
      position: "RB",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        rushingYards: 176,
        rushingTD: 0,
        receivingYards: 81,
        receivingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_Evans",
      name: "Mike Evans",
      position: "WR",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        receivingYards: 1255,
        receivingTD: 13,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_Godwin",
      name: "Chris Godwin",
      position: "WR",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        receivingYards: 1024,
        receivingTD: 2,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_Palmer",
      name: "Trey Palmer",
      position: "WR",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        receivingYards: 385,
        receivingTD: 3,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_Otton",
      name: "Cade Otton",
      position: "TE",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        receivingYards: 455,
        receivingTD: 4,
        rushingYards: 0,
        rushingTD: 0,
        fumbles: 0
      },
      isActive: true,
      isEliminated: false
    },

    // Kickers
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
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_Bass",
      name: "Tyler Bass",
      position: "K",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        fieldGoalsMade: 24,
        extraPointsMade: 52,
        fieldGoalsMissed: 7
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_Fairbairn",
      name: "Ka'imi Fairbairn",
      position: "K",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        fieldGoalsMade: 27,
        extraPointsMade: 33,
        fieldGoalsMissed: 3
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_Moody",
      name: "Jake Moody",
      position: "K",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        fieldGoalsMade: 21,
        extraPointsMade: 60,
        fieldGoalsMissed: 6
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_Badgley",
      name: "Chase Badgley",
      position: "K",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        fieldGoalsMade: 20,
        extraPointsMade: 45,
        fieldGoalsMissed: 4
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_Carlson",
      name: "Anders Carlson",
      position: "K",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        fieldGoalsMade: 27,
        extraPointsMade: 34,
        fieldGoalsMissed: 8
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_McLaughlin",
      name: "Chase McLaughlin",
      position: "K",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        fieldGoalsMade: 29,
        extraPointsMade: 32,
        fieldGoalsMissed: 2
      },
      isActive: true,
      isEliminated: false
    },

    // Defenses
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
      isActive: true,
      isEliminated: false
    },
    {
      id: "BUF_DEF",
      name: "Buffalo Bills",
      position: "DEF",
      nflTeam: "BUF",
      playoffTeam: "BUF",
      stats: {
        sacks: 54,
        interceptions: 18,
        fumbleRecoveries: 9,
        safeties: 0,
        pointsAllowed: 335
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "HOU_DEF",
      name: "Houston Texans",
      position: "DEF",
      nflTeam: "HOU",
      playoffTeam: "HOU",
      stats: {
        sacks: 46,
        interceptions: 14,
        fumbleRecoveries: 7,
        safeties: 0,
        pointsAllowed: 377
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "SF_DEF",
      name: "San Francisco 49ers",
      position: "DEF",
      nflTeam: "SF",
      playoffTeam: "SF",
      stats: {
        sacks: 48,
        interceptions: 22,
        fumbleRecoveries: 10,
        safeties: 1,
        pointsAllowed: 298
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "DET_DEF",
      name: "Detroit Lions",
      position: "DEF",
      nflTeam: "DET",
      playoffTeam: "DET",
      stats: {
        sacks: 41,
        interceptions: 15,
        fumbleRecoveries: 8,
        safeties: 0,
        pointsAllowed: 395
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "GB_DEF",
      name: "Green Bay Packers",
      position: "DEF",
      nflTeam: "GB",
      playoffTeam: "GB",
      stats: {
        sacks: 45,
        interceptions: 7,
        fumbleRecoveries: 6,
        safeties: 0,
        pointsAllowed: 371
      },
      isActive: true,
      isEliminated: false
    },
    {
      id: "TB_DEF",
      name: "Tampa Bay Buccaneers",
      position: "DEF",
      nflTeam: "TB",
      playoffTeam: "TB",
      stats: {
        sacks: 48,
        interceptions: 17,
        fumbleRecoveries: 9,
        safeties: 0,
        pointsAllowed: 348
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
  return nflfastrMockData.players.filter(player => player.position === position);
};

export const getPlayersByTeam = (team) => {
  return nflfastrMockData.players.filter(player => player.nflTeam === team);
};

export const getPlayersByPlayoffTeam = (playoffTeam) => {
  return nflfastrMockData.players.filter(player => player.playoffTeam === playoffTeam);
};

export const searchPlayers = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return nflfastrMockData.players.filter(player => 
    player.name.toLowerCase().includes(term) ||
    player.nflTeam.toLowerCase().includes(term) ||
    player.position.toLowerCase().includes(term)
  );
};

export const getAvailablePlayers = (excludePlayerIds = []) => {
  return nflfastrMockData.players.filter(player => 
    !excludePlayerIds.includes(player.id)
  );
}; 