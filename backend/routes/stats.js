import express from 'express';
import { processGameForDST } from '../map-team-defense-stats.js';
import { calculateLeagueWeeklyScores } from '../services/best-ball-scoring-service.js';
const router = express.Router();

// GET all player stats (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { week, year, player_id, position, team, limit = 100 } = req.query;
    
    let query = `
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (week) {
      paramCount++;
      query += ` AND ps.week = $${paramCount}`;
      params.push(parseInt(week));
    }
    
    if (year) {
      paramCount++;
      query += ` AND ps.year = $${paramCount}`;
      params.push(parseInt(year));
    }
    
    if (player_id) {
      paramCount++;
      query += ` AND ps.player_id = $${paramCount}`;
      params.push(parseInt(player_id));
    }
    
    if (position) {
      paramCount++;
      query += ` AND p.position = $${paramCount}`;
      params.push(position.toUpperCase());
    }
    
    if (team) {
      paramCount++;
      query += ` AND p.team = $${paramCount}`;
      params.push(team.toUpperCase());
    }
    
    query += ` ORDER BY ps.week DESC, ps.fantasy_points DESC LIMIT $${paramCount + 1}`;
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);
    
    res.json({
      count: result.rows.length,
      stats: result.rows,
      filters: { week, year, player_id, position, team, limit }
    });
    
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// GET stats for a specific player
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { week, year } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE ps.player_id = $1
    `;
    
    const params = [parseInt(playerId)];
    let paramCount = 1;
    
    if (week) {
      paramCount++;
      query += ` AND ps.week = $${paramCount}`;
      params.push(parseInt(week));
    }
    
    if (year) {
      paramCount++;
      query += ` AND ps.year = $${paramCount}`;
      params.push(parseInt(year));
    }
    
    query += ` ORDER BY ps.week DESC, ps.year DESC`;
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player stats not found' });
    }
    
    res.json({
      player_id: playerId,
      player_name: result.rows[0].player_name,
      position: result.rows[0].position,
      team: result.rows[0].team,
      stats: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// GET stats for a specific week
router.get('/week/:week', async (req, res) => {
  try {
    const { week } = req.params;
    const { year, position, team, limit = 100 } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE ps.week = $1
    `;
    
    const params = [parseInt(week)];
    let paramCount = 1;
    
    if (year) {
      paramCount++;
      query += ` AND ps.year = $${paramCount}`;
      params.push(parseInt(year));
    }
    
    if (position) {
      paramCount++;
      query += ` AND p.position = $${paramCount}`;
      params.push(position.toUpperCase());
    }
    
    if (team) {
      paramCount++;
      query += ` AND p.team = $${paramCount}`;
      params.push(team.toUpperCase());
    }
    
    query += ` ORDER BY ps.fantasy_points DESC LIMIT $${paramCount + 1}`;
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);
    
    res.json({
      week: parseInt(week),
      year: year || 'all',
      count: result.rows.length,
      stats: result.rows,
      filters: { year, position, team, limit }
    });
    
  } catch (error) {
    console.error('Error fetching week stats:', error);
    res.status(500).json({ error: 'Failed to fetch week stats' });
  }
});

// GET stats for a specific player in a specific week
router.get('/week/:week/player/:playerId', async (req, res) => {
  try {
    const { week, playerId } = req.params;
    const { year } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE ps.week = $1 AND ps.player_id = $2
    `;
    
    const params = [parseInt(week), parseInt(playerId)];
    
    if (year) {
      query += ` AND ps.year = $3`;
      params.push(parseInt(year));
    }
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Player week stats not found' });
    }
    
    res.json({
      week: parseInt(week),
      player_id: parseInt(playerId),
      player_name: result.rows[0].player_name,
      position: result.rows[0].position,
      team: result.rows[0].team,
      stats: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching player week stats:', error);
    res.status(500).json({ error: 'Failed to fetch player week stats' });
  }
});

// GET top performers by position for a specific week
router.get('/week/:week/top/:position', async (req, res) => {
  try {
    const { week, position } = req.params;
    const { year, limit = 10 } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE ps.week = $1 AND p.position = $2
    `;
    
    const params = [parseInt(week), position.toUpperCase()];
    
    if (year) {
      query += ` AND ps.year = $3`;
      params.push(parseInt(year));
    }
    
    query += ` ORDER BY ps.fantasy_points DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);
    
    res.json({
      week: parseInt(week),
      position: position.toUpperCase(),
      year: year || 'all',
      count: result.rows.length,
      top_performers: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// GET summary statistics
router.get('/summary', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const summaryResult = await db.query(`
      SELECT 
        COUNT(*) as total_stats,
        COUNT(DISTINCT player_id) as unique_players,
        COUNT(DISTINCT week) as weeks,
        COUNT(DISTINCT year) as years,
        MIN(week) as min_week,
        MAX(week) as max_week,
        MIN(year) as min_year,
        MAX(year) as max_year
      FROM player_stats
    `);
    
    const sourceBreakdown = await db.query(`
      SELECT 
        source,
        COUNT(*) as count
      FROM player_stats
      GROUP BY source
      ORDER BY count DESC
    `);
    
    res.json({
      summary: summaryResult.rows[0],
      sources: sourceBreakdown.rows
    });
    
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// POST import stats (general import)
router.post('/import', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    console.log('🔄 Starting general stats import...');
    
    // This would be your general stats import logic
    // For now, redirect to the working playoff import
    res.json({ 
      message: 'Use /import-playoff for playoff stats import',
      note: 'General stats import not yet implemented'
    });
    
  } catch (error) {
    console.error('❌ Stats import failed:', error);
    res.status(500).json({ error: 'Failed to import stats' });
  }
});

// POST import playoff stats (moved from players route)
router.post('/import-playoff', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    console.log('🔄 Starting ESPN playoff stats import...');
    
    // First, get the playoff game IDs from ESPN Events API
    const eventsResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/events?dates=20240101-20240215');
    const eventsData = await eventsResponse.json();
    
    if (!eventsData.events || !Array.isArray(eventsData.events)) {
      return res.status(400).json({ error: 'No playoff events data from ESPN API' });
    }
    
    console.log(`📊 Found ${eventsData.events.length} playoff games`);
    
    // Filter for actual playoff games
    const playoffGames = eventsData.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date('2024-01-06');
    });
    
    console.log(`🎯 Filtered to ${playoffGames.length} playoff games`);
    
    // Now get individual player stats for each playoff game
    const allPlayerStats = [];
    
    for (const game of playoffGames.slice(0, 3)) { // Start with first 3 games
      console.log(`\n🏈 Processing game: ${game.name} (ID: ${game.id})`);
      
      try {
        // Get detailed game stats from ESPN Game Summary API
        const gameSummaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`;
        const gameSummaryResponse = await fetch(gameSummaryUrl);
        
        if (!gameSummaryResponse.ok) {
          console.log(`❌ Failed to get game summary for ${game.name}: ${gameSummaryResponse.status}`);
          continue;
        }
        
        const gameSummaryData = await gameSummaryResponse.json();
        
        if (!gameSummaryData.boxscore || !gameSummaryData.boxscore.players) {
          console.log(`❌ No player stats found for ${game.name}`);
          continue;
        }
        
        // Extract field goal distances from scoring plays
        const fieldGoalDistances = extractFieldGoalDistances(gameSummaryData.scoringPlays);
        
        // Extract player stats from both teams
        const teams = gameSummaryData.boxscore.players;
        
        for (let teamIndex = 0; teamIndex <= 1; teamIndex++) {
          const team = teams[teamIndex];
          if (!team || !team.statistics) continue;
          
          // Process each statistic category
          for (const statCategory of team.statistics) {
            if (!statCategory.athletes || !Array.isArray(statCategory.athletes)) continue;
            
            // Process each player's stats
            for (const athlete of statCategory.athletes) {
              if (!athlete.athlete || !athlete.stats) continue;
              
              const playerName = athlete.athlete.displayName;
              const playerId = athlete.athlete.id;
              
              // Map the stat category to our database fields
              const mappedStats = mapESPNStatsToDatabase(statCategory.name, athlete.stats, fieldGoalDistances, playerName);
              
              if (mappedStats) {
                // Determine the playoff week based on game date
                const gameDate = new Date(game.date);
                const playoffWeek = determinePlayoffWeek(gameDate);
                
                const playerStat = {
                  player_id: playerId,
                  week: playoffWeek,
                  year: 2024,
                  ...mappedStats,
                  source: 'espn_game_summary'
                };
                
                allPlayerStats.push(playerStat);
              }
            }
          }
        }
        
      } catch (gameError) {
        console.error(`❌ Error processing game ${game.name}:`, gameError.message);
      }
    }
    
    console.log(`\n📊 Total player stats collected: ${allPlayerStats.length}`);
    
    // Insert stats into database
    let insertedCount = 0;
    for (const stat of allPlayerStats) {
      try {
        await db.query(
          `INSERT INTO player_stats (
            player_id, week, year, passing_yards, passing_touchdowns, interceptions,
            rushing_yards, rushing_touchdowns, receiving_yards, receiving_touchdowns, receptions,
            fumbles_lost, sacks, interceptions_defense, fumble_recoveries, safeties,
            blocked_kicks, punt_return_touchdowns, kickoff_return_touchdowns,
            points_allowed, field_goals_0_39, field_goals_40_49, field_goals_50_plus,
            extra_points
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
          ON CONFLICT (player_id, week, year) DO UPDATE SET
            passing_yards = EXCLUDED.passing_yards,
            passing_touchdowns = EXCLUDED.passing_touchdowns,
            interceptions = EXCLUDED.interceptions,
            rushing_yards = EXCLUDED.rushing_yards,
            rushing_touchdowns = EXCLUDED.rushing_touchdowns,
            receiving_yards = EXCLUDED.receiving_yards,
            receiving_touchdowns = EXCLUDED.receiving_touchdowns,
            receptions = EXCLUDED.receptions,
            fumbles_lost = EXCLUDED.fumbles_lost,
            sacks = EXCLUDED.sacks,
            interceptions_defense = EXCLUDED.interceptions_defense,
            fumble_recoveries = EXCLUDED.fumble_recoveries,
            safeties = EXCLUDED.safeties,
            blocked_kicks = EXCLUDED.blocked_kicks,
            punt_return_touchdowns = EXCLUDED.punt_return_touchdowns,
            kickoff_return_touchdowns = EXCLUDED.kickoff_return_touchdowns,
            points_allowed = EXCLUDED.points_allowed,
            field_goals_0_39 = EXCLUDED.field_goals_0_39,
            field_goals_40_49 = EXCLUDED.field_goals_40_49,
            field_goals_50_plus = EXCLUDED.field_goals_50_plus,
            extra_points = EXCLUDED.extra_points,
            updated_at = CURRENT_TIMESTAMP`,
          [
            stat.player_id, stat.week, stat.year, stat.passing_yards, stat.passing_touchdowns, stat.interceptions,
            stat.rushing_yards, stat.rushing_touchdowns, stat.receiving_yards, stat.receiving_touchdowns, stat.receptions,
            stat.fumbles_lost, stat.sacks, stat.interceptions_defense, stat.fumble_recoveries, stat.safeties,
            stat.blocked_kicks, stat.punt_return_touchdowns, stat.kickoff_return_touchdowns,
            stat.points_allowed, stat.field_goals_0_39, stat.field_goals_40_49, stat.field_goals_50_plus,
            stat.extra_points
          ]
        );
        insertedCount++;
      } catch (insertError) {
        console.error(`Failed to insert stat for player ${stat.player_id} week ${stat.week}:`, insertError);
      }
    }
    
    res.json({
      message: `Successfully imported ${insertedCount} playoff stat entries`,
      total_stats_collected: allPlayerStats.length,
      inserted_count: insertedCount,
      games_processed: Math.min(3, playoffGames.length),
      total_playoff_games: playoffGames.length
    });
    
  } catch (error) {
    console.error('❌ Playoff stats import failed:', error);
    res.status(500).json({ error: 'Failed to import playoff stats' });
  }
});

// POST import weekly stats (new endpoint for entire week)
router.post('/weekly-update', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    console.log('🔄 Starting weekly stats update...');
    
    // First get the current week status from ESPN Scoreboard API
    const scoreboardResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    
    if (!scoreboardResponse.ok) {
      return res.status(500).json({ error: 'Failed to get current week status from ESPN' });
    }
    
    const scoreboardData = await scoreboardResponse.json();
    
    if (!scoreboardData.events || !Array.isArray(scoreboardData.events)) {
      return res.status(400).json({ error: 'No events found for current week' });
    }
    
    const currentWeek = scoreboardData.week?.number || 'Unknown';
    const currentYear = scoreboardData.season?.year || new Date().getFullYear();
    
    // Map ESPN's numeric season type to meaningful names
    const espnSeasonTypeId = scoreboardData.season?.type;
    let seasonType = 'Unknown';
    let seasonTypeName = 'Unknown';
    
    if (espnSeasonTypeId !== undefined) {
      switch (espnSeasonTypeId) {
        case 1:
          seasonType = 'preseason';
          seasonTypeName = 'Preseason';
          break;
        case 2:
          seasonType = 'regular';
          seasonTypeName = 'Regular Season';
          break;
        case 3:
          seasonType = 'playoffs';
          seasonTypeName = 'Playoffs';
          break;
        case 4:
          seasonType = 'offseason';
          seasonTypeName = 'Offseason';
          break;
        default:
          seasonType = `unknown_${espnSeasonTypeId}`;
          seasonTypeName = `Unknown Type ${espnSeasonTypeId}`;
      }
    }
    
    console.log(`📊 Processing Week ${currentWeek}, Year ${currentYear}, Type: ${seasonTypeName} (ESPN ID: ${espnSeasonTypeId})`);
    console.log(`🏈 Found ${scoreboardData.events.length} games this week`);
    
    // Process all games for the week
    const allPlayerStats = [];
    const playersToCreate = new Map(); // Track players we need to create
    let processedGames = 0;
    let failedGames = 0;
    
    for (const game of scoreboardData.events) {
      console.log(`\n🏈 Processing game: ${game.name} (ID: ${game.id})`);
      
      try {
        // Get detailed game stats from ESPN Game Summary API
        const gameSummaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`;
        const gameSummaryResponse = await fetch(gameSummaryUrl);
        
        if (!gameSummaryResponse.ok) {
          console.log(`❌ Failed to get game summary for ${game.name}: ${gameSummaryResponse.status}`);
          failedGames++;
          continue;
        }
        
        const gameSummaryData = await gameSummaryResponse.json();
        
        if (!gameSummaryData.boxscore || !gameSummaryData.boxscore.players) {
          console.log(`❌ No player stats found for ${game.name}`);
          failedGames++;
          continue;
        }
        
        // Extract field goal distances from scoring plays
        const fieldGoalDistances = extractFieldGoalDistances(gameSummaryData.scoringPlays);
        
        // Extract player stats from both teams
        const teams = gameSummaryData.boxscore.players;
        
        for (let teamIndex = 0; teamIndex <= 1; teamIndex++) {
          const team = teams[teamIndex];
          console.log(`  🔍 Team ${teamIndex}:`, team ? 'exists' : 'null');
          if (!team) {
            console.log(`    ❌ Team ${teamIndex} is null/undefined`);
            continue;
          }
          if (!team.statistics) {
            console.log(`    ❌ Team ${teamIndex} has no statistics`);
            continue;
          }
          console.log(`    ✅ Team ${teamIndex} has ${team.statistics.length} stat categories`);
          
          console.log(`  📊 Processing team ${teamIndex}: ${team.team?.name || 'Unknown'}`);
          
          // Process each statistic category
          for (const statCategory of team.statistics) {
            if (!statCategory.athletes || !Array.isArray(statCategory.athletes) || statCategory.athletes.length === 0) {
              console.log(`    ⏭️ Skipping stat category: ${statCategory.name} (no athletes)`);
              continue;
            }
            
            console.log(`    📈 Processing stat category: ${statCategory.name} with ${statCategory.athletes.length} athletes`);
            
            // Process each player's stats
            for (const athlete of statCategory.athletes) {
              if (!athlete.athlete || !athlete.stats) continue;
              
              const playerName = athlete.athlete.displayName;
              const playerId = athlete.athlete.id;
              const playerPosition = athlete.athlete.position?.abbreviation || 'UNK';
              
              console.log(`      👤 Processing player: ${playerName} (${playerPosition})`);
              
              // Skip defensive players (DEF) - we only want offensive players for fantasy
              if (playerPosition === 'DEF') {
                console.log(`        ⏭️ Skipping defensive player: ${playerName} (ID: ${playerId})`);
                continue;
              }
              
              // Check if player exists in database
              const playerExists = await db.query('SELECT id FROM players WHERE id = $1', [playerId]);
              
              if (playerExists.rows.length === 0) {
                // Player doesn't exist, add to creation list
                playersToCreate.set(playerId, {
                  id: playerId,
                  name: playerName,
                  position: playerPosition,
                  team: athlete.athlete.team?.abbreviation || 'FA',
                  jersey_number: athlete.athlete.jersey,
                  height: athlete.athlete.height,
                  weight: athlete.athlete.weight,
                  age: athlete.athlete.age,
                  experience: athlete.athlete.experience,
                  college: athlete.athlete.college?.name,
                  status: 'Active'
                });
                console.log(`        📝 Will create player: ${playerName} (ID: ${playerId}, Position: ${playerPosition})`);
              }
              
              // Check if we already have stats for this player in this week
              let existingPlayerStat = allPlayerStats.find(stat => 
                stat.player_id === playerId && 
                stat.week === currentWeek && 
                stat.year === currentYear
              );
              
              if (!existingPlayerStat) {
                // First time processing this player this week, create new stat object
                existingPlayerStat = {
                  player_id: playerId,
                  week: currentWeek,
                  year: currentYear,
                  season_type: seasonType.toLowerCase(),
                  source: 'espn',
                  // Initialize all stats to 0
                  passing_yards: 0, passing_touchdowns: 0, interceptions: 0,
                  rushing_yards: 0, rushing_touchdowns: 0,
                  receiving_yards: 0, receiving_touchdowns: 0, receptions: 0,
                  fumbles_lost: 0, sacks: 0, interceptions_defense: 0,
                  fumble_recoveries: 0, safeties: 0, blocked_kicks: 0,
                  punt_return_touchdowns: 0, kickoff_return_touchdowns: 0,
                  points_allowed: 0, field_goals_0_39: 0, field_goals_40_49: 0,
                  field_goals_50_plus: 0, extra_points: 0
                };
                allPlayerStats.push(existingPlayerStat);
              }
              
              // Map the stat category and merge with existing stats
              const newStats = mapESPNStatsToDatabase(statCategory.name, athlete.stats, fieldGoalDistances, playerName);
              
              if (newStats) {
                // Merge the new stats with existing stats (don't overwrite, add to them)
                Object.keys(newStats).forEach(key => {
                  if (newStats[key] > 0) {
                    existingPlayerStat[key] = newStats[key];
                  }
                });
                
                console.log(`        ✅ Updated stats for ${playerName} in ${statCategory.name}:`, newStats);
                console.log(`        📊 Total stats so far:`, existingPlayerStat);
              }
            }
          }
        }
        
        processedGames++;
        
      } catch (gameError) {
        console.error(`❌ Error processing game ${game.name}:`, gameError.message);
        failedGames++;
      }
    }
    
    console.log(`\n📊 Weekly processing complete:`);
    console.log(`   Games processed: ${processedGames}`);
    console.log(`   Games failed: ${failedGames}`);
    console.log(`   Total player stats: ${allPlayerStats.length}`);
    console.log(`   Players to create: ${playersToCreate.size}`);
    
    // First, create any missing players
    let playersCreated = 0;
    for (const [playerId, playerData] of playersToCreate) {
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
            playerData.id, playerData.name, playerData.position, playerData.team,
            playerData.jersey_number, playerData.height, playerData.weight,
            playerData.age, playerData.experience, playerData.college, playerData.status
          ]
        );
        playersCreated++;
      } catch (playerError) {
        console.error(`Failed to create player ${playerData.name}:`, playerError);
      }
    }
    
    console.log(`✅ Created ${playersCreated} new players`);
    
    // Process D/ST stats for all games
    console.log(`\n🛡️ Processing D/ST stats for all games...`);
    const allDSTStats = [];
    
    for (const game of scoreboardData.events) {
      try {
        // Get detailed game stats from ESPN Game Summary API
        const gameSummaryUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${game.id}`;
        const gameSummaryResponse = await fetch(gameSummaryUrl);
        
        if (!gameSummaryResponse.ok) {
          console.log(`❌ Failed to get game summary for D/ST processing: ${game.name}`);
          continue;
        }
        
        const gameSummaryData = await gameSummaryResponse.json();
        
        if (!gameSummaryData.boxscore || !gameSummaryData.boxscore.teams) {
          console.log(`❌ No team stats found for D/ST processing: ${game.name}`);
          continue;
        }
        
        // Process D/ST stats for this game
        const dstResults = processGameForDST(gameSummaryData);
        
        // Add week/year info if missing
        for (const dstStat of dstResults) {
          if (!dstStat.week) dstStat.week = currentWeek;
          if (!dstStat.year) dstStat.year = currentYear;
          dstStat.season_type = seasonType.toLowerCase();
          dstStat.source = 'espn';
        }
        
        allDSTStats.push(...dstResults);
        console.log(`  🛡️ Processed D/ST stats for ${game.name}: ${dstResults.length} teams`);
        
      } catch (dstError) {
        console.error(`❌ Error processing D/ST stats for ${game.name}:`, dstError.message);
      }
    }
    
    console.log(`🛡️ Total D/ST stats collected: ${allDSTStats.length}`);
    
    // Now insert stats into database
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const stat of allPlayerStats) {
      try {
        const result = await db.query(
          `INSERT INTO player_stats (
            player_id, week, year, season_type, passing_yards, passing_touchdowns, interceptions,
            rushing_yards, rushing_touchdowns, receiving_yards, receiving_touchdowns, receptions,
            fumbles_lost, sacks, interceptions_defense, fumble_recoveries, safeties,
            blocked_kicks, punt_return_touchdowns, kickoff_return_touchdowns,
            points_allowed, field_goals_0_39, field_goals_40_49, field_goals_50_plus,
            extra_points
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
          ON CONFLICT (player_id, week, year) DO UPDATE SET
            season_type = EXCLUDED.season_type,
            passing_yards = EXCLUDED.passing_yards,
            passing_touchdowns = EXCLUDED.passing_touchdowns,
            interceptions = EXCLUDED.interceptions,
            rushing_yards = EXCLUDED.rushing_yards,
            rushing_touchdowns = EXCLUDED.rushing_touchdowns,
            receiving_yards = EXCLUDED.receiving_yards,
            receiving_touchdowns = EXCLUDED.receiving_touchdowns,
            receptions = EXCLUDED.receptions,
            fumbles_lost = EXCLUDED.fumbles_lost,
            sacks = EXCLUDED.sacks,
            interceptions_defense = EXCLUDED.interceptions_defense,
            fumble_recoveries = EXCLUDED.fumble_recoveries,
            safeties = EXCLUDED.safeties,
            blocked_kicks = EXCLUDED.blocked_kicks,
            punt_return_touchdowns = EXCLUDED.punt_return_touchdowns,
            kickoff_return_touchdowns = EXCLUDED.kickoff_return_touchdowns,
            points_allowed = EXCLUDED.points_allowed,
            field_goals_0_39 = EXCLUDED.field_goals_0_39,
            field_goals_40_49 = EXCLUDED.field_goals_40_49,
            field_goals_50_plus = EXCLUDED.field_goals_50_plus,
            extra_points = EXCLUDED.extra_points,
            updated_at = CURRENT_TIMESTAMP
          RETURNING (xmax = 0)`,
          [
            stat.player_id, stat.week, stat.year, stat.season_type, stat.passing_yards, stat.passing_touchdowns, stat.interceptions,
            stat.rushing_yards, stat.rushing_touchdowns, stat.receiving_yards, stat.receiving_touchdowns, stat.receptions,
            stat.fumbles_lost, stat.sacks, stat.interceptions_defense, stat.fumble_recoveries, stat.safeties,
            stat.blocked_kicks, stat.punt_return_touchdowns, stat.kickoff_return_touchdowns,
            stat.points_allowed, stat.field_goals_0_39, stat.field_goals_40_49, stat.field_goals_50_plus,
            stat.extra_points
          ]
        );
        
        // Check if this was an insert or update
        if (result.rows[0] && result.rows[0].returning === true) {
          insertedCount++;
        } else {
          updatedCount++;
        }
        
      } catch (insertError) {
        console.error(`Failed to insert stat for player ${stat.player_id} week ${stat.week}:`, insertError);
      }
    }
    
    // Insert D/ST stats into database
    let dstInsertedCount = 0;
    let dstUpdatedCount = 0;
    
    for (const dstStat of allDSTStats) {
      try {
        const result = await db.query(
          `INSERT INTO team_stats (
            team, week, year, season_type, sacks, interceptions, fumble_recoveries,
            safeties, blocked_kicks, defensive_touchdowns, punt_return_touchdowns,
            kickoff_return_touchdowns, points_allowed, team_win, fantasy_points, source
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (team, week, year, season_type) DO UPDATE SET
            sacks = EXCLUDED.sacks,
            interceptions = EXCLUDED.interceptions,
            fumble_recoveries = EXCLUDED.fumble_recoveries,
            safeties = EXCLUDED.safeties,
            blocked_kicks = EXCLUDED.blocked_kicks,
            defensive_touchdowns = EXCLUDED.defensive_touchdowns,
            punt_return_touchdowns = EXCLUDED.punt_return_touchdowns,
            kickoff_return_touchdowns = EXCLUDED.kickoff_return_touchdowns,
            points_allowed = EXCLUDED.points_allowed,
            team_win = EXCLUDED.team_win,
            fantasy_points = EXCLUDED.fantasy_points,
            source = EXCLUDED.source,
            updated_at = CURRENT_TIMESTAMP
          RETURNING (xmax = 0)`,
          [
            dstStat.team, dstStat.week, dstStat.year, dstStat.season_type,
            dstStat.sacks, dstStat.interceptions, dstStat.fumble_recoveries,
            dstStat.safeties, dstStat.blocked_kicks, dstStat.defensive_touchdowns,
            dstStat.punt_return_touchdowns, dstStat.kickoff_return_touchdowns,
            dstStat.points_allowed, dstStat.team_win, dstStat.fantasy_points,
            dstStat.source
          ]
        );
        
        // Check if this was an insert or update
        if (result.rows[0] && result.rows[0].returning === true) {
          dstInsertedCount++;
        } else {
          dstUpdatedCount++;
        }
        
      } catch (dstInsertError) {
        console.error(`Failed to insert D/ST stat for team ${dstStat.team} week ${dstStat.week}:`, dstInsertError);
      }
    }
    
    console.log(`🛡️ D/ST stats inserted: ${dstInsertedCount}, updated: ${dstUpdatedCount}`);
    
    // Calculate Best Ball weekly scores for all leagues
    console.log(`\n🏈 Calculating Best Ball weekly scores for all leagues...`);
    let bestBallResults = [];
    
    try {
      // Get all leagues
      const leaguesResult = await db.query('SELECT id, name FROM leagues');
      
      if (leaguesResult.rows.length > 0) {
        for (const league of leaguesResult.rows) {
          try {
            const bestBallResult = await calculateLeagueWeeklyScores(
              db, 
              league.id, 
              currentWeek, 
              currentYear, 
              seasonType
            );
            bestBallResults.push({
              leagueId: league.id,
              leagueName: league.name,
              ...bestBallResult
            });
            console.log(`  🏈 League ${league.name}: ${bestBallResult.scoresCalculated} team scores calculated`);
          } catch (bestBallError) {
            console.error(`❌ Error calculating Best Ball scores for league ${league.name}:`, bestBallError.message);
            bestBallResults.push({
              leagueId: league.id,
              leagueName: league.name,
              error: bestBallError.message
            });
          }
        }
      } else {
        console.log(`  ⚠️ No leagues found - skipping Best Ball scoring`);
      }
    } catch (bestBallError) {
      console.error(`❌ Error in Best Ball scoring process:`, bestBallError.message);
    }
    
    console.log(`🏈 Best Ball scoring complete for ${bestBallResults.length} leagues`);
    
    res.json({
      message: `Weekly stats update complete for Week ${currentWeek}`,
      week: currentWeek,
      year: currentYear,
      season_type: seasonType,
      season_type_name: seasonTypeName,
      espn_season_type_id: espnSeasonTypeId,
      games_processed: processedGames,
      games_failed: failedGames,
      players_created: playersCreated,
      total_stats_collected: allPlayerStats.length,
      inserted_count: insertedCount,
      updated_count: updatedCount,
      dst_stats_collected: allDSTStats.length,
      dst_inserted_count: dstInsertedCount,
      dst_updated_count: dstUpdatedCount,
      best_ball_results: bestBallResults,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Weekly stats update failed:', error);
    res.status(500).json({ error: 'Failed to update weekly stats' });
  }
});

// GET Best Ball team standings for a specific week
router.get('/standings/:leagueId/:week', async (req, res) => {
  try {
    const { leagueId, week } = req.params;
    const { year = 2025, seasonType = 'preseason' } = req.query;
    const db = req.app.locals.db;
    
    const { getTeamStandings } = await import('../services/best-ball-scoring-service.js');
    const standings = await getTeamStandings(db, parseInt(leagueId), parseInt(week), parseInt(year), seasonType);
    
    res.json({
      leagueId: parseInt(leagueId),
      week: parseInt(week),
      year: parseInt(year),
      seasonType,
      standings,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting team standings:', error);
    res.status(500).json({ error: 'Failed to get team standings' });
  }
});

// GET season totals for all teams in a league
router.get('/season-totals/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const { year = 2025, seasonType = 'preseason' } = req.query;
    const db = req.app.locals.db;
    
    const { getSeasonTotals } = await import('../services/best-ball-scoring-service.js');
    const seasonTotals = await getSeasonTotals(db, parseInt(leagueId), parseInt(year), seasonType);
    
    res.json({
      leagueId: parseInt(leagueId),
      year: parseInt(year),
      seasonType,
      seasonTotals,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting season totals:', error);
    res.status(500).json({ error: 'Failed to get season totals' });
  }
});

// GET stats formatted for frontend scoring engine
router.get('/scoring-ready/:week', async (req, res) => {
  try {
    const { week } = req.params;
    const { year = 2024 } = req.query;
    const db = req.app.locals.db;
    
    // Get all stats for the specified week with player info
    const result = await db.query(`
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE ps.week = $1 AND ps.year = $2
      ORDER BY p.position, p.name
    `, [parseInt(week), parseInt(year)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No stats found for this week' });
    }
    
    // Transform database format to scoring engine format
    const scoringReadyStats = result.rows.map(stat => ({
      id: stat.player_id,
      name: stat.player_name,
      position: stat.position,
      team: stat.team,
      weeklyStats: {
        [week]: {
          // Transform database fields to scoring engine expectations
          passingYards: stat.passing_yards || 0,
          passingTD: stat.passing_touchdowns || 0,
          interceptions: stat.interceptions || 0,
          rushingYards: stat.rushing_yards || 0,
          rushingTD: stat.rushing_touchdowns || 0,
          receivingYards: stat.receiving_yards || 0,
          receivingTD: stat.receiving_touchdowns || 0,
          fumbles: stat.fumbles_lost || 0,
          
          // Kicker stats
          fieldGoalsMade: (stat.field_goals_0_39 || 0) + (stat.field_goals_40_49 || 0) + (stat.field_goals_50_plus || 0),
          extraPointsMade: stat.extra_points || 0,
          fieldGoalsMissed: 0, // Not tracked in current import
          
          // Defense stats
          sacks: stat.sacks || 0,
          interceptions: stat.interceptions_defense || 0,
          fumbleRecoveries: stat.fumble_recoveries || 0,
          safeties: stat.safeties || 0,
          
          // Points allowed (for team defense)
          pointsAllowed: stat.points_allowed || 0,
          
          // Raw database stats for debugging
          rawStats: {
            passing_yards: stat.passing_yards,
            passing_touchdowns: stat.passing_touchdowns,
            interceptions: stat.interceptions,
            rushing_yards: stat.rushing_yards,
            rushing_touchdowns: stat.rushing_touchdowns,
            receiving_yards: stat.receiving_yards,
            receiving_touchdowns: stat.receiving_touchdowns,
            fumbles_lost: stat.fumbles_lost,
            sacks: stat.sacks,
            interceptions_defense: stat.interceptions_defense,
            fumble_recoveries: stat.fumble_recoveries,
            safeties: stat.safeties,
            field_goals_0_39: stat.field_goals_0_39,
            field_goals_40_49: stat.field_goals_40_49,
            field_goals_50_plus: stat.field_goals_50_plus,
            extra_points: stat.extra_points
          }
        }
      }
    }));
    
    res.json({
      week: parseInt(week),
      year: parseInt(year),
      count: scoringReadyStats.length,
      players: scoringReadyStats,
      message: 'Stats formatted for scoring engine'
    });
    
  } catch (error) {
    console.error('Error formatting stats for scoring:', error);
    res.status(500).json({ error: 'Failed to format stats for scoring' });
  }
});

// GET top performers by fantasy points for a specific week
router.get('/week/:week/leaders', async (req, res) => {
  try {
    const { week } = req.params;
    const { year = 2024, position, limit = 20 } = req.query;
    const db = req.app.locals.db;
    
    let query = `
      SELECT 
        ps.*,
        p.name as player_name,
        p.position,
        p.team
      FROM player_stats ps
      JOIN players p ON ps.player_id = p.id
      WHERE ps.week = $1 AND ps.year = $2
    `;
    
    const params = [parseInt(week), parseInt(year)];
    
    if (position) {
      query += ` AND p.position = $3`;
      params.push(position.toUpperCase());
    }
    
    query += ` ORDER BY ps.fantasy_points DESC NULLS LAST, p.name ASC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);
    
    res.json({
      week: parseInt(week),
      year: parseInt(year),
      position: position || 'all',
      count: result.rows.length,
      leaders: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching week leaders:', error);
    res.status(500).json({ error: 'Failed to fetch week leaders' });
  }
});

// Helper functions (moved from players route)
function extractFieldGoalDistances(scoringPlays) {
  const fieldGoalDistances = {};
  
  if (!scoringPlays || !Array.isArray(scoringPlays)) return fieldGoalDistances;
  
  for (const play of scoringPlays) {
    if (play.text && play.text.includes('Field Goal')) {
      const match = play.text.match(/([A-Za-z\s]+)\s+(\d+)\s*Yd\s*Field\s*Goal/);
      if (match) {
        const kickerName = match[1].trim();
        const distance = parseInt(match[2]);
        fieldGoalDistances[kickerName] = distance;
      }
    }
  }
  
  return fieldGoalDistances;
}

function mapESPNStatsToDatabase(statCategory, stats, fieldGoalDistances, playerName) {
  // Add debugging to see what we're getting
  console.log(`🔍 Mapping stats for ${playerName} in ${statCategory}:`, JSON.stringify(stats));
  
  // Initialize with existing stats if they exist, otherwise start with 0s
  const mappedStats = {
    passing_yards: 0, passing_touchdowns: 0, interceptions: 0,
    rushing_yards: 0, rushing_touchdowns: 0,
    receiving_yards: 0, receiving_touchdowns: 0, receptions: 0,
    fumbles_lost: 0, sacks: 0, interceptions_defense: 0,
    fumble_recoveries: 0, safeties: 0, blocked_kicks: 0,
    punt_return_touchdowns: 0, kickoff_return_touchdowns: 0,
    points_allowed: 0, field_goals_0_39: 0, field_goals_40_49: 0,
    field_goals_50_plus: 0, extra_points: 0
  };
  
  // ESPN now provides stats as arrays with specific meanings for each category
  // Based on our test, the structure is different from before
  switch (statCategory) {
    case 'passing':
      console.log(`  📊 Passing stats - Raw:`, stats);
      // ESPN passing format: [completions/attempts, yards, average, touchdowns, interceptions, sacks, rating]
      if (Array.isArray(stats) && stats.length >= 5) {
        mappedStats.passing_yards = parseInt(stats[1]) || 0;        // stats[1] = yards
        mappedStats.passing_touchdowns = parseInt(stats[3]) || 0;   // stats[3] = touchdowns
        mappedStats.interceptions = parseInt(stats[4]) || 0;        // stats[4] = interceptions
        console.log(`    📊 Completions: ${stats[0]}, Yards: ${stats[1]}, Avg: ${stats[2]}, TDs: ${stats[3]}, INTs: ${stats[4]}`);
      }
      break;
    case 'rushing':
      console.log(`  🏃 Rushing stats - Raw:`, stats);
      // ESPN rushing format: [attempts, yards, average, touchdowns, long]
      if (Array.isArray(stats) && stats.length >= 4) {
        mappedStats.rushing_yards = parseInt(stats[1]) || 0;        // stats[1] = yards
        mappedStats.rushing_touchdowns = parseInt(stats[3]) || 0;   // stats[3] = touchdowns
        console.log(`    📊 Attempts: ${stats[0]}, Yards: ${stats[1]}, Avg: ${stats[2]}, TDs: ${stats[3]}`);
      }
      break;
    case 'receiving':
      console.log(`  🤲 Receiving stats - Raw:`, stats);
      // ESPN receiving format: [receptions, yards, average, touchdowns, long, targets]
      if (Array.isArray(stats) && stats.length >= 4) {
        mappedStats.receptions = parseInt(stats[0]) || 0;        // stats[0] = receptions
        mappedStats.receiving_yards = parseInt(stats[1]) || 0;   // stats[1] = yards  
        mappedStats.receiving_touchdowns = parseInt(stats[3]) || 0; // stats[3] = touchdowns
        console.log(`    📊 Receptions: ${stats[0]}, Yards: ${stats[1]}, Avg: ${stats[2]}, TDs: ${stats[3]}`);
      }
      break;
    case 'defensive':
      console.log(`  🛡️ Defensive stats - Raw:`, stats);
      // ESPN defensive format: [tackles, sacks, interceptions, fumble_recoveries, passes_defended, touchdowns]
      if (Array.isArray(stats) && stats.length >= 4) {
        mappedStats.sacks = parseInt(stats[1]) || 0;                    // stats[1] = sacks
        mappedStats.interceptions_defense = parseInt(stats[2]) || 0;     // stats[2] = interceptions
        mappedStats.fumble_recoveries = parseInt(stats[3]) || 0;        // stats[3] = fumble_recoveries
        console.log(`    📊 Tackles: ${stats[0]}, Sacks: ${stats[1]}, INTs: ${stats[2]}, FumRec: ${stats[3]}`);
      }
      break;
    case 'fumbles':
      console.log(`  🏈 Fumble stats - Raw:`, stats);
      // ESPN fumble format: [fumbles, fumbles_lost]
      if (Array.isArray(stats) && stats.length >= 2) {
        mappedStats.fumbles_lost = parseInt(stats[1]) || 0;        // stats[1] = fumbles_lost
        console.log(`    📊 Fumbles: ${stats[0]}, Fumbles Lost: ${stats[1]}`);
      }
      break;
    case 'kicking':
      console.log(`  🦵 Kicking stats - Raw:`, stats);
      // ESPN kicking format: [field_goals_made/attempts, percentage, long_field_goal, extra_points_made/attempts, total_points]
      if (Array.isArray(stats) && stats.length >= 4) {
        // Parse extra points (format: "2/2")
        const extraPointsStr = stats[3];
        if (extraPointsStr && extraPointsStr.includes('/')) {
          const made = extraPointsStr.split('/')[0];
          mappedStats.extra_points = parseInt(made) || 0;
        }
        
        // Parse field goal distance from long field goal
        let fgDistance = 0;
        if (fieldGoalDistances[playerName]) {
          fgDistance = fieldGoalDistances[playerName];
        } else if (stats[2] && stats[2] !== '100.0') {
          fgDistance = parseInt(stats[2]);
        }
        
        if (fgDistance > 0) {
          if (fgDistance <= 39) mappedStats.field_goals_0_39 = 1;
          else if (fgDistance <= 49) mappedStats.field_goals_40_49 = 1;
          else mappedStats.field_goals_50_plus = 1;
        }
        console.log(`    📊 FG: ${stats[0]}, PCT: ${stats[1]}, Long: ${stats[2]}, XP: ${stats[3]}, Total: ${stats[4]}`);
      }
      break;
    case 'punting':
      console.log(`  🏈 Punting stats - Raw:`, stats);
      // ESPN punting format: [punts, total_yards, avg_yards, touchbacks, inside_20, long]
      if (Array.isArray(stats)) {
        console.log(`    📊 Punts: ${stats[0]}, Total Yards: ${stats[1]}, Avg: ${stats[2]}`);
      }
      break;
    case 'kickReturns':
      console.log(`  🏃 Kick Return stats - Raw:`, stats);
      // ESPN kick return format: [returns, yards, avg, long, td]
      if (Array.isArray(stats) && stats.length >= 5) {
        if (parseInt(stats[4]) > 0) {
          mappedStats.kickoff_return_touchdowns = parseInt(stats[4]);
        }
        console.log(`    📊 Returns: ${stats[0]}, Yards: ${stats[1]}, Avg: ${stats[2]}, Long: ${stats[3]}, TDs: ${stats[4]}`);
      }
      break;
    case 'puntReturns':
      console.log(`  🏃 Punt Return stats - Raw:`, stats);
      // ESPN punt return format: [returns, yards, avg, long, td]
      if (Array.isArray(stats) && stats.length >= 5) {
        if (parseInt(stats[4]) > 0) {
          mappedStats.punt_return_touchdowns = parseInt(stats[4]);
        }
        console.log(`    📊 Returns: ${stats[0]}, Yards: ${stats[1]}, Avg: ${stats[2]}, Long: ${stats[3]}, TDs: ${stats[4]}`);
      }
      break;
    case 'interceptions':
      console.log(`  🛡️ Interception stats - Raw:`, stats);
      // ESPN interception format: [interceptions, yards, touchdowns]
      if (Array.isArray(stats) && stats.length >= 1) {
        mappedStats.interceptions_defense = parseInt(stats[0]) || 0;
        console.log(`    📊 INTs: ${stats[0]}, Yards: ${stats[1]}, TDs: ${stats[2]}`);
      }
      break;
    default:
      console.log(`  ❓ Unknown stat category: ${statCategory} - Raw:`, stats);
      break;
  }
  
  console.log(`  ✅ Mapped stats for ${playerName}:`, mappedStats);
  return mappedStats;
}

function determinePlayoffWeek(gameDate) {
  const date = new Date(gameDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if (month === 1) {
    if (day <= 15) return 1; // Wild Card
    if (day <= 22) return 2; // Divisional
    if (day <= 29) return 3; // Conference Championship
  } else if (month === 2) {
    return 4; // Super Bowl
  }
  
  return 1; // Default to Wild Card
}

export default router;
