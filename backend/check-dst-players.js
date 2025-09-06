import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fantasy_playoff_db',
  password: process.env.DB_PASSWORD || 'your_password_here',
  port: 5432,
});

async function checkDstPlayers() {
  try {
    console.log('🔍 Checking D/ST players in database...');
    
    const result = await pool.query("SELECT id, name, position, team FROM players WHERE position = 'D/ST' ORDER BY id");
    
    console.log('D/ST Players in database:');
    console.log('ID | Name | Position | Team');
    console.log('---|------|----------|-----');
    result.rows.forEach(player => {
      console.log(`${player.id} | ${player.name} | ${player.position} | ${player.team}`);
    });
    console.log(`\nTotal D/ST players: ${result.rows.length}`);
    
    // Check if we have D/ST stats
    console.log('\n🔍 Checking for D/ST stats...');
    const statsResult = await pool.query(`
      SELECT 
        p.name,
        p.team,
        ps.week,
        ps.year,
        ps.sacks,
        ps.interceptions_defense,
        ps.fumble_recoveries,
        ps.points_allowed
      FROM players p
      JOIN player_stats ps ON p.id = ps.player_id
      WHERE p.position = 'D/ST'
      ORDER BY ps.year DESC, ps.week DESC
      LIMIT 10
    `);
    
    if (statsResult.rows.length > 0) {
      console.log('D/ST Stats found:');
      statsResult.rows.forEach(stat => {
        console.log(`${stat.name} (${stat.team}) - Week ${stat.week}, ${stat.year}: ${stat.sacks} sacks, ${stat.interceptions_defense} INTs, ${stat.fumble_recoveries} FRs, ${stat.points_allowed} PA`);
      });
    } else {
      console.log('No D/ST stats found in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDstPlayers();
