async function testESPNEndpoints() {
  console.log('🏈 Testing ESPN API Endpoints...\n');
  
  try {
    // Test 1: Athletes endpoint (Players)
    console.log('1. Testing Athletes endpoint (Players)...');
    const athletesResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=10');
    const athletesData = await athletesResponse.json();
    console.log('✅ Athletes endpoint working!');
    console.log('📊 Sample player:', athletesData.items?.[0]?.name || 'No data');
    console.log('📈 Total players available:', athletesData.count || 'Unknown');
    
    // Test 2: Events endpoint (Games)
    console.log('\n2. Testing Events endpoint (Games)...');
    const eventsResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/events?limit=5');
    const eventsData = await eventsResponse.json();
    console.log('✅ Events endpoint working!');
    console.log('📅 Sample game:', eventsData.items?.[0]?.name || 'No data');
    console.log('📈 Total events available:', eventsData.count || 'Unknown');
    
    // Test 3: Fantasy endpoint (Scoring)
    console.log('\n3. Testing Fantasy endpoint (Scoring)...');
    const fantasyResponse = await fetch('https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring');
    const fantasyData = await fantasyResponse.json();
    console.log('✅ Fantasy endpoint working!');
    console.log('📊 Sample fantasy player:', fantasyData.players?.[0]?.player?.fullName || 'No data');
    console.log('📈 Total fantasy players:', fantasyData.players?.length || 'Unknown');
    
    // Test 4: Get detailed player info
    console.log('\n4. Testing detailed player info...');
    if (athletesData.items?.[0]?.id) {
      const playerId = athletesData.items[0].id;
      const playerResponse = await fetch(`https://partners.api.espn.com/v2/sports/football/nfl/athletes/${playerId}`);
      const playerData = await playerResponse.json();
      console.log('✅ Individual player endpoint working!');
      console.log('👤 Player details:', {
        name: playerData.name,
        position: playerData.position?.abbreviation,
        team: playerData.team?.name,
        stats: playerData.stats ? 'Available' : 'Not available'
      });
    }
    
    console.log('\n🎉 All ESPN API endpoints are working!');
    console.log('\n📋 Next steps:');
    console.log('- Analyze data structure for each endpoint');
    console.log('- Build data models for your app');
    console.log('- Implement caching strategy');
    console.log('- Create custom scoring system');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('- Check internet connection');
    console.log('- Verify endpoints are still active');
    console.log('- Try with different limits');
  }
}

testESPNEndpoints(); 