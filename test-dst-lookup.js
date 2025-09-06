import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fantasy_playoff_db',
  password: 'password',
  port: 5432,
});

async function testDstLookup() {
  try {
    console.log('🔍 Testing D/ST player lookup...');
    
    // Test team abbreviations that might be in the D/ST stats
    const testTeams = ['DAL', 'PHI', 'PIT', 'BAL', 'KC', 'BUF'];
    
    for (const team of testTeams) {
      const result = await pool.query(
        'SELECT id, name, team FROM players WHERE position = \'D/ST\' AND team = $1',
        [team]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ Found D/ST player for ${team}:`, result.rows[0]);
      } else {
        console.log(`❌ No D/ST player found for ${team}`);
      }
    }
    
    // Check what team abbreviations exist in the database
    console.log('\n📊 All D/ST team abbreviations in database:');
    const allTeams = await pool.query(
      'SELECT DISTINCT team FROM players WHERE position = \'D/ST\' ORDER BY team'
    );
    console.log(allTeams.rows.map(row => row.team));
    
    // Check if there are any D/ST stats in the database
    console.log('\n📊 D/ST stats in database:');
    const dstStats = await pool.query(`
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
    
    if (dstStats.rows.length > 0) {
      console.log('✅ D/ST stats found:');
      dstStats.rows.forEach(stat => {
        console.log(`  ${stat.name} (${stat.team}): Week ${stat.week}, Year ${stat.year} - ${stat.sacks} sacks, ${stat.interceptions_defense} INTs`);
      });
    } else {
      console.log('❌ No D/ST stats found in database');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error testing D/ST lookup:', error);
    await pool.end();
  }
}

testDstLookup();
