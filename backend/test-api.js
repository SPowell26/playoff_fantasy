const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🧪 Testing API endpoints...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    
    // Test leagues endpoint
    console.log('\n2. Testing leagues endpoint...');
    const leaguesResponse = await fetch(`${baseURL}/api/leagues`);
    const leaguesData = await leaguesResponse.json();
    console.log('✅ Leagues found:', leaguesData.length);
    
    // Test players endpoint
    console.log('\n3. Testing players endpoint...');
    const playersResponse = await fetch(`${baseURL}/api/players`);
    const playersData = await playersResponse.json();
    console.log('✅ Players found:', playersData.length);
    
    // Test creating a new league
    console.log('\n4. Testing create league...');
    const createResponse = await fetch(`${baseURL}/api/leagues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test League',
        commissioner: 'Test Commissioner'
      })
    });
    const newLeague = await createResponse.json();
    console.log('✅ New league created:', newLeague.name);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI(); 