import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fantasy_playoff_db',
  password: 'password',
  port: 5432,
});

async function checkKickerStats() {
  try {
    // Find Brandon Aubrey's player ID
    const playerResult = await pool.query('SELECT id, name, position, team FROM players WHERE name ILIKE \'%aubrey%\' OR name ILIKE \'%brandon%\'');
    console.log('Players found:', playerResult.rows);
    
    if (playerResult.rows.length > 0) {
      const playerId = playerResult.rows[0].id;
      console.log('\nChecking stats for player ID:', playerId);
      
      // Get all stats for this player
      const statsResult = await pool.query('SELECT * FROM player_stats WHERE player_id = $1 ORDER BY week DESC, year DESC', [playerId]);
      console.log('\nStats found:', statsResult.rows.length);
      
      if (statsResult.rows.length > 0) {
        const latestStats = statsResult.rows[0];
        console.log('\nLatest stats for', playerResult.rows[0].name, ':');
        console.log('Week:', latestStats.week, 'Year:', latestStats.year);
        console.log('Field Goals 0-39:', latestStats.field_goals_0_39);
        console.log('Field Goals 40-49:', latestStats.field_goals_40_49);
        console.log('Field Goals 50+:', latestStats.field_goals_50_plus);
        console.log('Extra Points:', latestStats.extra_points);
        console.log('\nAll field goal related fields:');
        Object.keys(latestStats).forEach(key => {
          if (key.includes('field') || key.includes('extra') || key.includes('kick')) {
            console.log(key + ':', latestStats[key]);
          }
        });
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

checkKickerStats();
