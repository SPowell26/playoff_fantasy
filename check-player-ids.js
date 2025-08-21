import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'Yoshi420!',
  database: 'fantasy_playoff_db',
  port: 5432
});

async function checkPlayerIds() {
  try {
    console.log('🔍 Checking player IDs in detail...\n');
    
    // Check the specific players mentioned in the console logs
    const specificPlayers = await pool.query(`
      SELECT id, name, position, team 
      FROM players 
      WHERE name IN ('A.J. Brown', 'A.J. Green', 'Justin Jefferson', 'Patrick Mahomes', 'Saquon Barkley')
      ORDER BY id
    `);
    
    console.log('📊 Specific players from console logs:');
    specificPlayers.rows.forEach(row => {
      console.log(`   ID: ${row.id}, Name: ${row.name}, Position: ${row.position}, Team: ${row.team}`);
    });
    
    // Check what the ID ranges look like for different positions
    const idRanges = await pool.query(`
      SELECT 
        position,
        MIN(id) as min_id,
        MAX(id) as max_id,
        COUNT(*) as count
      FROM players 
      GROUP BY position 
      ORDER BY position
    `);
    
    console.log('\n📈 ID ranges by position:');
    idRanges.rows.forEach(row => {
      console.log(`   ${row.position}: ID range ${row.min_id} - ${row.max_id} (${row.count} players)`);
    });
    
    // Check for any suspiciously small IDs
    const smallIds = await pool.query(`
      SELECT id, name, position, team 
      FROM players 
      WHERE id < 1000
      ORDER BY id
    `);
    
    console.log('\n⚠️ Players with suspiciously small IDs (< 1000):');
    if (smallIds.rows.length > 0) {
      smallIds.rows.forEach(row => {
        console.log(`   ID: ${row.id}, Name: ${row.name}, Position: ${row.position}, Team: ${row.team}`);
      });
    } else {
      console.log('   ✅ No suspiciously small IDs found');
    }
    
  } catch (error) {
    console.error('❌ Error checking player IDs:', error);
  } finally {
    await pool.end();
  }
}

checkPlayerIds();
