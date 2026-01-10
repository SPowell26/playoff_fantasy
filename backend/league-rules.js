/**
 * Fantasy Football League Rules
 * 
 * This file contains the league rules structure for the playoff fantasy football league.
 * These rules serve as both defaults for new leagues and the structure for custom scoring.
 */

const LEAGUE_RULES = {
  // ============================================================================
  // ROSTER STRUCTURE
  // ============================================================================
  roster: {
    size: 12, // Total roster spots (10 starters + 2 bench)
    positions: [
      "QB",    // Quarterback
      "RB",    // Running Back
      "RB",    // Running Back (second)
      "WR",    // Wide Receiver
      "WR",    // Wide Receiver (second)
      "TE",    // Tight End
      "W/R/T", // Wide Receiver, Running Back, or Tight End (flex)
      "K",     // Kicker
      "DEF",   // Defense/Special Teams
      "BN",    // Bench (backup player)
      "BN"     // Bench (second backup player)
    ],
    draft: {
      rounds: 12,
      benchSpots: 2,
      benchUsage: "Can fill in once a player is out"
    }
  },

  // ============================================================================
  // DYNAMIC SCORING RULES (Configurable per league)
  // ============================================================================
  scoringRules: {
    // Offensive Scoring
    offensive: {
      passing: {
        yardsPerPoint: 0.04,        // 1 point per 25 yards (1/25 = 0.04)
        touchdownPoints: 4,         // 4 points per passing TD
        interceptionPoints: -2      // -2 points per INT
      },
      rushing: {
        yardsPerPoint: 0.1,         // 1 point per 10 yards (1/10 = 0.1)
        touchdownPoints: 6          // 6 points per rushing TD
      },
      receiving: {
        yardsPerPoint: 0.1,         // 1 point per 10 yards (1/10 = 0.1)
        touchdownPoints: 6          // 6 points per receiving TD
      },
      receptionPoints: 1,           // Points per reception (PPR)
      fumbles: {
        lostPoints: -2              // -2 points per fumble lost
      }
    },

    // Defense/Special Teams Scoring
    defensive: {
      specialTeams: {
        blockedKickPoints: 2,       // 2 points for blocked kick
        safetyPoints: 2,            // 2 points for Safety
        fumbleRecoveryPoints: 1,    // 1 point for Forced Fumble recovery
        interceptionPoints: 2,      // 2 points for interception
        sackPoints: 1,              // 1 point for sack
        puntReturnTDPoints: 6,      // 6 points for punt return TD
        kickoffReturnTDPoints: 6    // 6 points for kickoff return TD
      },
      pointsAllowed: {
        shutoutPoints: 10,          // 10 points for shutout (0 points)
        oneToSixPoints: 7,          // 7 points for 1-6 points allowed
        sevenToThirteenPoints: 4,   // 4 points for 7-13 points allowed
        fourteenToTwentyPoints: 1,  // 1 point for 14-20 points allowed
        twentyOneToTwentySevenPoints: 0,  // 0 points for 21-27 points allowed
        twentyEightToThirtyFourPoints: -1, // -1 point for 28-34 points allowed
        thirtyFivePlusPoints: -4    // -4 points for 35+ points allowed
      },
      teamWinPoints: 6              // 6 points for team win
    },

    // Kicker Scoring
    kicker: {
      fieldGoals: {
        zeroToThirtyNinePoints: 3,  // 3 points: field goals 0-39 yards
        fortyToFortyNinePoints: 4,  // 4 points: field goals 40-49 yards
        fiftyPlusPoints: 5          // 5 points: field goals 50+ yards
      },
      extraPointPoints: 1           // 1 point for extra point
    }
  },



  // ============================================================================
  // LEAGUE FORMAT
  // ============================================================================
     leagueFormat: {
     type: "Playoff Fantasy Football",
     duration: "Playoff season only",
     winner: "Whoever has the most total points at the end of the Super Bowl wins the league",
     draftType: "Snake draft (12 rounds)",
     benchUsage: "Two bench spots that can be used to replace eliminated players"
   },

  // ============================================================================
  // SCORING CALCULATION EXAMPLES
  // ============================================================================
  examples: {
    quarterback: {
      description: "QB throws for 250 yards, 2 TDs, 1 INT",
      calculation: "250 yards × 0.04 = 10 points + (2 TDs × 4) = 8 points + (1 INT × -2) = -2 points",
      total: "10 + 8 - 2 = 16 points"
    },
    runningBack: {
      description: "RB rushes for 120 yards, 1 TD",
      calculation: "120 yards × 0.1 = 12 points + (1 TD × 6) = 6 points",
      total: "12 + 6 = 18 points"
    },
    defense: {
      description: "DEF allows 14 points, gets 2 sacks, 1 INT",
      calculation: "14 points allowed = 1 point + (2 sacks × 1) = 2 points + (1 INT × 2) = 2 points",
      total: "1 + 2 + 2 = 5 points"
    },
    kicker: {
      description: "K makes 45-yard FG, 35-yard FG, 2 extra points",
      calculation: "45-yard FG = 4 points + 35-yard FG = 3 points + (2 XP × 1) = 2 points",
      total: "4 + 3 + 2 = 9 points"
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS FOR SCORING CALCULATIONS
// ============================================================================

/**
 * Calculate offensive player fantasy points
 * @param {Object} stats - Player statistics
 * @param {string} position - Player position (QB, RB, WR, TE)
 * @param {Object} scoringRules - League scoring rules (optional, uses defaults if not provided)
 * @returns {number} Total fantasy points
 */
function calculateOffensivePoints(stats, position, scoringRules = LEAGUE_RULES.scoringRules.offensive) {
  let points = 0;
  
  // Passing stats (mainly for QBs)
  if (stats.passing_yards) {
    points += stats.passing_yards * scoringRules.passing.yardsPerPoint;
  }
  if (stats.passing_touchdowns) {
    points += stats.passing_touchdowns * scoringRules.passing.touchdownPoints;
  }
  if (stats.interceptions) {
    points += stats.interceptions * scoringRules.passing.interceptionPoints;
  }
  
  // Rushing stats
  if (stats.rushing_yards) {
    points += stats.rushing_yards * scoringRules.rushing.yardsPerPoint;
  }
  if (stats.rushing_touchdowns) {
    points += stats.rushing_touchdowns * scoringRules.rushing.touchdownPoints;
  }
  
  // Receiving stats
  if (stats.receiving_yards) {
    points += stats.receiving_yards * scoringRules.receiving.yardsPerPoint;
  }
  if (stats.receiving_touchdowns) {
    points += stats.receiving_touchdowns * scoringRules.receiving.touchdownPoints;
  }
  
  // Fumbles
  if (stats.fumbles_lost) {
    points += stats.fumbles_lost * scoringRules.fumbles.lostPoints;
  }
  
  return points; 
}

/**
 * Calculate defensive fantasy points
 * @param {Object} stats - Defensive statistics
 * @param {Object} scoringRules - League scoring rules (optional, uses defaults if not provided)
 * @returns {number} Total fantasy points
 */
function calculateDefensivePoints(stats, scoringRules = LEAGUE_RULES.scoringRules.defensive) {
  let points = 0;
  
  // Special teams and defensive plays
  if (stats.blocked_kicks) points += stats.blocked_kicks * scoringRules.specialTeams.blockedKickPoints;
  if (stats.safeties) points += stats.safeties * scoringRules.specialTeams.safetyPoints;
  if (stats.fumble_recoveries) points += stats.fumble_recoveries * scoringRules.specialTeams.fumbleRecoveryPoints;
  if (stats.interceptions) points += stats.interceptions * scoringRules.specialTeams.interceptionPoints;
  if (stats.sacks) points += stats.sacks * scoringRules.specialTeams.sackPoints;
  if (stats.punt_return_touchdowns) points += stats.punt_return_touchdowns * scoringRules.specialTeams.puntReturnTDPoints;
  if (stats.kickoff_return_touchdowns) points += stats.kickoff_return_touchdowns * scoringRules.specialTeams.kickoffReturnTDPoints;
  
  // Points allowed
  const pointsAllowed = stats.points_allowed || 0;
  if (pointsAllowed === 0) points += scoringRules.pointsAllowed.shutoutPoints;
  else if (pointsAllowed <= 6) points += scoringRules.pointsAllowed.oneToSixPoints;
  else if (pointsAllowed <= 13) points += scoringRules.pointsAllowed.sevenToThirteenPoints;
  else if (pointsAllowed <= 20) points += scoringRules.pointsAllowed.fourteenToTwentyPoints;
  else if (pointsAllowed <= 27) points += scoringRules.pointsAllowed.twentyOneToTwentySevenPoints;
  else if (pointsAllowed <= 34) points += scoringRules.pointsAllowed.twentyEightToThirtyFourPoints;
  else points += scoringRules.pointsAllowed.thirtyFivePlusPoints;
  
  // Team win
  if (stats.team_win) points += scoringRules.teamWinPoints;
  
  return points;
}

/**
 * Calculate kicker fantasy points
 * @param {Object} stats - Kicker statistics
 * @param {Object} scoringRules - League scoring rules (optional, uses defaults if not provided)
 * @returns {number} Total fantasy points
 */
function calculateKickerPoints(stats, scoringRules = LEAGUE_RULES.scoringRules.kicker) {
  let points = 0;
  
  // Field goals by distance
  if (stats.field_goals_0_39) points += stats.field_goals_0_39 * scoringRules.fieldGoals.zeroToThirtyNinePoints;
  if (stats.field_goals_40_49) points += stats.field_goals_40_49 * scoringRules.fieldGoals.fortyToFortyNinePoints;
  if (stats.field_goals_50_plus) points += stats.field_goals_50_plus * scoringRules.fieldGoals.fiftyPlusPoints;
  
  // Extra points
  if (stats.extra_points) points += stats.extra_points * scoringRules.extraPointPoints;
  
  return points;
}

/**
 * Get scoring rules for a specific league
 * @param {Object} leagueRules - League-specific scoring rules (optional)
 * @returns {Object} Complete scoring rules object
 */
function getScoringRules(leagueRules = null) {
  if (!leagueRules) {
    return LEAGUE_RULES.scoringRules;
  }
  
  // Return the league's scoring rules directly (they're already in the right format)
  return leagueRules;
}

/**
 * Get default scoring rules for new leagues
 * @returns {Object} Copy of default scoring rules for a new league
 */
function getDefaultScoringRules() {
  return JSON.parse(JSON.stringify(LEAGUE_RULES.scoringRules));
}

// Export everything for use in the application
export {
  LEAGUE_RULES,
  calculateOffensivePoints,
  calculateDefensivePoints,
  calculateKickerPoints,
  getScoringRules,
  getDefaultScoringRules
};

console.log('🏈 League Rules loaded successfully!');
console.log('📋 Available exports:');
console.log('- LEAGUE_RULES');
console.log('- calculateOffensivePoints()');
console.log('- calculateDefensivePoints()');
console.log('- calculateKickerPoints()');
console.log('- getScoringRules()');
console.log('- getDefaultScoringRules()');
