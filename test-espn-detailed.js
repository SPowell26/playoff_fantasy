async function testESPNDetailed() {
  console.log('🔍 Detailed ESPN API Analysis...\n');
  
  try {
    // Test 1: Get athletes with more detail
    console.log('1. Analyzing Athletes endpoint structure...');
    const athletesResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=5');
    const athletesData = await athletesResponse.json();
    
    console.log('📊 Athletes data structure:');
    console.log('- Total count:', athletesData.count);
    console.log('- Items array length:', athletesData.items?.length);
    
    if (athletesData.items?.[0]) {
      const samplePlayer = athletesData.items[0];
      console.log('\n👤 Sample player structure:');
      console.log('- ID:', samplePlayer.id);
      console.log('- Name:', samplePlayer.name);
      console.log('- Position:', samplePlayer.position?.abbreviation);
      console.log('- Team:', samplePlayer.team?.name);
      console.log('- Available fields:', Object.keys(samplePlayer));
    }
    
    // Test 2: Get events with more detail
    console.log('\n2. Analyzing Events endpoint structure...');
    const eventsResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/events?limit=3');
    const eventsData = await eventsResponse.json();
    
    console.log('📅 Events data structure:');
    console.log('- Total count:', eventsData.count);
    console.log('- Items array length:', eventsData.items?.length);
    
    if (eventsData.items?.[0]) {
      const sampleEvent = eventsData.items[0];
      console.log('\n🏈 Sample event structure:');
      console.log('- ID:', sampleEvent.id);
      console.log('- Name:', sampleEvent.name);
      console.log('- Date:', sampleEvent.date);
      console.log('- Available fields:', Object.keys(sampleEvent));
    }
    
    // Test 3: Get fantasy data with more detail
    console.log('\n3. Analyzing Fantasy endpoint structure...');
    const fantasyResponse = await fetch('https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring');
    const fantasyData = await fantasyResponse.json();
    
    console.log('⭐ Fantasy data structure:');
    console.log('- Players array length:', fantasyData.players?.length);
    
    if (fantasyData.players?.[0]) {
      const sampleFantasyPlayer = fantasyData.players[0];
      console.log('\n🎯 Sample fantasy player structure:');
      console.log('- Player name:', sampleFantasyPlayer.player?.fullName);
      console.log('- Position:', sampleFantasyPlayer.player?.defaultPositionId);
      console.log('- Available fields:', Object.keys(sampleFantasyPlayer));
      
      if (sampleFantasyPlayer.player) {
        console.log('- Player object fields:', Object.keys(sampleFantasyPlayer.player));
      }
    }
    
    // Test 4: Get individual player stats
    console.log('\n4. Testing individual player stats...');
    if (athletesData.items?.[0]?.id) {
      const playerId = athletesData.items[0].id;
      const playerResponse = await fetch(`https://partners.api.espn.com/v2/sports/football/nfl/athletes/${playerId}`);
      const playerData = await playerResponse.json();
      
      console.log('📈 Individual player stats:');
      console.log('- Player name:', playerData.name);
      console.log('- Has stats:', !!playerData.stats);
      if (playerData.stats) {
        console.log('- Stats fields:', Object.keys(playerData.stats));
        console.log('- Sample stats:', Object.keys(playerData.stats).slice(0, 5));
      }
    }
    
    console.log('\n🎉 Analysis complete!');
    console.log('\n📋 Data available:');
    console.log('✅ Player database:', athletesData.count, 'players');
    console.log('✅ Game events:', eventsData.count, 'events');
    console.log('✅ Fantasy data:', fantasyData.players?.length || 0, 'players');
    
  } catch (error) {
    console.error('❌ Detailed test failed:', error.message);
  }
}

testESPNDetailed(); 