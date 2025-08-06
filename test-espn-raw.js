async function testESPNRaw() {
  console.log('🔍 Raw ESPN API Data Structure...\n');
  
  try {
    // Test 1: Get raw athletes data
    console.log('1. Raw Athletes endpoint data:');
    const athletesResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=3');
    const athletesData = await athletesResponse.json();
    
    console.log('📊 Athletes response structure:');
    console.log(JSON.stringify(athletesData, null, 2).substring(0, 1000));
    console.log('... (truncated)');
    
    // Test 2: Get raw events data
    console.log('\n2. Raw Events endpoint data:');
    const eventsResponse = await fetch('https://partners.api.espn.com/v2/sports/football/nfl/events?limit=2');
    const eventsData = await eventsResponse.json();
    
    console.log('📅 Events response structure:');
    console.log(JSON.stringify(eventsData, null, 2).substring(0, 1000));
    console.log('... (truncated)');
    
    // Test 3: Get raw fantasy data
    console.log('\n3. Raw Fantasy endpoint data:');
    const fantasyResponse = await fetch('https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring');
    const fantasyData = await fantasyResponse.json();
    
    console.log('⭐ Fantasy response structure:');
    console.log(JSON.stringify(fantasyData, null, 2).substring(0, 1000));
    console.log('... (truncated)');
    
    console.log('\n🎉 Raw data analysis complete!');
    
  } catch (error) {
    console.error('❌ Raw test failed:', error.message);
  }
}

testESPNRaw(); 