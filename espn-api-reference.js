/**
 * ESPN API Data Structure Reference
 * 
 * This file contains the raw data structures from ESPN API endpoints
 * for easy reference when building the fantasy football app.
 */

// ============================================================================
// 1. ATHLETES ENDPOINT (Players)
// ============================================================================
// URL: https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=7000
// Purpose: Get all NFL players with basic info

const athletesDataStructure = {
  "athletes": [
    {
      "id": "4429202",                    // Unique player ID
      "firstName": "Israel",              // Player's first name
      "lastName": "Abanikanda",           // Player's last name
      "displayName": "Israel Abanikanda", // Full display name
      "weight": 217,                      // Weight in pounds
      "height": 70,                       // Height in inches
      "age": 22,                          // Player's age
      "team": {                           // Team information
        "id": "9",                        // Team ID
        "abbreviation": "GB",             // Team abbreviation
        "displayName": "Green Bay Packers" // Full team name
      },
      "jersey": "23",                     // Jersey number
      "position": {                       // Position information
        "abbreviation": "RB"              // Position abbreviation (QB, RB, WR, etc.)
      },
      "draft": {                          // Draft information
        "round": 5,                       // Draft round
        "year": 2023,                     // Draft year
        "selection": 143                  // Overall pick number
      },
      "status": {                         // Player status
        "type": "active"                  // active, injured, inactive, etc.
      },
      "alternateIds": {                   // Alternative IDs
        "sdr": "4429202"                  // Secondary ID system
      }
    }
  ]
};

// ============================================================================
// 2. EVENTS ENDPOINT (Games)
// ============================================================================
// URL: https://partners.api.espn.com/v2/sports/football/nfl/events?limit=1000
// Purpose: Get game schedules, results, and matchups

const eventsDataStructure = {
  "events": [
    {
      "id": "401772971",                  // Unique game ID
      "date": "2025-08-01T00:00Z",       // Game date/time (ISO format)
      "name": "Los Angeles Chargers at Detroit Lions", // Game name
      "shortName": "LAC VS DET",         // Short game name
      "timeValid": true,                  // Whether time is valid
      "competitions": [                   // Competition details
        {
          "id": "401772971",             // Competition ID (same as event ID)
          "date": "2025-08-01T00:00Z",   // Competition date
          "attendance": 18144,           // Attendance number
          "dateValid": true,             // Whether date is valid
          "neutralSite": true,           // Whether neutral site game
          "onWatchESPN": false,          // Whether on WatchESPN
          "wallclockAvailable": true,    // Whether live clock available
          "highlightsAvailable": true,   // Whether highlights available
          "competitors": [               // Teams competing
            {
              "id": "8",                 // Team ID
              "type": "team",            // Type (team)
              "order": 0,                // Order (0 = home, 1 = away)
              "homeAway": "home",        // home or away
              "winner": false,           // Whether team won
              "team": {                  // Team information
                "id": "8",               // Team ID
                "location": "Detroit",   // Team location
                "name": "Lions",         // Team name
                "abbreviation": "DET",   // Team abbreviation
                "displayName": "Detroit Lions", // Full team name
                "shortDisplayName": "Lions", // Short team name
                "color": "0076b6"        // Team color (hex)
              }
            }
            // Second team would be here with order: 1, homeAway: "away"
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// 3. FANTASY ENDPOINT (Scoring)
// ============================================================================
// URL: https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring
// Purpose: Get fantasy scoring data and player stats

const fantasyDataStructure = [
  {
    "fullName": "Israel Abanikanda",     // Player's full name
    "id": 4429202,                       // Player ID (matches athletes endpoint)
    "proTeamId": 25,                     // Pro team ID
    "stats": [                           // Array of stat periods
      {
        "externalId": "202415",          // External ID for the period
        "id": "11202415",                // Unique stat ID
        "proTeamId": 0,                  // Pro team ID (0 = no team)
        "scoringPeriodId": 15,           // Scoring period (week number)
        "seasonId": 2024,                // Season year
        "statSourceId": 1,               // Stat source ID
        "statSplitTypeId": 1,            // Stat split type
        "stats": {}                      // Actual stats object (empty during off-season)
        // During season, this would contain:
        // "stats": {
        //   "0": 250,    // Passing yards
        //   "1": 2,      // Passing TDs
        //   "2": 1,      // Interceptions
        //   "3": 45,     // Rushing yards
        //   "4": 1       // Rushing TDs
        // }
      }
      // Multiple stat periods for different weeks/seasons
    ]
  }
];

// ============================================================================
// 4. INDIVIDUAL PLAYER ENDPOINT
// ============================================================================
// URL: https://partners.api.espn.com/v2/sports/football/nfl/athletes/{playerId}
// Purpose: Get detailed stats for a specific player

const individualPlayerStructure = {
  "id": "4429202",                       // Player ID
  "name": "Israel Abanikanda",           // Player name
  "position": {                          // Position details
    "abbreviation": "RB",                // Position abbreviation
    "displayName": "Running Back"        // Full position name
  },
  "team": {                              // Current team
    "id": "9",
    "abbreviation": "GB",
    "displayName": "Green Bay Packers"
  },
  "stats": {                             // Player statistics
    // This object contains various stat categories
    // Structure varies by player and season
    "passing": {                         // Passing stats (for QBs)
      "yards": 0,
      "touchdowns": 0,
      "interceptions": 0
    },
    "rushing": {                         // Rushing stats (for RBs)
      "yards": 45,
      "touchdowns": 1,
      "attempts": 12
    },
    "receiving": {                       // Receiving stats (for WRs/TEs)
      "yards": 0,
      "touchdowns": 0,
      "receptions": 0
    }
  }
};

// ============================================================================
// 5. USEFUL FIELD MAPPINGS
// ============================================================================

const fieldMappings = {
  // Player identification
  playerId: "id",                        // Use for API calls
  playerName: "displayName",             // Use for display
  playerFullName: "firstName + lastName", // Combine for full name
  
  // Team information
  teamId: "team.id",
  teamName: "team.displayName",
  teamAbbreviation: "team.abbreviation",
  
  // Position information
  position: "position.abbreviation",
  
  // Game information
  gameId: "id",
  gameDate: "date",
  gameName: "name",
  homeTeam: "competitions[0].competitors.find(c => c.homeAway === 'home')",
  awayTeam: "competitions[0].competitors.find(c => c.homeAway === 'away')",
  
  // Fantasy scoring
  fantasyStats: "stats[].stats",         // Array of stat objects
  scoringPeriod: "stats[].scoringPeriodId" // Week number
};

// ============================================================================
// 6. API ENDPOINT SUMMARY
// ============================================================================

const apiEndpoints = {
  // Get all players (limit 7000 for full roster)
  athletes: "https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=7000",
  
  // Get games/events (limit 1000 for full season)
  events: "https://partners.api.espn.com/v2/sports/football/nfl/events?limit=1000",
  
  // Get fantasy scoring data
  fantasy: "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring",
  
  // Get individual player details
  player: (playerId) => `https://partners.api.espn.com/v2/sports/football/nfl/athletes/${playerId}`,
  
  // Get games by date range
  eventsByDate: (startDate, endDate) => 
    `https://partners.api.espn.com/v2/sports/football/nfl/events?dates=${startDate}-${endDate}&limit=1000`
};

// Export for use in other files
module.exports = {
  athletesDataStructure,
  eventsDataStructure,
  fantasyDataStructure,
  individualPlayerStructure,
  fieldMappings,
  apiEndpoints
};

console.log('📚 ESPN API Reference loaded successfully!');
console.log('📋 Available exports:');
console.log('- athletesDataStructure');
console.log('- eventsDataStructure'); 
console.log('- fantasyDataStructure');
console.log('- individualPlayerStructure');
console.log('- fieldMappings');
console.log('- apiEndpoints'); 