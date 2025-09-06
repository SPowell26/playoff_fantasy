import React, { useState, useEffect } from 'react';
import { useYearly } from '../context/YearlyContext';

const PlayerStatsModal = ({ player, isOpen, onClose }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get current week/season from context instead of props
  const { currentWeek, nflSeasonYear, seasonDisplay, seasonType, isPlayoffs } = useYearly();

  // Calculate total fantasy points from individual stats
  const calculateTotalPoints = (stats) => {
    if (!stats) return 0;
    
    let total = 0;
    
    // Passing stats
    total += (stats.passing_yards || 0) * 0.04;
    total += (stats.passing_touchdowns || 0) * 4;
    total += (stats.interceptions || 0) * -2;
    
    // Rushing stats
    total += (stats.rushing_yards || 0) * 0.1;
    total += (stats.rushing_touchdowns || 0) * 6;
    
    // Receiving stats
    total += (stats.receptions || 0) * 1;
    total += (stats.receiving_yards || 0) * 0.1;
    total += (stats.receiving_touchdowns || 0) * 6;
    
    // Kicking stats
    total += (stats.field_goals_0_39 || 0) * 3;
    total += (stats.field_goals_40_49 || 0) * 4;
    total += (stats.field_goals_50_plus || 0) * 5;
    total += (stats.extra_points || 0) * 1;
    
    // Defense stats
    total += (stats.sacks || 0) * 1;
    total += (stats.interceptions_defense || 0) * 2;
    total += (stats.fumble_recoveries || 0) * 1;
    total += (stats.safeties || 0) * 2;
    total += (stats.blocked_kicks || 0) * 2;
    
    // Special teams
    total += (stats.punt_return_touchdowns || 0) * 6;
    total += (stats.kickoff_return_touchdowns || 0) * 6;
    
    // Penalties
    total += (stats.fumbles_lost || 0) * -2;
    
    return total;
  };

  // Fetch player stats when modal opens
  useEffect(() => {
    if (isOpen && player && currentWeek && nflSeasonYear) {
      fetchPlayerStats();
    }
  }, [isOpen, player, currentWeek, nflSeasonYear]);

  const fetchPlayerStats = async () => {
    if (!player || !currentWeek || !nflSeasonYear) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/stats/player/${player.id}?week=${currentWeek}&year=${nflSeasonYear}`);
      if (response.ok) {
        const stats = await response.json();
        setPlayerStats(stats);
      } else {
        console.error('Failed to fetch player stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{player.name}</h2>
              <p className="text-blue-100">{player.position} • {player.team}</p>
              <p className="text-blue-100">
                Week {currentWeek} • {seasonDisplay} Season • {seasonType || 'Unknown'}
                {isPlayoffs && <span className="ml-2 text-yellow-300">🏆 Playoffs</span>}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {!currentWeek || !nflSeasonYear ? (
            <div className="text-center py-8 text-gray-400">
              <p>Week information not available</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2 text-gray-300">Loading stats...</p>
            </div>
          ) : playerStats ? (
            <div>
              <div className="mb-4 p-3 bg-gray-700 border border-gray-600 rounded-lg">
                <h3 className="font-semibold text-lg text-center text-white">
                  Total Points: {calculateTotalPoints(playerStats.stats?.[0]).toFixed(2)}
                </h3>
              </div>
              
              {/* Stats breakdown */}
              <div className="space-y-3">
                {playerStats.stats && playerStats.stats.length > 0 && (
                  <div>
                    {/* Offensive Stats */}
                    {(playerStats.stats[0].passing_yards > 0 || playerStats.stats[0].passing_touchdowns > 0 || playerStats.stats[0].interceptions > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Passing</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].passing_yards > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Passing Yards: {playerStats.stats[0].passing_yards}</span>
                              <span className="text-blue-400 font-medium">
                                {((playerStats.stats[0].passing_yards * 0.04)).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].passing_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Passing TDs: {playerStats.stats[0].passing_touchdowns}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].passing_touchdowns * 4).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].interceptions > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Interceptions: {playerStats.stats[0].interceptions}</span>
                              <span className="text-red-400 font-medium">
                                {(playerStats.stats[0].interceptions * -2).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rushing Stats */}
                    {(playerStats.stats[0].rushing_yards > 0 || playerStats.stats[0].rushing_touchdowns > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Rushing</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].rushing_yards > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Rushing Yards: {playerStats.stats[0].rushing_yards}</span>
                              <span className="text-blue-400 font-medium">
                                {((playerStats.stats[0].rushing_yards * 0.1)).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].rushing_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Rushing TDs: {playerStats.stats[0].rushing_touchdowns}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].rushing_touchdowns * 6).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Receiving Stats */}
                    {(playerStats.stats[0].receiving_yards > 0 || playerStats.stats[0].receiving_touchdowns > 0 || playerStats.stats[0].receptions > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Receiving</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].receptions > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Receptions: {playerStats.stats[0].receptions}</span>
                              <span className="text-blue-400 font-medium">
                                {(playerStats.stats[0].receptions * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].receiving_yards > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Receiving Yards: {playerStats.stats[0].receiving_yards}</span>
                              <span className="text-blue-400 font-medium">
                                {((playerStats.stats[0].receiving_yards * 0.1)).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].receiving_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Receiving TDs: {playerStats.stats[0].receiving_touchdowns}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].receiving_touchdowns * 6).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Kicker Stats */}
                    {(playerStats.stats[0].field_goals_0_39 > 0 || playerStats.stats[0].field_goals_40_49 > 0 || playerStats.stats[0].field_goals_50_plus > 0 || playerStats.stats[0].extra_points > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Kicking</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].field_goals_0_39 > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">FG 0-39: {playerStats.stats[0].field_goals_0_39}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].field_goals_0_39 * 3).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].field_goals_40_49 > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">FG 40-49: {playerStats.stats[0].field_goals_40_49}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].field_goals_40_49 * 4).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].field_goals_50_plus > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">FG 50+: {playerStats.stats[0].field_goals_50_plus}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].field_goals_50_plus * 5).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].extra_points > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Extra Points: {playerStats.stats[0].extra_points}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].extra_points * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Defensive Stats */}
                    {(playerStats.stats[0].sacks > 0 || playerStats.stats[0].interceptions_defense > 0 || playerStats.stats[0].fumble_recoveries > 0 || playerStats.stats[0].safeties > 0 || playerStats.stats[0].blocked_kicks > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Defense</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].sacks > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Sacks: {playerStats.stats[0].sacks}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].sacks * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].interceptions_defense > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Interceptions: {playerStats.stats[0].interceptions_defense}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].interceptions_defense * 2).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].fumble_recoveries > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Fumble Recoveries: {playerStats.stats[0].fumble_recoveries}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].fumble_recoveries * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].safeties > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Safeties: {playerStats.stats[0].safeties}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].safeties * 2).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].blocked_kicks > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Blocked Kicks: {playerStats.stats[0].blocked_kicks}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].blocked_kicks * 2).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Teams */}
                    {(playerStats.stats[0].punt_return_touchdowns > 0 || playerStats.stats[0].kickoff_return_touchdowns > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Special Teams</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].punt_return_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Punt Return TDs: {playerStats.stats[0].punt_return_touchdowns}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].punt_return_touchdowns * 6).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].kickoff_return_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Kickoff Return TDs: {playerStats.stats[0].kickoff_return_touchdowns}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].kickoff_return_touchdowns * 6).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Penalties */}
                    {playerStats.stats[0].fumbles_lost > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Penalties</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Fumbles Lost: {playerStats.stats[0].fumbles_lost}</span>
                            <span className="text-red-400 font-medium">
                              {(playerStats.stats[0].fumbles_lost * -2).toFixed(2)} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No stats available for {player.name} in Week {currentWeek}</p>
              <p className="text-sm mt-2">Stats may not have been imported yet for this week.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;
