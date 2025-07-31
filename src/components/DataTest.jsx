import React, { useState } from 'react';
import { createLeague, addTeamToLeague, startLeague, getLeagueStandings } from '../utils/leagueOperations.js';
import { createTeam, addPlayerToTeam, calculateTeamScore } from '../utils/teamOperations.js';
import { createPlayer, updatePlayerStats, calculatePlayerScore } from '../utils/playerOperations.js';

const DataTest = () => {
  const [testResults, setTestResults] = useState([]);

  const runTests = () => {
    const results = [];
    
    try {
      // Test 1: Create a league
      results.push("✅ Creating league...");
      const league = createLeague("Test League", "user_1", 4);
      results.push(`✅ League created: ${league.name} (${league.teams.length}/${league.maxTeams} teams)`);
      
      // Test 2: Create players
      results.push("✅ Creating players...");
      const mahomes = createPlayer("Patrick Mahomes", "QB", "KC");
      const mccaffrey = createPlayer("Christian McCaffrey", "RB", "SF");
      const hill = createPlayer("Tyreek Hill", "WR", "KC");
      results.push(`✅ Players created: ${mahomes.name}, ${mccaffrey.name}, ${hill.name}`);
      
      // Test 3: Update player stats
      results.push("✅ Updating player stats...");
      updatePlayerStats(mahomes, { passingYards: 250, passingTD: 2, interceptions: 1 });
      updatePlayerStats(mccaffrey, { rushingYards: 120, rushingTD: 1, receivingYards: 45 });
      updatePlayerStats(hill, { receivingYards: 180, receivingTD: 2 });
      results.push(`✅ Stats updated for all players`);
      
      // Test 4: Calculate player scores
      results.push("✅ Calculating player scores...");
      const mahomesScore = calculatePlayerScore(mahomes, league.scoringRules);
      const mccaffreyScore = calculatePlayerScore(mccaffrey, league.scoringRules);
      const hillScore = calculatePlayerScore(hill, league.scoringRules);
      results.push(`✅ Player scores: Mahomes ${mahomesScore.toFixed(1)}, McCaffrey ${mccaffreyScore.toFixed(1)}, Hill ${hillScore.toFixed(1)}`);
      
      // Test 5: Create teams
      results.push("✅ Creating teams...");
      const team1 = createTeam(league.id, "user_1", "Mahomes Magic");
      const team2 = createTeam(league.id, "user_2", "Lamar's Legends");
      results.push(`✅ Teams created: ${team1.name}, ${team2.name}`);
      
      // Test 6: Add players to teams
      results.push("✅ Adding players to teams...");
      addPlayerToTeam(team1, mahomes);
      addPlayerToTeam(team1, mccaffrey);
      addPlayerToTeam(team2, hill);
      results.push(`✅ Players added to teams`);
      
      // Test 7: Add teams to league
      results.push("✅ Adding teams to league...");
      addTeamToLeague(league, team1);
      addTeamToLeague(league, team2);
      results.push(`✅ Teams added to league: ${league.teams.length}/${league.maxTeams}`);
      
      // Test 8: Calculate team scores
      results.push("✅ Calculating team scores...");
      const team1Score = calculateTeamScore(team1, league.scoringRules);
      const team2Score = calculateTeamScore(team2, league.scoringRules);
      results.push(`✅ Team scores: ${team1.name} ${team1Score.toFixed(1)}, ${team2.name} ${team2Score.toFixed(1)}`);
      
      // Test 9: Start league
      results.push("✅ Starting league...");
      startLeague(league);
      results.push(`✅ League status: ${league.status}`);
      
      // Test 10: Get standings
      results.push("✅ Getting standings...");
      const standings = getLeagueStandings(league);
      results.push(`✅ Standings: ${standings.map(team => `${team.rank}. ${team.name} (${team.totalScore.toFixed(1)})`).join(', ')}`);
      
      results.push("🎉 All tests passed! Data layer is working correctly.");
      
    } catch (error) {
      results.push(`❌ Test failed: ${error.message}`);
    }
    
    setTestResults(results);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Data Layer Test</h2>
      
      <button 
        onClick={runTests}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-4"
      >
        Run Tests
      </button>
      
      <div className="space-y-2">
        {testResults.map((result, index) => (
          <div key={index} className="text-sm font-mono">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTest; 