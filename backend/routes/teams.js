import express from 'express';
const router = express.Router();

// POST add player to a team
router.post('/:teamId/players', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { player_id, roster_position } = req.body;
    
    console.log('🔄 POST /api/teams/:teamId/players - teamId:', teamId, 'player_id:', player_id, 'roster_position:', roster_position);
    
    if (!player_id || !roster_position) {
      return res.status(400).json({ error: 'Player ID and roster position are required' });
    }
    
    const db = req.app.locals.db;
    
    // Get the team and its league
    const teamResult = await db.query(
      'SELECT t.*, l.id as league_id FROM teams t JOIN leagues l ON t.league_id = l.id WHERE t.id = $1',
      [teamId]
    );
    
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    const team = teamResult.rows[0];
    
    // Check if player is already on a team in this league
    const existingPlayerResult = await db.query(
      `SELECT tr.*, t.name as team_name 
       FROM team_rosters tr
       JOIN teams t ON tr.team_id = t.id
       WHERE tr.player_id = $1 AND t.league_id = $2`,
      [player_id, team.league_id]
    );
    
    if (existingPlayerResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Player is already on a team in this league',
        currentTeam: existingPlayerResult.rows[0].team_name
      });
    }
    
    // Add player to team
    const rosterResult = await db.query(
      `INSERT INTO team_rosters (league_id, team_id, player_id, roster_position) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [team.league_id, teamId, player_id, roster_position]
    );
    
    // Get player details to return
    const playerResult = await db.query('SELECT * FROM players WHERE id = $1', [player_id]);
    
    res.status(201).json({
      roster: rosterResult.rows[0],
      player: playerResult.rows[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to add player to team' });
  }
});

// GET players on a team
router.get('/:teamId/players', async (req, res) => {
  try {
    const { teamId } = req.params;
    console.log('🔄 GET /api/teams/:teamId/players - teamId:', teamId);
    
    const db = req.app.locals.db;
    
    // First check if team exists
    const teamCheck = await db.query('SELECT id FROM teams WHERE id = $1', [teamId]);
    if (teamCheck.rows.length === 0) {
      console.log('❌ Team not found:', teamId);
      return res.status(404).json({ error: 'Team not found' });
    }
    
    console.log('✅ Team found, fetching roster...');
    
    const result = await db.query(
      `SELECT tr.*, p.name, p.position, p.team 
       FROM team_rosters tr
       JOIN players p ON tr.player_id = p.id
       WHERE tr.team_id = $1
       ORDER BY tr.roster_position, p.name`,
      [teamId]
    );
    
    console.log('✅ Roster fetched, rows:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Database error in GET /api/teams/:teamId/players:', error);
    res.status(500).json({ error: 'Failed to fetch team players', details: error.message });
  }
});

export default router;
