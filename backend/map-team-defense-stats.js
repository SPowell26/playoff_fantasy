/**
 * Map ESPN team defensive stats to D/ST fantasy scoring format
 * Based on the data structure we found in boxscore.teams[teamIndex].statistics
 */

function mapTeamDefenseStats(teamStats, opponentScore, isWinner, opponentStats) {
  console.log(`🔍 Mapping team defensive stats:`, teamStats);
  
  // Initialize D/ST stats
  const dstStats = {
    // Team-level stats from ESPN
    sacks: 0,
    interceptions: 0,
    fumble_recoveries: 0,
    safeties: 0,
    blocked_kicks: 0,
    defensive_touchdowns: 0,
    punt_return_touchdowns: 0,
    kickoff_return_touchdowns: 0,
    
    // Calculated stats
    points_allowed: 0,
    team_win: false,
    
    // Fantasy points (will be calculated)
    fantasy_points: 0
  };
  
  // Map ESPN team stats to our format
  for (const stat of teamStats) {
    switch (stat.name) {
      case 'sacksYardsLost':
        // Format: "2-15" (sacks-yards)
        if (stat.displayValue && stat.displayValue.includes('-')) {
          const sacks = parseInt(stat.displayValue.split('-')[0]) || 0;
          dstStats.sacks = sacks;
          console.log(`  🎯 Sacks: ${sacks} from "${stat.displayValue}"`);
        }
        break;
        
      case 'defensiveTouchdowns':
        // This is defensive/special teams TDs scored BY the team
        const defTDs = parseInt(stat.displayValue) || 0;
        dstStats.defensive_touchdowns = defTDs;
        console.log(`  🎯 Defensive TDs: ${defTDs}`);
        break;
        
      default:
        // Check for other defensive stats
        if (stat.name && (
          stat.name.toLowerCase().includes('safety') ||
          stat.name.toLowerCase().includes('block') ||
          stat.name.toLowerCase().includes('return')
        )) {
          console.log(`  🔍 Potential defensive stat: ${stat.name} = ${stat.displayValue}`);
        }
        break;
    }
  }
  
  // NOW GET INTERCEPTIONS AND FUMBLES FROM OPPONENT (the swap!)
  if (opponentStats) {
    for (const stat of opponentStats) {
      switch (stat.name) {
        case 'interceptions':
          // This is interceptions thrown BY the opponent (credit goes to this team's D/ST)
          const opponentInts = parseInt(stat.displayValue) || 0;
          dstStats.interceptions = opponentInts;
          console.log(`  🎯 Interceptions (from opponent): ${opponentInts}`);
          break;
          
        case 'fumblesLost':
          // This is fumbles lost BY the opponent (credit goes to this team's D/ST)
          const opponentFumbles = parseInt(stat.displayValue) || 0;
          dstStats.fumble_recoveries = opponentFumbles;
          console.log(`  🎯 Fumble Recoveries (from opponent): ${opponentFumbles}`);
          break;
      }
    }
  }
  
  // Set points allowed (opponent's score)
  dstStats.points_allowed = opponentScore || 0;
  
  // Set team win/loss
  dstStats.team_win = isWinner || false;
  
  console.log(`  ✅ Mapped D/ST stats:`, dstStats);
  return dstStats;
}

/**
 * Calculate D/ST fantasy points based on league rules
 */
function calculateDSTFantasyPoints(dstStats, scoringRules = null) {
  // Use default scoring rules if none provided
  const rules = scoringRules || {
    specialTeams: {
      blockedKickPoints: 2,
      safetyPoints: 2,
      fumbleRecoveryPoints: 1,
      interceptionPoints: 2,
      sackPoints: 1,
      puntReturnTDPoints: 6,
      kickoffReturnTDPoints: 6
    },
    pointsAllowed: {
      shutoutPoints: 10,
      oneToSixPoints: 7,
      sevenToThirteenPoints: 4,
      fourteenToTwentyPoints: 1,
      twentyOneToTwentySevenPoints: 0,
      twentyEightToThirtyFourPoints: -1,
      thirtyFivePlusPoints: -4
    },
    teamWinPoints: 5
  };
  
  let points = 0;
  
  // Special teams and defensive plays
  points += dstStats.blocked_kicks * rules.specialTeams.blockedKickPoints;
  points += dstStats.safeties * rules.specialTeams.safetyPoints;
  points += dstStats.fumble_recoveries * rules.specialTeams.fumbleRecoveryPoints;
  points += dstStats.interceptions * rules.specialTeams.interceptionPoints;
  points += dstStats.sacks * rules.specialTeams.sackPoints;
  points += dstStats.punt_return_touchdowns * rules.specialTeams.puntReturnTDPoints;
  points += dstStats.kickoff_return_touchdowns * rules.specialTeams.kickoffReturnTDPoints;
  
  // Defensive touchdowns (these are already counted in return TDs, but some might be other types)
  // For now, we'll count them as general defensive TDs
  points += dstStats.defensive_touchdowns * 6; // 6 points for any defensive TD
  
  // Points allowed
  const pointsAllowed = dstStats.points_allowed;
  if (pointsAllowed === 0) points += rules.pointsAllowed.shutoutPoints;
  else if (pointsAllowed <= 6) points += rules.pointsAllowed.oneToSixPoints;
  else if (pointsAllowed <= 13) points += rules.pointsAllowed.sevenToThirteenPoints;
  else if (pointsAllowed <= 20) points += rules.pointsAllowed.fourteenToTwentyPoints;
  else if (pointsAllowed <= 27) points += rules.pointsAllowed.twentyOneToTwentySevenPoints;
  else if (pointsAllowed <= 34) points += rules.pointsAllowed.twentyEightToThirtyFourPoints;
  else points += rules.pointsAllowed.thirtyFivePlusPoints;
  
  // Team win
  if (dstStats.team_win) points += rules.teamWinPoints;
  
  return points;
}

/**
 * Process a complete game to extract D/ST stats for both teams
 */
function processGameForDST(gameSummaryData) {
  console.log(`🏈 Processing game for D/ST stats...`);
  
  const dstResults = [];
  
  if (!gameSummaryData.boxscore?.teams || !gameSummaryData.header?.competitions) {
    console.log('❌ Missing required data structures');
    return dstResults;
  }
  
  // Get team scores and winners from competition data
  const competition = gameSummaryData.header.competitions[0];
  const teamScores = {};
  const teamWinners = {};
  
  for (const competitor of competition.competitors) {
    const teamAbbr = competitor.team.abbreviation;
    teamScores[teamAbbr] = parseInt(competitor.score) || 0;
    teamWinners[teamAbbr] = competitor.winner || false;
  }
  
  console.log(`📊 Team scores:`, teamScores);
  console.log(`🏆 Team winners:`, teamWinners);
  
  // Create a map of team stats for easy lookup
  const teamStatsMap = {};
  for (const team of gameSummaryData.boxscore.teams) {
    teamStatsMap[team.team.abbreviation] = team.statistics;
  }
  
  // Process each team's defensive stats
  for (const team of gameSummaryData.boxscore.teams) {
    const teamAbbr = team.team.abbreviation;
    const opponentScore = teamScores[teamAbbr];
    const isWinner = teamWinners[teamAbbr];
    
    // Find the opponent team
    const opponentAbbr = Object.keys(teamStatsMap).find(abbr => abbr !== teamAbbr);
    const opponentStats = teamStatsMap[opponentAbbr];
    
    console.log(`\n🏈 Processing ${teamAbbr} D/ST stats (opponent: ${opponentAbbr}):`);
    
    // Map the team's defensive stats, but get interceptions/fumbles from OPPONENT
    const dstStats = mapTeamDefenseStats(team.statistics, opponentScore, isWinner, opponentStats);
    
    // Calculate fantasy points
    const fantasyPoints = calculateDSTFantasyPoints(dstStats);
    dstStats.fantasy_points = fantasyPoints;
    
    // Add team info
    const dstResult = {
      team: teamAbbr,
      week: gameSummaryData.header.week?.number,
      year: gameSummaryData.header.season?.year,
      ...dstStats
    };
    
    dstResults.push(dstResult);
    console.log(`  🎯 ${teamAbbr} D/ST: ${fantasyPoints} fantasy points`);
  }
  
  return dstResults;
}

// Export the functions
export {
  mapTeamDefenseStats,
  calculateDSTFantasyPoints,
  processGameForDST
};

console.log('🏈 Team Defense Stats mapping functions loaded!');
console.log('📋 Available exports:');
console.log('- mapTeamDefenseStats()');
console.log('- calculateDSTFantasyPoints()');
console.log('- processGameForDST()');
