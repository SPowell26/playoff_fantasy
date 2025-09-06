import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fantasy_playoff_db',
  password: process.env.DB_PASSWORD || 'your_password_here',
  port: 5432,
});

async function debugDstTeams() {
  try {
    console.log('🔍 Debugging D/ST team abbreviations...');
    
    // Get D/ST teams from database
    const dbResult = await pool.query("SELECT team FROM players WHERE position = 'D/ST' ORDER BY team");
    const dbTeams = dbResult.rows.map(row => row.team);
    console.log('📊 D/ST teams in database:', dbTeams);
    
    // Get current games from ESPN
    const scoreboardResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const scoreboardData = await scoreboardResponse.json();
    
    console.log('\n🏈 ESPN API games:');
    const espnTeams = new Set();
    
    for (const game of scoreboardData.events) {
      console.log(`Game: ${game.name}`);
      
      // Get detailed game data
      const gameSummaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`;
      const gameSummaryResponse = await fetch(gameSummaryUrl);
      
      if (gameSummaryResponse.ok) {
        const gameSummaryData = await gameSummaryResponse.json();
        
        if (gameSummaryData.boxscore?.teams) {
          for (const team of gameSummaryData.boxscore.teams) {
            const teamAbbr = team.team.abbreviation;
            espnTeams.add(teamAbbr);
            console.log(`  Team: ${teamAbbr} (${team.team.displayName})`);
          }
        }
      }
    }
    
    console.log('\n📊 ESPN team abbreviations:', Array.from(espnTeams).sort());
    
    // Check for matches
    const matches = dbTeams.filter(dbTeam => espnTeams.has(dbTeam));
    const missing = dbTeams.filter(dbTeam => !espnTeams.has(dbTeam));
    const extra = Array.from(espnTeams).filter(espnTeam => !dbTeams.includes(espnTeam));
    
    console.log('\n✅ Matching teams:', matches);
    console.log('❌ Missing from ESPN:', missing);
    console.log('➕ Extra in ESPN:', extra);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugDstTeams();
