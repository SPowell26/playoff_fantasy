import React, { useState } from 'react';
import { nflfastrWeeklyMockData } from '../data/nflfastr_weekly_mock';
import { calculatePlayerWeeklyScore, calculateTeamWeeklyScore } from '../utils/calculations';

const WeeklyDataTest = () => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState('KC_Mahomes');

  const player = nflfastrWeeklyMockData.players.find(p => p.id === selectedPlayer);
  const weeklyStats = player?.weeklyStats?.[selectedWeek] || {};
  const weeklyScore = calculatePlayerWeeklyScore(player, nflfastrWeeklyMockData.scoringRules, selectedWeek);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Weekly Data Test</h2>
      
      {/* Week Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Week:</label>
        <select 
          value={selectedWeek} 
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="border rounded px-3 py-2"
        >
          <option value={1}>Week 1 - Wild Card</option>
          <option value={2}>Week 2 - Divisional</option>
          <option value={3}>Week 3 - Conference</option>
          <option value={4}>Week 4 - Super Bowl</option>
        </select>
      </div>

      {/* Player Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Player:</label>
        <select 
          value={selectedPlayer} 
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          {nflfastrWeeklyMockData.players.map(player => (
            <option key={player.id} value={player.id}>
              {player.name} ({player.position}) - {player.nflTeam}
            </option>
          ))}
        </select>
      </div>

      {/* Player Info */}
      {player && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            {player.name} - Week {selectedWeek}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Weekly Stats:</h4>
              <div className="text-sm space-y-1">
                {Object.entries(weeklyStats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between">
                    <span className="capitalize">{stat}:</span>
                    <span className="font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Weekly Score:</h4>
              <div className="text-2xl font-bold text-green-600">
                {weeklyScore.toFixed(2)} pts
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Team Score */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Sample Team Weekly Score</h3>
        <p className="text-sm text-gray-600 mb-2">
          Using a sample team with Patrick Mahomes, Christian McCaffrey, and KC Defense:
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="space-y-2">
            {['KC_Mahomes', 'SF_McCaffrey', 'KC_DEF'].map(playerId => {
              const p = nflfastrWeeklyMockData.players.find(pl => pl.id === playerId);
              const score = calculatePlayerWeeklyScore(p, nflfastrWeeklyMockData.scoringRules, selectedWeek);
              return (
                <div key={playerId} className="flex justify-between text-sm">
                  <span>{p.name} ({p.position})</span>
                  <span className="font-mono">{score.toFixed(2)} pts</span>
                </div>
              );
            })}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Team Total (Week {selectedWeek}):</span>
              <span className="font-mono">
                {['KC_Mahomes', 'SF_McCaffrey', 'KC_DEF']
                  .map(playerId => {
                    const p = nflfastrWeeklyMockData.players.find(pl => pl.id === playerId);
                    return calculatePlayerWeeklyScore(p, nflfastrWeeklyMockData.scoringRules, selectedWeek);
                  })
                  .reduce((sum, score) => sum + score, 0)
                  .toFixed(2)} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyDataTest; 