import cron from 'node-cron';
// Note: Using global fetch (available in Node 18+)

/**
 * Automated stat pulling scheduler
 * 
 * Schedule:
 * - Wednesday: Fetch and store weekly game schedule (runs at 10 AM ET / 2 PM UTC)
 * - During games: Pull stats every 5 minutes (30 min before first game until 5 hours after last game)
 * - Final check: Run once at 2 AM ET for good measure
 */

// Store reference to cron jobs so we can start/stop them
const cronJobs = {
  scheduleFetcher: null,
  statPuller: null,
  finalCheck: null
};

let isPullingActive = false;

/**
 * Fetch and store weekly game schedule from ESPN
 * This runs on Wednesday to get the week's game times
 * Can also be called manually via API endpoint
 */
export async function fetchAndStoreWeeklySchedule(db, systemApiKey) {
  try {
    console.log('📅 [CRON] Fetching weekly game schedule...');
    
    // Get current week from ESPN
    // Use global fetch (available in Node 18+)
    const scoreboardResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', {
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!scoreboardResponse.ok) {
      console.error('❌ [CRON] Failed to fetch scoreboard:', scoreboardResponse.status);
      throw new Error(`ESPN API returned status ${scoreboardResponse.status}`);
    }
    
    const scoreboardData = await scoreboardResponse.json();
    
    if (!scoreboardData.events || !Array.isArray(scoreboardData.events)) {
      console.log('⚠️ [CRON] No games found for current week');
      throw new Error('No games found for current week');
    }
    
    const week = scoreboardData.week?.number;
    const year = scoreboardData.season?.year || new Date().getFullYear();
    
    // Map ESPN season type
    const espnSeasonTypeId = scoreboardData.season?.type;
    let seasonType = 'regular';
    if (espnSeasonTypeId === 3) seasonType = 'postseason';
    else if (espnSeasonTypeId === 1) seasonType = 'preseason';
    
    console.log(`📊 [CRON] Processing Week ${week}, Year ${year}, Type: ${seasonType}`);
    console.log(`🏈 [CRON] Found ${scoreboardData.events.length} games`);
    
    // Clear existing schedule for this week
    // Delete by week/year/season_type OR by matching game_ids OR old rows with no game_id for this week
    const gameIds = scoreboardData.events.map(g => g.id);
    const deleteResult = await db.query(
      `DELETE FROM game_schedule 
       WHERE (week = $1 AND year = $2 AND season_type = $3)
       OR (week = $1 AND year = $2 AND game_id IS NULL)
       OR game_id = ANY($4::varchar[])
       RETURNING id`,
      [week, year, seasonType, gameIds]
    );
    console.log(`🗑️ Deleted ${deleteResult.rows.length} existing game schedule entries`);
    
    // Reset the sequence after deletion to avoid ID conflicts
    // Get the max ID and set sequence to start after it
    const maxIdResult = await db.query('SELECT COALESCE(MAX(id), 0) as max_id FROM game_schedule');
    const maxId = maxIdResult.rows[0].max_id || 0;
    await db.query(`SELECT setval('game_schedule_id_seq', $1, true)`, [maxId]);
    console.log(`🔄 Reset sequence to start at ${maxId + 1}`);
    
    // Insert all games for this week using UPSERT (insert or update)
    const gameTimes = [];
    for (const game of scoreboardData.events) {
      const gameDate = new Date(game.date);
      const homeTeam = game.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.abbreviation;
      const awayTeam = game.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.abbreviation;
      const status = game.status?.type?.name || 'scheduled';
      
      // Use UPSERT - if unique constraint matches, update; otherwise insert
      // The unique constraint is on (year, week, season_type, game_id)
      await db.query(
        `INSERT INTO game_schedule (week, year, season_type, game_id, game_name, game_date, home_team, away_team, game_status, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (year, week, season_type, game_id) 
         DO UPDATE SET 
           game_date = EXCLUDED.game_date,
           game_name = EXCLUDED.game_name,
           home_team = EXCLUDED.home_team,
           away_team = EXCLUDED.away_team,
           game_status = EXCLUDED.game_status,
           updated_at = NOW()`,
        [week, year, seasonType, game.id, game.name, gameDate, homeTeam, awayTeam, status]
      );
      
      gameTimes.push(gameDate);
      console.log(`  ✅ Stored: ${game.name} at ${gameDate.toISOString()}`);
    }
    
    // Calculate pull window
    if (gameTimes.length > 0) {
      const firstGame = new Date(Math.min(...gameTimes.map(d => d.getTime())));
      const lastGame = new Date(Math.max(...gameTimes.map(d => d.getTime())));
      const pullStart = new Date(firstGame.getTime() - 30 * 60 * 1000); // 30 min before
      const pullEnd = new Date(lastGame.getTime() + 5 * 60 * 60 * 1000); // 5 hours after
      
      console.log(`📅 [CRON] Pull window: ${pullStart.toISOString()} to ${pullEnd.toISOString()}`);
      console.log(`   First game: ${firstGame.toISOString()}`);
      console.log(`   Last game: ${lastGame.toISOString()}`);
    }
    
    console.log(`✅ [CRON] Stored ${scoreboardData.events.length} games for Week ${week}`);
    
    return {
      success: true,
      gamesStored: scoreboardData.events.length,
      week,
      year,
      seasonType
    };
    
  } catch (error) {
    console.error('❌ [CRON] Error fetching weekly schedule:', error);
    throw error; // Re-throw so the API endpoint can handle it
  }
}

/**
 * Pull stats from ESPN (calls the weekly-update endpoint)
 * Uses internal API call via localhost
 */
async function pullStats(db, systemApiKey, port = 8080) {
  if (isPullingActive) {
    console.log('⏸️ [CRON] Stat pull already in progress, skipping...');
    return;
  }
  
  try {
    isPullingActive = true;
    console.log('🔄 [CRON] Pulling stats from ESPN...');
    
    // Call the weekly-update endpoint via internal HTTP
    const url = `http://localhost:${port}/api/stats/weekly-update`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-System-API-Key': systemApiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [CRON] Failed to pull stats: ${response.status} - ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`✅ [CRON] Stats pulled successfully: ${data.message || 'Done'}`);
    
  } catch (error) {
    console.error('❌ [CRON] Error pulling stats:', error);
  } finally {
    isPullingActive = false;
  }
}

/**
 * Check if we're currently in the game time window
 */
async function isInGameTimeWindow(db) {
  try {
    const now = new Date();
    
    // Get all games for this week
    const result = await db.query(
      `SELECT game_date FROM game_schedule 
       WHERE game_date >= NOW() - INTERVAL '6 hours' 
       AND game_date <= NOW() + INTERVAL '6 hours'
       ORDER BY game_date ASC`
    );
    
    if (result.rows.length === 0) {
      return { inWindow: false, reason: 'No games scheduled' };
    }
    
    // Find first and last game in the near future
    const upcomingGames = result.rows
      .map(r => new Date(r.game_date))
      .filter(d => d > now - 6 * 60 * 60 * 1000); // Within last 6 hours or future
    
    if (upcomingGames.length === 0) {
      // All games are in the past, check if within 5 hours of last game
      const pastGames = result.rows
        .map(r => new Date(r.game_date))
        .filter(d => d <= now);
      
      if (pastGames.length > 0) {
        const lastGame = new Date(Math.max(...pastGames.map(d => d.getTime())));
        const pullEnd = new Date(lastGame.getTime() + 5 * 60 * 60 * 1000);
        return {
          inWindow: now <= pullEnd,
          reason: now <= pullEnd ? `Within 5 hours of last game` : 'Past pull window'
        };
      }
      return { inWindow: false, reason: 'No recent games' };
    }
    
    // We have upcoming or recent games
    const firstGame = new Date(Math.min(...upcomingGames.map(d => d.getTime())));
    const lastGame = new Date(Math.max(...upcomingGames.map(d => d.getTime())));
    
    const pullStart = new Date(firstGame.getTime() - 30 * 60 * 1000); // 30 min before
    const pullEnd = new Date(lastGame.getTime() + 5 * 60 * 60 * 1000); // 5 hours after
    
    const inWindow = now >= pullStart && now <= pullEnd;
    
    return {
      inWindow,
      reason: inWindow 
        ? `Between ${pullStart.toISOString()} and ${pullEnd.toISOString()}`
        : `Outside window (start: ${pullStart.toISOString()}, end: ${pullEnd.toISOString()})`
    };
    
  } catch (error) {
    console.error('❌ [CRON] Error checking game time window:', error);
    return { inWindow: false, reason: `Error: ${error.message}` };
  }
}

/**
 * Initialize and start all cron jobs
 */
export function startCronJobs(db, systemApiKey) {
  const port = process.env.PORT || 8080;
  console.log('🚀 [CRON] Starting automated stat pulling scheduler...');
  
  // Cron job: Fetch weekly schedule on Wednesday at 10 AM ET (2 PM UTC)
  // This runs every Wednesday to get the upcoming week's schedule
  cronJobs.scheduleFetcher = cron.schedule('0 14 * * 3', async () => {
    console.log('📅 [CRON] Wednesday schedule fetch triggered');
    await fetchAndStoreWeeklySchedule(db, systemApiKey);
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });
  
  console.log('✅ [CRON] Schedule fetcher: Runs Wednesdays at 10 AM ET');
  
    // Cron job: Pull stats every 15 minutes during game times (reduced to save costs)
    // Check if we're in the game time window before pulling
    cronJobs.statPuller = cron.schedule('*/15 * * * *', async () => {
      const windowCheck = await isInGameTimeWindow(db);
      
      if (windowCheck.inWindow) {
        console.log(`🔄 [CRON] In game time window (${windowCheck.reason}), pulling stats...`);
        await pullStats(db, systemApiKey, port);
      } else {
        // Log every 15 minutes (at :00, :15, :30, :45) to help with debugging
        const now = new Date();
        if (now.getMinutes() % 15 === 0) {
          console.log(`⏸️ [CRON] Not in game time window (${windowCheck.reason}), skipping stat pull...`);
        }
      }
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    });
  
  console.log('✅ [CRON] Stat puller: Runs every 5 minutes, only during game times');
  
  // Cron job: Final check at 2 AM ET
  cronJobs.finalCheck = cron.schedule('0 2 * * *', async () => {
    console.log('🌙 [CRON] Final check triggered at 2 AM');
    const windowCheck = await isInGameTimeWindow(db);
    
    if (windowCheck.inWindow) {
      console.log(`🔄 [CRON] In game time window, pulling stats...`);
      await pullStats(db, systemApiKey, port);
    } else {
      console.log(`⏸️ [CRON] Not in game time window, skipping...`);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });
  
  console.log('✅ [CRON] Final check: Runs daily at 2 AM ET');
  
  // Also fetch schedule on startup if it's Wednesday or later in the week
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 3 = Wednesday
  if (dayOfWeek >= 3) {
    console.log('📅 [CRON] Fetching schedule on startup (it\'s Wednesday or later)...');
    fetchAndStoreWeeklySchedule(db, systemApiKey).catch(err => {
      console.error('❌ [CRON] Error fetching schedule on startup:', err);
    });
  }
  
  console.log('✅ [CRON] All cron jobs started successfully!');
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  console.log('🛑 [CRON] Stopping all cron jobs...');
  
  if (cronJobs.scheduleFetcher) {
    cronJobs.scheduleFetcher.stop();
    cronJobs.scheduleFetcher = null;
  }
  
  if (cronJobs.statPuller) {
    cronJobs.statPuller.stop();
    cronJobs.statPuller = null;
  }
  
  if (cronJobs.finalCheck) {
    cronJobs.finalCheck.stop();
    cronJobs.finalCheck = null;
  }
  
  console.log('✅ [CRON] All cron jobs stopped');
}

