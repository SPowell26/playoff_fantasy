// Comprehensive ESPN API Testing Script
// Tests all endpoints and views to map available data
import fetch from 'node-fetch';

// Configuration
const ESPN_ENDPOINTS = {
  // Core NFL Data
  'nfl_athletes': 'https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=100',
  'nfl_events': 'https://partners.api.espn.com/v2/sports/football/nfl/events?limit=10',
  'nfl_scoreboard': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  
  // Fantasy API Views (2024 season - more data)
  'fantasy_mBoxscore': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mBoxscore',
  'fantasy_mMatchup': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mMatchup',
  'fantasy_mMatchupScore': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mMatchupScore',
  'fantasy_mLiveScoring': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring',
  'fantasy_mRoster': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mRoster',
  'fantasy_mStats': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mStats',
  
  // Fantasy API Views (2025 season - current)
  'fantasy_2025_mBoxscore': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players?view=mBoxscore',
  'fantasy_2025_mLiveScoring': 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players?view=mLiveScoring',
  
  // Additional potential endpoints
  'nfl_teams': 'https://partners.api.espn.com/v2/sports/football/nfl/teams',
  'nfl_standings': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/standings',
  'nfl_schedule': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/schedule'
};

// Data structure to store results
const results = {};

async function testEndpoint(name, url, description) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TESTING: ${name}`);
  console.log(`📡 URL: ${url}`);
  console.log(`📝 Description: ${description}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`⏱️ Response Time: ${responseTime}ms`);
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Store basic info
      results[name] = {
        status: response.status,
        responseTime,
        contentType: response.headers.get('content-type'),
        dataType: typeof data,
        isArray: Array.isArray(data),
        dataSize: JSON.stringify(data).length,
        keys: data && typeof data === 'object' ? Object.keys(data) : null,
        sampleData: null
      };
      
      // Analyze data structure
      if (Array.isArray(data)) {
        console.log(`📊 Response Type: Array`);
        console.log(`📊 Array Length: ${data.length}`);
        
        if (data.length > 0) {
          const firstItem = data[0];
          console.log(`🎯 First Item Keys: ${Object.keys(firstItem).join(', ')}`);
          
          // Look for key data structures
          if (firstItem.stats) {
            console.log(`🎯 Found 'stats' structure!`);
            console.log(`🎯 Stats Type: ${typeof firstItem.stats}`);
            if (Array.isArray(firstItem.stats)) {
              console.log(`🎯 Stats Array Length: ${firstItem.stats.length}`);
              if (firstItem.stats.length > 0) {
                const firstStat = firstItem.stats[0];
                console.log(`🎯 First Stat Keys: ${Object.keys(firstStat).join(', ')}`);
              }
            }
          }
          
          if (firstItem.games) {
            console.log(`🎯 Found 'games' structure!`);
            console.log(`🎯 Games Type: ${typeof firstItem.games}`);
          }
          
          if (firstItem.liveScoring) {
            console.log(`🎯 Found 'liveScoring' structure!`);
            console.log(`🎯 LiveScoring Keys: ${Object.keys(firstItem.liveScoring).join(', ')}`);
          }
          
          // Store sample data
          results[name].sampleData = JSON.stringify(firstItem, null, 2).substring(0, 1000);
          console.log(`\n📋 Sample Data (first 1000 chars):`);
          console.log(results[name].sampleData);
        }
        
      } else if (data && typeof data === 'object') {
        console.log(`📊 Response Type: Object`);
        console.log(`📊 Response Keys: ${Object.keys(data).join(', ')}`);
        
        // Look for nested structures
        if (data.events) {
          console.log(`🎯 Found 'events' structure!`);
          if (Array.isArray(data.events)) {
            console.log(`🎯 Events Array Length: ${data.events.length}`);
            if (data.events.length > 0) {
              const firstEvent = data.events[0];
              console.log(`🎯 First Event Keys: ${Object.keys(firstEvent).join(', ')}`);
              
              if (firstEvent.competitions) {
                console.log(`🎯 Found 'competitions' in event!`);
                console.log(`🎯 Competitions Length: ${firstEvent.competitions.length}`);
              }
            }
          }
        }
        
        if (data.athletes) {
          console.log(`🎯 Found 'athletes' structure!`);
          console.log(`🎯 Athletes Array Length: ${data.athletes.length}`);
        }
        
        if (data.week) {
          console.log(`🎯 Found 'week' structure!`);
          console.log(`🎯 Week Info: ${JSON.stringify(data.week)}`);
        }
        
        if (data.season) {
          console.log(`🎯 Found 'season' structure!`);
          console.log(`🎯 Season Info: ${JSON.stringify(data.season)}`);
        }
        
        // Store sample data
        results[name].sampleData = JSON.stringify(data, null, 2).substring(0, 1000);
        console.log(`\n📋 Sample Data (first 1000 chars):`);
        console.log(results[name].sampleData);
      }
      
    } else {
      console.log(`❌ API request failed`);
      const errorText = await response.text();
      console.log(`📊 Error Response: ${errorText.substring(0, 500)}`);
      
      results[name] = {
        status: response.status,
        error: errorText.substring(0, 500),
        responseTime,
        contentType: response.headers.get('content-type')
      };
    }
    
  } catch (error) {
    console.error(`❌ Error testing ${name}:`, error.message);
    results[name] = {
      error: error.message,
      status: 'ERROR'
    };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive ESPN API Testing...\n');
  console.log(`📅 Test Time: ${new Date().toISOString()}`);
  console.log(`🎯 Total Endpoints to Test: ${Object.keys(ESPN_ENDPOINTS).length}\n`);
  
  // Test each endpoint
  for (const [name, url] of Object.entries(ESPN_ENDPOINTS)) {
    const description = getEndpointDescription(name);
    await testEndpoint(name, url, description);
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate summary report
  generateSummaryReport();
}

function getEndpointDescription(name) {
  const descriptions = {
    'nfl_athletes': 'Core NFL player data - names, positions, teams, basic info',
    'nfl_events': 'NFL game events and schedules',
    'nfl_scoreboard': 'Current week status, scores, and game information',
    'fantasy_mBoxscore': 'Fantasy player stats with detailed scoring breakdowns',
    'fantasy_mMatchup': 'Fantasy matchup data and head-to-head information',
    'fantasy_mMatchupScore': 'Fantasy matchup scoring and results',
    'fantasy_mLiveScoring': 'Real-time live scoring updates during games',
    'fantasy_mRoster': 'Fantasy roster and team composition data',
    'fantasy_mStats': 'Fantasy statistics and performance metrics',
    'fantasy_2025_mBoxscore': 'Current season (2025) fantasy stats',
    'fantasy_2025_mLiveScoring': 'Current season (2025) live scoring',
    'nfl_teams': 'NFL team information and details',
    'nfl_standings': 'NFL standings and rankings',
    'nfl_schedule': 'NFL season schedule and game dates'
  };
  
  return descriptions[name] || 'No description available';
}

function generateSummaryReport() {
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 COMPREHENSIVE TESTING SUMMARY REPORT');
  console.log(`${'='.repeat(80)}`);
  
  console.log(`\n📈 Endpoint Status Summary:`);
  let successCount = 0;
  let errorCount = 0;
  
  for (const [name, result] of Object.entries(results)) {
    const status = result.status === 200 ? '✅ SUCCESS' : '❌ FAILED';
    const size = result.dataSize ? `(${result.dataSize} chars)` : '';
    console.log(`${status} ${name} ${size}`);
    
    if (result.status === 200) successCount++;
    else errorCount++;
  }
  
  console.log(`\n📊 Summary Statistics:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📊 Total: ${Object.keys(results).length}`);
  
  console.log(`\n🎯 Key Data Structures Found:`);
  const dataStructures = new Set();
  
  for (const [name, result] of Object.entries(results)) {
    if (result.keys) {
      result.keys.forEach(key => dataStructures.add(key));
    }
  }
  
  console.log(`📋 Available Data Keys: ${Array.from(dataStructures).sort().join(', ')}`);
  
  console.log(`\n🔗 Data Flow Recommendations:`);
  console.log(`1. Use nfl_scoreboard for current week/season detection`);
  console.log(`2. Use nfl_athletes for player roster management`);
  console.log(`3. Use fantasy_mBoxscore for detailed player statistics`);
  console.log(`4. Use fantasy_mLiveScoring for real-time updates during games`);
  console.log(`5. Use nfl_events for game scheduling and results`);
  
  console.log(`\n💾 Results stored in 'results' object for further analysis`);
  console.log(`${'='.repeat(80)}`);
}

// Run the comprehensive test
runAllTests();
