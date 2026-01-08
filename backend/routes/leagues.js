import express from 'express';
const router = express.Router();

// Import middleware
import { requireCommissioner } from '../middleware/auth.js';

// Import league rules for defaults
import { getDefaultScoringRules } from '../league-rules.js';

// GET all leagues
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM leagues ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

// GET single league by ID
router.get('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('SELECT * FROM leagues WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch league' });
  }
});

// POST create new league
router.post('/', async (req, res) => {
  try {
    const { name, commissioner, commissionerEmail, password, year } = req.body;
    
    // Basic validation
    if (!name || !commissioner || !commissionerEmail || !password || !year) {
      return res.status(400).json({ error: 'League name, commissioner, commissioner email, password, and year are required' });
    }
    
    if (password.length < 6){
      return res.status(400).json({error: 'Password must be at least 6 characters long'});
    }   
    
    const db = req.app.locals.db;
    
    // Check if league name already exists
    const existingLeague = await db.query('SELECT id FROM leagues WHERE name = $1', [name]);
    if (existingLeague.rows.length > 0) {
      return res.status(400).json({ error: 'League name already exists' });
    }
    
    //Hash password
    const bcrypt = await import('bcryptjs');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Use transaction to create league and first team
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // Create the league - let database auto-generate ID
      const leagueResult = await client.query(
        `INSERT INTO leagues (name, commissioner, commissioner_email, year, scoring_rules, max_teams, bench_spots, flex_spots) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          name,
          commissioner,
          commissionerEmail,
          year,
          JSON.stringify({
            offensive: {
              passing: { yardsPerPoint: 0.04, touchdownPoints: 4, interceptionPoints: -2 },
              rushing: { yardsPerPoint: 0.1, touchdownPoints: 6 },
              receiving: { yardsPerPoint: 0.1, touchdownPoints: 6 },
              fumbles: { lostPoints: -2 }
            },
            defensive: {
              specialTeams: {
                blockedKickPoints: 2, safetyPoints: 2, fumbleRecoveryPoints: 1,
                interceptionPoints: 2, sackPoints: 1, puntReturnTDPoints: 6,
                kickoffReturnTDPoints: 6
              },
              pointsAllowed: {
                shutoutPoints: 10, oneToSixPoints: 7, sevenToThirteenPoints: 4,
                fourteenToTwentyPoints: 1, twentyOneToTwentySevenPoints: 0,
                twentyEightToThirtyFourPoints: -1, thirtyFivePlusPoints: -4
              },
              teamWinPoints: 5
            },
            kicker: {
              fieldGoals: {
                zeroToThirtyNinePoints: 3, fortyToFortyNinePoints: 4, fiftyPlusPoints: 5
              },
              extraPointPoints: 1
            }
          }),
          12, // max_teams
          2,  // bench_spots
          1   // flex_spots
        ]
      );
      
      const newLeague = leagueResult.rows[0];
      
      // Create first team for commissioner - let database auto-generate ID
      const teamResult = await client.query(
        `INSERT INTO teams (league_id, name, owner) VALUES ($1, $2, $3) RETURNING *`,
        [newLeague.id, `${commissioner}'s Team`, commissioner]
      );
      
      const newTeam = teamResult.rows[0];
      
      // Add commissioner as league member
      await client.query(
        `INSERT INTO league_members (league_id, team_id, user_email, username, role, password_hash) 
         VALUES ($1, $2, $3, $4, $5)`,
        [newLeague.id, newTeam.id, commissionerEmail, commissioner, 'commissioner', passwordHash]
      );
      
      await client.query('COMMIT');
      
      // Return the created league with team info
      res.status(201).json({
        ...newLeague,
        teams: [newTeam]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create league' });
  }
});

// Import game schedule from ESPN API
router.post('/import', async (req, res) => {
  try {
    const db = req.app.locals.db;

    console.log('🔄 Starting ESPN API import...');

    // Fetch game schedule from ESPN API (using working endpoint)
    const response = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/events?dates=2024&limit=1000');
    const data = await response.json();

    console.log('📡 ESPN API Response Status:', response.status);
    console.log('📊 ESPN API Response Keys:', Object.keys(data));
    console.log('📋 ESPN API Data Sample:', JSON.stringify(data, null, 2).substring(0, 500));
    
    // Let's examine the first few events to see what fields are available
    if (data.events && data.events.length > 0) {
      console.log('🔍 First Event Structure:', JSON.stringify(data.events[0], null, 2));
      console.log('🔍 First Event Keys:', Object.keys(data.events[0]));
      
      // Check if week field exists
      const firstEvent = data.events[0];
      console.log('🔍 Week field exists:', 'week' in firstEvent);
      console.log('🔍 Week value:', firstEvent.week);
      console.log('🔍 Season type field exists:', 'seasonType' in firstEvent);
      console.log('🔍 Season type value:', firstEvent.seasonType);
    }

    if (!data.events || !Array.isArray(data.events)) {
      return res.status(400).json({ error: 'No events data from ESPN API' });
    }

    // Find the date range of all events
    const allDates = data.events.map(event => new Date(event.date)).sort((a, b) => a - b);
    const earliestDate = allDates[0];
    const latestDate = allDates[allDates.length - 1];
    
    console.log('📅 Date Range Analysis:');
    console.log('📅 Earliest event date:', earliestDate.toISOString());
    console.log('📅 Latest event date:', latestDate.toISOString());
    console.log('📅 Total date span:', Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24)), 'days');
    
    // Now let's just insert all games and then query the database for date range
    console.log('🔄 Inserting all games into database...');

    // Process only events from our 2024 fantasy season (August 2024 to February 2025)
    const seasonStart = new Date('2024-08-01');
    const seasonEnd = new Date('2025-02-15');
    
    // First filter out events not in our season, then process the remaining ones
    const games = data.events
      .filter(event => {
        const gameDate = new Date(event.date);
        const isInOurSeason = gameDate >= seasonStart && gameDate <= seasonEnd;
        const hasCompetitions = event.competitions && event.competitions[0]?.competitors && event.competitions[0].competitors.length > 0;
        
        console.log(`🔍 Event ${event.id}: Date=${event.date}, IsInOurSeason=${isInOurSeason}, HasCompetitions=${hasCompetitions}`);
        
        return isInOurSeason && hasCompetitions;
      })
      .map(event => {
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find(c => c.homeAway === 'home')?.team;
        const awayTeam = competition.competitors.find(c => c.homeAway === 'away')?.team;
        
        if (!homeTeam || !awayTeam) {
          console.log(`⚠️ Skipping event ${event.id}: Missing team data`);
          return null;
        }
        
        return {
          year: 2024,
          week: 1, // Default week for now
          game_date: new Date(event.date),
          home_team: homeTeam.abbreviation,
          away_team: awayTeam.abbreviation,
          game_status: 'final', // These are all completed games
          home_score: 0, // We'll need to get scores from a different endpoint
          away_score: 0
        };
      })
      .filter(game => game !== null);

    console.log('📊 Transformed games:', games.length);
    console.log('📋 Sample transformed game:', games[0]);

    // Insert games into database
    let insertedCount = 0;
    for (const game of games) {
      try {
        await db.query(
          `INSERT INTO game_schedule (year, week, game_date, home_team, away_team, game_status, home_score, away_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (year, week, home_team, away_team) DO UPDATE SET
           game_date = EXCLUDED.game_date,
           game_status = EXCLUDED.game_status,
           home_score = EXCLUDED.home_score,
           away_score = EXCLUDED.away_score,
           updated_at = CURRENT_TIMESTAMP`,
          [game.year, game.week, game.game_date, game.home_team, game.away_team, game.game_status, game.home_score, game.away_score]
        );
        insertedCount++;
      } catch (insertError) {
        console.error(`Failed to insert game ${game.home_team} vs ${game.away_team}:`, insertError);
      }
    }

    // Query the database to find the actual date range of imported games
    const dateRangeResult = await db.query(
      'SELECT MIN(game_date) as earliest_date, MAX(game_date) as latest_date FROM game_schedule'
    );
    
    const dbEarliestDate = dateRangeResult.rows[0]?.earliest_date;
    const dbLatestDate = dateRangeResult.rows[0]?.latest_date;
    
    console.log('📊 Database Date Range:');
    console.log('📊 Earliest game in DB:', dbEarliestDate);
    console.log('📊 Latest game in DB:', dbLatestDate);
    
    res.json({
      message: `Successfully imported ${insertedCount} games`,
      total_games: data.events.length,
      inserted_count: insertedCount,
      date_range: {
        earliest: dbEarliestDate,
        latest: dbLatestDate
      }
    });

  } catch (error) {
    console.error('❌ Games import failed:', error);
    res.status(500).json({ error: 'Failed to import games' });
  }
});

// PUT update league
router.put('/:id', requireCommissioner(), async (req, res) => {
  try {
    const { name, commissioner, scoring_rules } = req.body;
    const db = req.app.locals.db;
    
    const result = await db.query(
      `UPDATE leagues 
       SET name = COALESCE($1, name), 
           commissioner = COALESCE($2, commissioner), 
           scoring_rules = COALESCE($3, scoring_rules),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [name, commissioner, scoring_rules, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to update league' });
  }
});

// POST create new team in league
router.post('/:id/teams', requireCommissioner(), async (req, res) => {
  try {
    const { name, owner } = req.body;
    const leagueId = req.params.id;
    
    // Basic validation
    if (!name || !owner) {
      return res.status(400).json({ error: 'Team name and owner are required' });
    }
    
    const db = req.app.locals.db;
    
    // Check if league exists
    const leagueResult = await db.query('SELECT * FROM leagues WHERE id = $1', [leagueId]);
    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Check if team name already exists in this league
    const existingTeam = await db.query(
      'SELECT id FROM teams WHERE league_id = $1 AND name = $2',
      [leagueId, name]
    );
    if (existingTeam.rows.length > 0) {
      return res.status(400).json({ error: 'Team name already exists in this league' });
    }
    
    // Create the team - let database auto-generate ID
    const teamResult = await db.query(
      `INSERT INTO teams (league_id, name, owner) VALUES ($1, $2, $3) RETURNING *`,
      [leagueId, name, owner]
    );
  
    const newTeam = teamResult.rows[0];
    
    res.status(201).json(newTeam);
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// GET single team by ID (must come before /:id/teams to avoid conflicts)
router.get('/teams/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const db = req.app.locals.db;
    
    // Get the team
    const teamResult = await db.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const team = teamResult.rows[0];
    
    // Get the league for this team
    const leagueResult = await db.query('SELECT * FROM leagues WHERE id = $1', [team.league_id]);
    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'League not found for team' });
    }
    
    // Return team with league info
    res.json({
      ...team,
      league: leagueResult.rows[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// GET all teams in a league
router.get('/:id/teams', async (req, res) => {
  try {
    const leagueId = req.params.id;
    const db = req.app.locals.db;
    
    // Check if league exists
    const leagueResult = await db.query('SELECT * FROM leagues WHERE id = $1', [leagueId]);
    if (leagueResult.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Get all teams in the league
    const teamsResult = await db.query(
      'SELECT * FROM teams WHERE league_id = $1 ORDER BY created_at ASC',
      [leagueId]
    );
    
    res.json(teamsResult.rows);
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});



// DELETE league
router.delete('/:id', requireCommissioner(), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.query('DELETE FROM leagues WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete league' });
  }
});

export default router; 