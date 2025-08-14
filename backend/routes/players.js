import express from 'express';
const router = express.Router();

// GET all players (from database)
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM players ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET single player by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM players WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// GET players by position
router.get('/position/:position', async (req, res) => {
  try {
    const { position } = req.params;
    const db = req.app.locals.db;
    const result = await db.query(
      'SELECT * FROM players WHERE position = $1 ORDER BY name',
      [position.toUpperCase()]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch players by position' });
  }
});

// GET players by team
router.get('/team/:team', async (req, res) => {
  try {
    const { team } = req.params;
    const db = req.app.locals.db;
    const result = await db.query(
      'SELECT * FROM players WHERE team = $1 ORDER BY position, name',
      [team.toUpperCase()]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch players by team' });
  }
});

// GET top players by fantasy points (from stats)
router.get('/top/:limit', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const db = req.app.locals.db;
    const result = await db.query(
      `SELECT p.*, ps.fantasy_points 
       FROM players p 
       JOIN player_stats ps ON p.id = ps.player_id 
       WHERE ps.fantasy_points > 0 
       ORDER BY ps.fantasy_points DESC 
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch top players' });
  }
});

// POST import players from ESPN API
router.post('/import', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    console.log('🔄 Starting ESPN API import...');
    
    // Fetch players from ESPN API (using working endpoint)
    const response = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=7000');
    const data = await response.json();
    
    console.log('📡 ESPN API Response Status:', response.status);
    console.log('📊 ESPN API Response Keys:', Object.keys(data));
    console.log('📋 ESPN API Data Sample:', JSON.stringify(data, null, 2).substring(0, 500));
    
    console.log('🔍 About to check if athletes exist...');
    
    if (!data.athletes) {
      console.log('❌ No athletes data found. Available keys:', Object.keys(data));
      return res.status(400).json({ 
        error: 'No athletes data from ESPN API',
        availableKeys: Object.keys(data),
        sampleData: data
      });
    }
    
    console.log('✅ Found athletes data. Total athletes:', data.athletes.length);
    console.log('🔍 First athlete sample:', JSON.stringify(data.athletes[0], null, 2));
    
    // Filter active players and transform data
    const players = data.athletes
      .filter(athlete => {
        console.log('🔍 Checking athlete:', athlete.displayName, 'Position:', athlete.position?.abbreviation, 'Team:', athlete.team?.abbreviation);
        // Remove status filter since ESPN doesn't provide it
        return true; // Accept all athletes
      })
      .map(athlete => {
        console.log('🔄 Transforming athlete:', athlete.displayName);
        return {
          id: athlete.id,
          name: athlete.displayName,
          position: athlete.position?.abbreviation || 'UNK',
          team: athlete.team?.abbreviation || 'FA',
          jersey_number: athlete.jersey,
          height: athlete.height,
          weight: athlete.weight,
          age: athlete.age,
          experience: athlete.experience,
          college: athlete.college?.name,
          status: 'Active' // Default to Active since ESPN doesn't provide status
        };
      })
      .filter(player => {
        console.log('🎯 Filtering player:', player.name, 'Position:', player.position, 'Team:', player.team);
        return player.position !== 'UNK' && player.team !== 'FA';
      });
    
    console.log('📊 After filtering, players to insert:', players.length);
    console.log('📋 Sample transformed player:', players[0]);
    
    // Insert players into database (ignore duplicates)
    let insertedCount = 0;
    for (const player of players) {
      try {
        await db.query(
          `INSERT INTO players (id, name, position, team, jersey_number, height, weight, age, experience, college, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
           last_updated = CURRENT_TIMESTAMP`,
          [
            player.id, player.name, player.position, player.team,
            player.jersey_number, player.height, player.weight,
            player.age, player.experience, player.college, player.status
          ]
        );
        insertedCount++;
      } catch (insertError) {
        console.error(`Failed to insert player ${player.name}:`, insertError);
      }
    }
    
    res.json({ 
      message: `Successfully imported ${insertedCount} players`,
      total_players: players.length,
      inserted_count: insertedCount
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import players from ESPN API' });
  }
});

// Note: Stats import routes moved to /api/stats

// Note: Playoff stats import moved to /api/stats/import-playoff

// Note: Playoff stats retrieval moved to /api/stats

// Note: All stats-related helper functions moved to /api/stats

export default router; 