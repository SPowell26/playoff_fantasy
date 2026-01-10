import express from 'express';
import { requireCommissionerOrSystem } from '../middleware/auth.js';
import { fetchAndStoreWeeklySchedule } from '../cron/scheduler.js';
const router = express.Router();

// Cache for week status to avoid hitting ESPN API too frequently
let weekStatusCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

// Helper function to map ESPN season type numbers to strings
const mapSeasonType = (espnSeasonType) => {
  // ESPN uses numeric season types
  switch (espnSeasonType) {
    case 1:
      return 'preseason';
    case 2:
      return 'regular';
    case 3:
      return 'postseason';
    default:
      return 'unknown';
  }
};

// GET current week status
router.get('/current-week', async (req, res) => {
  try {
    // Check if we have valid cached data
    if (weekStatusCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('📋 Returning cached week status');
      return res.json(weekStatusCache);
    }

    console.log('🔄 Fetching fresh week status from ESPN API...');

    // Fetch current week status from ESPN API
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    
    if (!response.ok) {
      throw new Error(`ESPN API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📡 ESPN API Response Status:', response.status);
    console.log('📊 ESPN API Response Keys:', Object.keys(data));
    console.log('🔍 ESPN Season Data:', data.season);
    console.log('🔍 ESPN Week Data:', data.week);

    // Extract week information
    let currentWeek = null;
    let seasonType = null;
    let seasonYear = null;
    let isPlayoffs = false;
    let playoffRound = null;

    if (data.content && data.content.sbData) {
      // Super Bowl specific data
      const sbData = data.content.sbData;
      currentWeek = 22; // Super Bowl is always week 22 in our system
      seasonType = 'postseason';
      seasonYear = sbData.season || new Date().getFullYear();
      isPlayoffs = true;
      playoffRound = 'Super Bowl';
    } else if (data.week) {
      // Regular season or playoff week
      currentWeek = data.week.number;
      seasonType = mapSeasonType(data.season.type);
      seasonYear = data.season.year;
      
      // Determine if we're in playoffs and which round
      if (seasonType === 'postseason') {
        isPlayoffs = true;
        if (currentWeek === 1) playoffRound = 'Wild Card';
        else if (currentWeek === 2) playoffRound = 'Divisional';
        else if (currentWeek === 3) playoffRound = 'Conference Championship';
        else if (currentWeek === 4) playoffRound = 'Super Bowl';
      }
    }

    // If we couldn't get week from the main endpoint, try the events endpoint
    if (!currentWeek) {
      console.log('🔄 Trying events endpoint for week info...');
      const eventsResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/events');
      const eventsData = await eventsResponse.json();
      
      if (eventsData.events && eventsData.events.length > 0) {
        const currentEvent = eventsData.events.find(event => {
          const eventDate = new Date(event.date);
          const now = new Date();
          return eventDate > now; // Find next upcoming game
        });
        
        if (currentEvent) {
          currentWeek = currentEvent.week?.number || 1;
          seasonType = mapSeasonType(currentEvent.season?.type || 2);
          seasonYear = currentEvent.season?.year || new Date().getFullYear();
        }
      }
    }

    // Use ESPN week number directly (no fantasy week mapping needed)
    // Playoff weeks are 1-4 (Wild Card, Divisional, Conference Championship, Super Bowl)
    // Regular season weeks are 1-18
    const weekStatus = {
      currentWeek: currentWeek, // Use ESPN week number directly
      espnWeek: currentWeek,
      seasonType,
      seasonYear,
      isPlayoffs,
      playoffRound,
      lastUpdated: new Date().toISOString(),
      source: 'ESPN API'
    };

    // Cache the result
    weekStatusCache = weekStatus;
    cacheTimestamp = Date.now();

    console.log('✅ Week status retrieved:', weekStatus);
    res.json(weekStatus);

  } catch (error) {
    console.error('❌ Failed to get week status:', error);
    
    // Return cached data if available, even if expired
    if (weekStatusCache) {
      console.log('📋 Returning expired cached data as fallback');
      return res.json({
        ...weekStatusCache,
        warning: 'Using cached data - API unavailable',
        lastUpdated: new Date(cacheTimestamp).toISOString()
      });
    }

    res.status(500).json({ 
      error: 'Failed to get week status',
      message: error.message 
    });
  }
});

// GET week status for a specific date (useful for historical data)
router.get('/week-for-date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    console.log(`🔄 Getting week status for date: ${date}`);

    // For historical dates, we'll need to determine the week based on the date
    // This is a simplified approach - you might want to enhance this
    const currentYear = targetDate.getFullYear();
    const currentMonth = targetDate.getMonth() + 1; // January = 1
    
    let estimatedWeek = 1;
    let seasonType = 'regular';
    let isPlayoffs = false;
    let playoffRound = null;

    // Rough estimation based on month
    if (currentMonth >= 8 && currentMonth <= 12) {
      // August-December: Regular season weeks 1-17
      estimatedWeek = Math.min(17, Math.max(1, currentMonth - 7));
    } else if (currentMonth === 1) {
      // January: Playoffs
      seasonType = 'postseason';
      isPlayoffs = true;
      estimatedWeek = 19; // Wild Card
    } else if (currentMonth === 2) {
      // February: Super Bowl
      seasonType = 'postseason';
      isPlayoffs = true;
      estimatedWeek = 22; // Super Bowl
    }

    res.json({
      targetDate: date,
      estimatedWeek: estimatedWeek,
      seasonType,
      seasonYear: currentYear,
      isPlayoffs,
      playoffRound,
      note: 'This is an estimated week based on date - use current-week endpoint for accurate data'
    });

  } catch (error) {
    console.error('❌ Failed to get week for date:', error);
    res.status(500).json({ 
      error: 'Failed to get week for date',
      message: error.message 
    });
  }
});

// GET all available week information (for debugging)
router.get('/debug', async (req, res) => {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const data = await response.json();
    
    res.json({
      message: 'Raw ESPN API response for debugging',
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug endpoint failed:', error);
    res.status(500).json({ 
      error: 'Debug endpoint failed',
      message: error.message 
    });
  }
});

// POST manually fetch and store weekly game schedule
// This allows triggering the schedule fetch outside of the Wednesday cron job
router.post('/fetch-schedule', requireCommissionerOrSystem, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const systemApiKey = process.env.SYSTEM_API_KEY;
    
    console.log('📅 Manual schedule fetch triggered');
    
    // Call the schedule fetch function
    await fetchAndStoreWeeklySchedule(db, systemApiKey);
    
    res.json({
      success: true,
      message: 'Weekly game schedule fetched and stored successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to fetch schedule:', error);
    res.status(500).json({ 
      error: 'Failed to fetch schedule',
      message: error.message 
    });
  }
});

export default router;

