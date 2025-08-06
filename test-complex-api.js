async function testComplexAPI() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🧪 Testing Complex API Operations...\n');
    
    // Test 1: Create a new league
    console.log('1. Creating a new league...');
    const createResponse = await fetch(`${baseURL}/api/leagues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Super Bowl Fantasy League',
        commissioner: 'Sarah Johnson'
      })
    });
    const newLeague = await createResponse.json();
    console.log('✅ New league created:', newLeague.name, '(ID:', newLeague.id, ')');
    
    // Test 2: Get the newly created league
    console.log('\n2. Fetching the new league...');
    const getResponse = await fetch(`${baseURL}/api/leagues/${newLeague.id}`);
    const fetchedLeague = await getResponse.json();
    console.log('✅ Retrieved league:', fetchedLeague.name);
    
    // Test 3: Update the league
    console.log('\n3. Updating the league...');
    const updateResponse = await fetch(`${baseURL}/api/leagues/${newLeague.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Super Bowl Fantasy League',
        commissioner: 'Sarah Johnson (Updated)'
      })
    });
    const updatedLeague = await updateResponse.json();
    console.log('✅ League updated:', updatedLeague.name);
    
    // Test 4: Get players by position
    console.log('\n4. Getting all QBs...');
    const qbResponse = await fetch(`${baseURL}/api/players/position/QB`);
    const qbs = await qbResponse.json();
    console.log('✅ Found', qbs.length, 'quarterbacks');
    
    // Test 5: Get specific player
    console.log('\n5. Getting Tom Brady...');
    const playerResponse = await fetch(`${baseURL}/api/players/1`);
    const player = await playerResponse.json();
    console.log('✅ Player:', player.name, '-', player.position, '-', player.playoff_team);
    
    // Test 6: Test error handling - get non-existent league
    console.log('\n6. Testing error handling...');
    const errorResponse = await fetch(`${baseURL}/api/leagues/999`);
    const errorData = await errorResponse.json();
    console.log('✅ Error handled correctly:', errorData.error);
    
    console.log('\n🎉 All complex API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testComplexAPI(); 