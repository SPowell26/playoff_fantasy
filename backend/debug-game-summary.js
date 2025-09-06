const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugGameSummary() {
  try {
    console.log('🔍 Fetching current week scoreboard to get a valid game ID...');
    
    // First get the scoreboard to find a valid game
    const scoreboardResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const scoreboardData = await scoreboardResponse.json();
    
    if (!scoreboardData.events || scoreboardData.events.length === 0) {
      console.log('❌ No games found in scoreboard');
      return;
    }
    
    const game = scoreboardData.events[0];
    console.log(`🏈 Found game: ${game.name} (ID: ${game.id})`);
    
    // Now get the game summary
    console.log('🔍 Fetching game summary...');
    const gameSummaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`;
    const gameSummaryResponse = await fetch(gameSummaryUrl);
    
    if (!gameSummaryResponse.ok) {
      console.log(`❌ Failed to get game summary: ${gameSummaryResponse.status}`);
      return;
    }
    
    const gameSummaryData = await gameSummaryResponse.json();
    
    console.log('\n📊 GAME SUMMARY STRUCTURE:');
    console.log('========================');
    
    // Log the top-level structure
    console.log('\n🔍 Top-level keys:', Object.keys(gameSummaryData));
    
    // Log boxscore structure
    if (gameSummaryData.boxscore) {
      console.log('\n📋 BOXSCORE STRUCTURE:');
      console.log('  - Keys:', Object.keys(gameSummaryData.boxscore));
      
      // Log teams structure
      if (gameSummaryData.boxscore.teams) {
        console.log('\n🏈 TEAMS STRUCTURE:');
        console.log(`  - Number of teams: ${gameSummaryData.boxscore.teams.length}`);
        
        gameSummaryData.boxscore.teams.forEach((team, index) => {
          console.log(`\n  Team ${index} (${team.team?.abbreviation}):`);
          console.log(`    - Keys: ${Object.keys(team)}`);
          console.log(`    - Statistics available: ${!!team.statistics}`);
          console.log(`    - Number of stat categories: ${team.statistics?.length || 0}`);
          
          if (team.statistics && team.statistics.length > 0) {
            console.log(`    - Stat categories: ${team.statistics.map(s => s.name).join(', ')}`);
            
            // Log each stat category
            team.statistics.forEach(stat => {
              console.log(`      - ${stat.name}: ${stat.displayValue}`);
            });
          }
        });
      }
      
      // Log players structure
      if (gameSummaryData.boxscore.players) {
        console.log('\n👥 PLAYERS STRUCTURE:');
        console.log(`  - Number of player groups: ${gameSummaryData.boxscore.players.length}`);
        
        gameSummaryData.boxscore.players.forEach((playerGroup, index) => {
          console.log(`\n  Player Group ${index}:`);
          console.log(`    - Keys: ${Object.keys(playerGroup)}`);
          console.log(`    - Team: ${playerGroup.team?.abbreviation}`);
          console.log(`    - Statistics available: ${!!playerGroup.statistics}`);
          console.log(`    - Number of stat categories: ${playerGroup.statistics?.length || 0}`);
          
          if (playerGroup.statistics && playerGroup.statistics.length > 0) {
            console.log(`    - Stat categories: ${playerGroup.statistics.map(s => s.name).join(', ')}`);
            
            // Log defensive stats specifically
            const defensiveStats = playerGroup.statistics.find(s => s.name === 'defensive');
            if (defensiveStats) {
              console.log(`\n    🛡️ DEFENSIVE STATS for ${playerGroup.team?.abbreviation}:`);
              console.log(`      - Number of athletes: ${defensiveStats.athletes?.length || 0}`);
              
              if (defensiveStats.athletes && defensiveStats.athletes.length > 0) {
                console.log(`      - First few athletes:`);
                defensiveStats.athletes.slice(0, 3).forEach((athlete, athleteIndex) => {
                  console.log(`        Athlete ${athleteIndex}: ${athlete.athlete?.displayName}`);
                  console.log(`          - Stats array: [${athlete.stats?.join(', ') || 'none'}]`);
                  console.log(`          - Stats length: ${athlete.stats?.length || 0}`);
                });
              }
            }
          }
        });
      }
    }
    
    // Log header/competition structure
    if (gameSummaryData.header) {
      console.log('\n📋 HEADER STRUCTURE:');
      console.log('  - Keys:', Object.keys(gameSummaryData.header));
      
      if (gameSummaryData.header.competitions) {
        console.log(`  - Number of competitions: ${gameSummaryData.header.competitions.length}`);
        
        gameSummaryData.header.competitions.forEach((comp, index) => {
          console.log(`\n  Competition ${index}:`);
          console.log(`    - Keys: ${Object.keys(comp)}`);
          console.log(`    - Number of competitors: ${comp.competitors?.length || 0}`);
          
          if (comp.competitors) {
            comp.competitors.forEach((competitor, compIndex) => {
              console.log(`      Competitor ${compIndex}: ${competitor.team?.abbreviation} - Score: ${competitor.score}`);
            });
          }
        });
      }
    }
    
    console.log('\n✅ Game summary structure analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugGameSummary();
