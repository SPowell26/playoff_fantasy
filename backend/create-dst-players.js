/**
 * Create D/ST players for all 32 NFL teams
 * D/ST players are virtual players that represent team defense/special teams
 */

import pkg from 'pg';
const { Pool } = pkg;

// All 32 NFL teams
const NFL_TEAMS = [
  { abbreviation: 'ARI', name: 'Arizona Cardinals' },
  { abbreviation: 'ATL', name: 'Atlanta Falcons' },
  { abbreviation: 'BAL', name: 'Baltimore Ravens' },
  { abbreviation: 'BUF', name: 'Buffalo Bills' },
  { abbreviation: 'CAR', name: 'Carolina Panthers' },
  { abbreviation: 'CHI', name: 'Chicago Bears' },
  { abbreviation: 'CIN', name: 'Cincinnati Bengals' },
  { abbreviation: 'CLE', name: 'Cleveland Browns' },
  { abbreviation: 'DAL', name: 'Dallas Cowboys' },
  { abbreviation: 'DEN', name: 'Denver Broncos' },
  { abbreviation: 'DET', name: 'Detroit Lions' },
  { abbreviation: 'GB', name: 'Green Bay Packers' },
  { abbreviation: 'HOU', name: 'Houston Texans' },
  { abbreviation: 'IND', name: 'Indianapolis Colts' },
  { abbreviation: 'JAX', name: 'Jacksonville Jaguars' },
  { abbreviation: 'KC', name: 'Kansas City Chiefs' },
  { abbreviation: 'LV', name: 'Las Vegas Raiders' },
  { abbreviation: 'LAC', name: 'Los Angeles Chargers' },
  { abbreviation: 'LAR', name: 'Los Angeles Rams' },
  { abbreviation: 'MIA', name: 'Miami Dolphins' },
  { abbreviation: 'MIN', name: 'Minnesota Vikings' },
  { abbreviation: 'NE', name: 'New England Patriots' },
  { abbreviation: 'NO', name: 'New Orleans Saints' },
  { abbreviation: 'NYG', name: 'New York Giants' },
  { abbreviation: 'NYJ', name: 'New York Jets' },
  { abbreviation: 'PHI', name: 'Philadelphia Eagles' },
  { abbreviation: 'PIT', name: 'Pittsburgh Steelers' },
  { abbreviation: 'SF', name: 'San Francisco 49ers' },
  { abbreviation: 'SEA', name: 'Seattle Seahawks' },
  { abbreviation: 'TB', name: 'Tampa Bay Buccaneers' },
  { abbreviation: 'TEN', name: 'Tennessee Titans' },
  { abbreviation: 'WAS', name: 'Washington Commanders' }
];

async function createDstPlayers() {
  // Database connection
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'playoff_fantasy',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🛡️ Creating D/ST players for all NFL teams...');
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const team of NFL_TEAMS) {
      // Generate a unique ID for D/ST players (using negative numbers to avoid conflicts with ESPN IDs)
      const dstPlayerId = -parseInt(team.abbreviation.charCodeAt(0) * 1000 + team.abbreviation.charCodeAt(1) * 10 + team.abbreviation.charCodeAt(2));
      
      try {
        const result = await pool.query(
          `INSERT INTO players (
            id, name, position, team, jersey_number, height, weight, age, experience, college, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            position = EXCLUDED.position,
            team = EXCLUDED.team,
            jersey_number = EXCLUDED.jersey_number,
            height = EXCLUDED.height,
            weight = EXCLUDED.weight,
            age = EXCLUDED.age,
            experience = EXCLUDED.experience,
            college = EXCLUDED.college,
            status = EXCLUDED.status,
            last_updated = CURRENT_TIMESTAMP
          RETURNING (xmax = 0)`,
          [
            dstPlayerId,
            `${team.name} D/ST`,
            'D/ST',
            team.abbreviation,
            null, // No jersey number for D/ST
            null, // No height for D/ST
            null, // No weight for D/ST
            null, // No age for D/ST
            null, // No experience for D/ST
            null, // No college for D/ST
            'Active'
          ]
        );
        
        // Check if this was an insert or update
        if (result.rows[0] && result.rows[0].returning === true) {
          createdCount++;
          console.log(`✅ Created D/ST player: ${team.name} D/ST (ID: ${dstPlayerId})`);
        } else {
          updatedCount++;
          console.log(`🔄 Updated D/ST player: ${team.name} D/ST (ID: ${dstPlayerId})`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create D/ST player for ${team.name}:`, error.message);
      }
    }
    
    console.log(`\n📊 D/ST Players Summary:`);
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Total: ${createdCount + updatedCount}`);
    
    // Verify all D/ST players exist
    const verifyResult = await pool.query(
      "SELECT COUNT(*) as count FROM players WHERE position = 'D/ST'"
    );
    
    console.log(`\n✅ Verification: ${verifyResult.rows[0].count} D/ST players in database`);
    
    if (parseInt(verifyResult.rows[0].count) === 32) {
      console.log('🎉 All 32 D/ST players successfully created!');
    } else {
      console.log('⚠️ Warning: Expected 32 D/ST players, but found', verifyResult.rows[0].count);
    }
    
  } catch (error) {
    console.error('❌ Error creating D/ST players:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
createDstPlayers();
