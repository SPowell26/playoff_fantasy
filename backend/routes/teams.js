import express from 'express';
import { calculateLeagueWeeklyScores } from '../services/best-ball-scoring-service.js';
import { requireCommissioner } from '../middleware/auth.js';
const router = express.Router();

/**
 * Middleware to require commissioner authorization for team operations
 * Looks up the league ID from the team ID and checks commissioner status
 */
const requireTeamCommissioner = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;

    if (!teamId) {
      return res.status(400).json({
        error: 'Team ID is required',
        code: 'MISSING_TEAM_ID'
      });
    }

    const db = req.app.locals.db;

    // Get league ID from team
    const teamResult = await db.query(
      'SELECT league_id FROM teams WHERE id = $1',
      [teamId]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Team not found',
        code: 'TEAM_NOT_FOUND'
      });
    }

    const leagueId = teamResult.rows[0].league_id;

    // Temporarily modify params to use league ID for the requireCommissioner check
    const originalParams = req.params;
    req.params.id = leagueId;

    // Create a modified next function that restores params
    const modifiedNext = () => {
      req.params = originalParams;
      req.leagueId = leagueId;
      next();
    };

    // Call requireCommissioner with our modified context
    const commissionerCheck = requireCommissioner('id');
    return commissionerCheck(req, res, modifiedNext);

  } catch (error) {
    console.error('Team commissioner check error:', error);
    res.status(500).json({
      error: 'Authorization check failed',
      code: 'AUTH_CHECK_ERROR'
    });
  }
};

/**
 * Recalculate all weekly scores for a league when roster changes
 * This ensures season totals reflect the current roster composition
 */
async function recalculateLeagueScores(db, leagueId, year = 2025, seasonType = 'regular') {
  try {
    console.log(`🔄 Recalculating weekly scores for league ${leagueId} due to roster change...`);
    
    // Get all available weeks for this year
    const weeksResult = await db.query(
      `SELECT DISTINCT week FROM player_stats WHERE year = $1 ORDER BY week`,
      [year]
    );
    
    if (weeksResult.rows.length === 0) {
      console.log(`  ⚠️ No weeks found for year ${year}`);
      return;
    }
    
    const weeks = weeksResult.rows.map(row => row.week);
    console.log(`  📅 Found ${weeks.length} weeks to recalculate: ${weeks.join(', ')}`);
    
    // Recalculate scores for each week
    for (const week of weeks) {
      try {
        await calculateLeagueWeeklyScores(db, leagueId, week, year, seasonType);
        console.log(`  ✅ Week ${week} recalculated`);
      } catch (error) {
        console.error(`  ❌ Error recalculating Week ${week}:`, error.message);
      }
    }
    
    console.log(`✅ League ${leagueId} weekly scores recalculated`);
  } catch (error) {
    console.error(`❌ Error recalculating league scores:`, error);
    // Don't throw - this is a background operation
  }
}

// POST add player to a team
router.post('/:teamId/players', requireTeamCommissioner, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { player_id, roster_position } = req.body;
    
    console.log('🔄 POST /api/teams/:teamId/players - teamId:', teamId, 'player_id:', player_id, 'roster_position:', roster_position);
    
    if (!player_id || !roster_position) {
      return res.status(400).json({ error: 'Player ID and roster position are required' });
    }
    
    const db = req.app.locals.db;
    
    // Get the team and its league (with year)
    const teamResult = await db.query(
      'SELECT t.*, l.id as league_id, l.year as league_year FROM teams t JOIN leagues l ON t.league_id = l.id WHERE t.id = $1',
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
    
    // Recalculate all weekly scores for this league (background task, don't wait)
    recalculateLeagueScores(db, team.league_id, team.league_year || 2025, 'regular').catch(err => {
      console.error('Error in background score recalculation:', err);
    });
    
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
      `SELECT tr.league_id, tr.team_id, tr.roster_position, tr.added_at, 
              p.id as player_id, p.name, p.position, p.team 
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

// DELETE remove player from a team
router.delete('/:teamId/players/:playerId', requireTeamCommissioner, async (req, res) => {
  try {
    const { teamId, playerId } = req.params;
    console.log('🔄 DELETE /api/teams/:teamId/players/:playerId - teamId:', teamId, 'playerId:', playerId);
    
    const db = req.app.locals.db;
    
    // Check if team exists
    const teamCheck = await db.query('SELECT id FROM teams WHERE id = $1', [teamId]);
    if (teamCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    
    // Remove player from team
    const result = await db.query(
      `DELETE FROM team_rosters 
       WHERE team_id = $1 AND player_id = $2 
       RETURNING *`,
      [teamId, playerId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player not found on this team' });
    }
    
    // Get the team and its league for recalculation
    const teamResult = await db.query(
      'SELECT t.*, l.id as league_id, l.year as league_year FROM teams t JOIN leagues l ON t.league_id = l.id WHERE t.id = $1',
      [teamId]
    );
    
    if (teamResult.rows.length > 0) {
      const team = teamResult.rows[0];
      // Recalculate all weekly scores for this league (background task, don't wait)
      recalculateLeagueScores(db, team.league_id, team.league_year || 2025, 'regular').catch(err => {
        console.error('Error in background score recalculation:', err);
      });
    }
    
    console.log('✅ Player removed from team');
    res.json({ message: 'Player removed from team successfully' });
    
  } catch (error) {
    console.error('❌ Database error in DELETE /api/teams/:teamId/players/:playerId:', error);
    res.status(500).json({ error: 'Failed to remove player from team', details: error.message });
  }
});

export default router;
