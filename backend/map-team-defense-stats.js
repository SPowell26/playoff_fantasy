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
    points_allowed: opponentScore || 0, // Set points allowed to opponent's score
    team_win: isWinner || false,
    
    // Fantasy points (will be calculated)
    fantasy_points: 0
  };
  
  // Map ESPN team stats to our format using the correct stat names we discovered
  for (const stat of teamStats) {
    switch (stat.name) {
      case 'sacksYardsLost':
        // Format: "2-15" (sacks-yards) - this is sacks allowed by this team
        if (stat.displayValue && stat.displayValue.includes('-')) {
          const sacks = parseInt(stat.displayValue.split('-')[0]) || 0;
          // Don't count sacks allowed as sacks for D/ST - we need sacks made
          console.log(`  🔍 Sacks allowed by this team: ${sacks} (not counted for D/ST)`);
        }
        break;
        
      case 'defensiveSpecialTeamsTds':
        // This is defensive/special teams TDs scored BY the team
        const defTDs = parseInt(stat.displayValue) || 0;
        dstStats.defensive_touchdowns = defTDs;
        console.log(`  🎯 Defensive/Special Teams TDs: ${defTDs}`);
        break;
        
      case 'turnovers':
        // This is turnovers by this team (not what we want for D/ST)
        console.log(`  🔍 Turnovers by this team: ${stat.displayValue} (not counted for D/ST)`);
        break;
        
      case 'fumblesLost':
        // This is fumbles lost by this team (not what we want for D/ST)
        console.log(`  🔍 Fumbles lost by this team: ${stat.displayValue} (not counted for D/ST)`);
        break;
        
      case 'interceptions':
        // This is interceptions thrown by this team (not what we want for D/ST)
        console.log(`  🔍 Interceptions thrown by this team: ${stat.displayValue} (not counted for D/ST)`);
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
  
  // NOW GET INTERCEPTIONS, FUMBLES, AND SACKS FROM OPPONENT (the swap!)
  if (opponentStats) {
    console.log(`  🔍 Available opponent stats:`, opponentStats.map(s => s.name));
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
          
        case 'sacksYardsLost':
          // This is sacks allowed BY the opponent (credit goes to this team's D/ST)
          console.log(`  🔍 Opponent sacksYardsLost raw value: "${stat.displayValue}"`);
          if (stat.displayValue && stat.displayValue.includes('-')) {
            const parts = stat.displayValue.split('-');
            const sacks = parseInt(parts[0]) || 0;
            const yards = parseInt(parts[1]) || 0;
            dstStats.sacks = sacks;
            console.log(`  🎯 Sacks (from opponent): ${sacks}, Yards: ${yards}`);
          }
          break;
      }
    }
  }
  
  return dstStats;
}

/**
 * Extract individual defensive stats for a specific team only
 */
function extractIndividualDefenseStatsForTeam(gameSummaryData, teamAbbr) {
  const stats = {
    sacks: 0,
    interceptions_defense: 0,
    fumble_recoveries: 0,
    safeties: 0,
    blocked_kicks: 0,
    punt_return_touchdowns: 0,
    kickoff_return_touchdowns: 0
  };
  
  // Look through players for the specific team only
  if (gameSummaryData.boxscore?.players) {
    console.log(`  🔍 Looking for team ${teamAbbr} in player data...`);
    gameSummaryData.boxscore.players.forEach((team, teamIndex) => {
      console.log(`  🔍 Team ${teamIndex}: ${team.team?.abbreviation}`);
      
      // Only process the team we're interested in
      if (team.team?.abbreviation !== teamAbbr) {
        console.log(`  ⏭️ Skipping team ${team.team?.abbreviation} (not ${teamAbbr})`);
        return;
      }
      
      console.log(`  ✅ Found team ${teamAbbr}, processing stats...`);
      
      if (!team.statistics) {
        console.log(`  ❌ No statistics for team ${teamAbbr}`);
        return;
      }
      
      team.statistics.forEach(statCategory => {
        if (!statCategory.athletes) return;
        
        console.log(`  🔍 Processing stat category: ${statCategory.name} (${statCategory.athletes.length} athletes)`);
        
        statCategory.athletes.forEach((athlete, athleteIndex) => {
          if (!athlete.stats) return;
          
          // Sum up individual defensive stats for this team only
          if (statCategory.name === 'defensive') {
            const athleteSacks = parseInt(athlete.stats[1]) || 0;
            const athleteInts = parseInt(athlete.stats[2]) || 0;
            const athleteFumRec = parseInt(athlete.stats[3]) || 0;
            
            console.log(`    🏈 Athlete ${athleteIndex}: Sacks=${athleteSacks}, INTs=${athleteInts}, FumRec=${athleteFumRec}`);
            
            stats.sacks += athleteSacks;
            stats.interceptions_defense += athleteInts;
            stats.fumble_recoveries += athleteFumRec;
          }
          
          // Special teams return TDs - separate categories
          if (statCategory.name === 'puntReturns') {
            // ESPN punt return format: [returns, yards, avg, long, td]
            if (athlete.stats && athlete.stats.length >= 5) {
              const puntReturnTDs = parseInt(athlete.stats[4]) || 0;
              stats.punt_return_touchdowns += puntReturnTDs;
              if (puntReturnTDs > 0) {
                console.log(`    🏈 Punt Return TD: ${puntReturnTDs}`);
              }
            }
          }
          
          if (statCategory.name === 'kickReturns') {
            // ESPN kick return format: [returns, yards, avg, long, td]
            if (athlete.stats && athlete.stats.length >= 5) {
              const kickoffReturnTDs = parseInt(athlete.stats[4]) || 0;
              stats.kickoff_return_touchdowns += kickoffReturnTDs;
              if (kickoffReturnTDs > 0) {
                console.log(`    🏈 Kickoff Return TD: ${kickoffReturnTDs}`);
              }
            }
          }
        });
      });
    });
  }
  
  console.log(`  🎯 ${teamAbbr} individual defensive stats:`, stats);
  return stats;
}

/**
 * Extract individual defensive stats from all players in a game
 * This supplements the team-level stats with individual player defensive stats
 */
function extractIndividualDefenseStats(gameSummaryData) {
  const stats = {
    sacks: 0,
    interceptions_defense: 0,
    fumble_recoveries: 0,
    safeties: 0,
    blocked_kicks: 0,
    punt_return_touchdowns: 0,
    kickoff_return_touchdowns: 0
  };
  
  // Look through all players for defensive stats
  if (gameSummaryData.boxscore?.players) {
    gameSummaryData.boxscore.players.forEach(team => {
      if (!team.statistics) return;
      
      team.statistics.forEach(statCategory => {
        if (!statCategory.athletes) return;
        
        statCategory.athletes.forEach(athlete => {
          if (!athlete.stats) return;
          
          // Sum up individual defensive stats
          if (statCategory.name === 'defensive') {
            // ESPN defensive format: [tackles, sacks, interceptions, fumble_recoveries, passes_defended, touchdowns]
            stats.sacks += parseInt(athlete.stats[1]) || 0; // stats[1] = sacks
            stats.interceptions_defense += parseInt(athlete.stats[2]) || 0; // stats[2] = interceptions
            stats.fumble_recoveries += parseInt(athlete.stats[3]) || 0; // stats[3] = fumble_recoveries
            // Note: Safeties are not available in this defensive stats array
            // They would need to be extracted from special teams stats or individual player stats
            // stats.blocked_kicks += parseInt(athlete.stats[4]) || 0; // stats[4] = passes_defended, not blocked kicks
          }
          
          // Special teams return TDs - separate categories
          if (statCategory.name === 'puntReturns') {
            // ESPN punt return format: [returns, yards, avg, long, td]
            if (athlete.stats && athlete.stats.length >= 5) {
              const puntReturnTDs = parseInt(athlete.stats[4]) || 0;
              stats.punt_return_touchdowns += puntReturnTDs;
              if (puntReturnTDs > 0) {
                console.log(`    🏈 Punt Return TD: ${puntReturnTDs}`);
              }
            }
          }
          
          if (statCategory.name === 'kickReturns') {
            // ESPN kick return format: [returns, yards, avg, long, td]
            if (athlete.stats && athlete.stats.length >= 5) {
              const kickoffReturnTDs = parseInt(athlete.stats[4]) || 0;
              stats.kickoff_return_touchdowns += kickoffReturnTDs;
              if (kickoffReturnTDs > 0) {
                console.log(`    🏈 Kickoff Return TD: ${kickoffReturnTDs}`);
              }
            }
          }
        });
      });
    });
  }
  
  console.log(`  🎯 Individual defensive stats:`, stats);
  return stats;
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
    teamWinPoints: 6
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
  
  // Team win (6 points if team won)
  if (dstStats.team_win) points += 6; // 6 points for team win
  
  return points;
}

/**
 * Process a complete game to extract D/ST stats for both teams
 */
function processGameForDST(gameSummaryData, currentWeek = 1, currentYear = 2025) {
  console.log(`🏈 Processing game for D/ST stats...`);
  
  const dstResults = [];
  
  if (!gameSummaryData.boxscore?.teams || !gameSummaryData.header?.competitions) {
    console.log('❌ Missing required data structures');
    return dstResults;
  }
  
  // Debug: Log the structure of team stats
  console.log(`🔍 Game summary structure:`);
  console.log(`  - boxscore.teams exists:`, !!gameSummaryData.boxscore?.teams);
  console.log(`  - Number of teams:`, gameSummaryData.boxscore?.teams?.length);
  
  if (gameSummaryData.boxscore?.teams) {
    gameSummaryData.boxscore.teams.forEach((team, index) => {
      console.log(`  - Team ${index}: ${team.team?.abbreviation}`);
      console.log(`    - Statistics available:`, !!team.statistics);
      console.log(`    - Number of stat categories:`, team.statistics?.length);
      if (team.statistics) {
        console.log(`    - Stat categories:`, team.statistics.map(s => s.name));
      }
    });
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
  
  // Extract individual defensive stats from all players (this sums ALL teams)
  const individualDefenseStats = extractIndividualDefenseStats(gameSummaryData);
  console.log(`🛡️ Total individual defensive stats (ALL teams):`, individualDefenseStats);
  
  // Create a map of team stats for easy lookup
  const teamStatsMap = {};
  for (const team of gameSummaryData.boxscore.teams) {
    teamStatsMap[team.team.abbreviation] = team.statistics;
    
    // Debug: Log all available stats for this team
    console.log(`\n🔍 ${team.team.abbreviation} team stats:`);
    if (team.statistics) {
      team.statistics.forEach(stat => {
        console.log(`  - ${stat.name}: ${stat.displayValue}`);
      });
    }
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
    const teamDstStats = mapTeamDefenseStats(team.statistics, opponentScore, isWinner, opponentStats);
    
    // For D/ST, we only use team-level stats (no individual player stats needed)
    // Team-level stats are available and contain all the data we need
    const combinedDstStats = {
      ...teamDstStats
      // Note: All D/ST stats come from team-level data, not individual players
      // This avoids double-counting and uses the correct team totals
    };
    
    // Calculate fantasy points
    const fantasyPoints = calculateDSTFantasyPoints(combinedDstStats);
    combinedDstStats.fantasy_points = fantasyPoints;
    
    // Add team info
    const dstResult = {
      team: teamAbbr,
      week: currentWeek,
      year: currentYear,
      ...combinedDstStats
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
  processGameForDST,
  extractIndividualDefenseStats
};

console.log('🏈 Team Defense Stats mapping functions loaded!');
console.log('📋 Available exports:');
console.log('- mapTeamDefenseStats()');
console.log('- calculateDSTFantasyPoints()');
console.log('- processGameForDST()');
