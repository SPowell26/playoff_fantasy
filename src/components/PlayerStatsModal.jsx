import React, { useState, useEffect } from 'react';

const PlayerStatsModal = ({ player, isOpen, onClose, week, year }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch player stats when modal opens
  useEffect(() => {
    if (isOpen && player) {
      fetchPlayerStats();
    }
  }, [isOpen, player, week, year]);

  const fetchPlayerStats = async () => {
    if (!player || !week || !year) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/stats/player/${player.id}?week=${week}&year=${year}`);
      if (response.ok) {
        const stats = await response.json();
        setPlayerStats(stats);
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{player.name}</h2>
              <p className="text-blue-100">{player.position} • {player.team}</p>
              <p className="text-blue-100">Week {week} • {year}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading stats...</p>
            </div>
          ) : playerStats ? (
            <div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg text-center">
                  Total Points: {playerStats.stats?.[0]?.fantasy_points?.toFixed(2) || '0.00'}
                </h3>
              </div>
              
              {/* Stats breakdown */}
              <div className="space-y-3">
                {playerStats.stats && playerStats.stats.length > 0 && (
                  <div>
                    {/* Offensive Stats */}
                    {(playerStats.stats[0].passing_yards > 0 || playerStats.stats[0].passing_touchdowns > 0 || playerStats.stats[0].interceptions > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Passing</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].passing_yards > 0 && (
                            <div className="flex justify-between">
                              <span>Passing Yards: {playerStats.stats[0].passing_yards}</span>
                              <span className="text-blue-600 font-medium">
                                {((playerStats.stats[0].passing_yards * 0.04)).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].passing_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span>Passing TDs: {playerStats.stats[0].passing_touchdowns}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].passing_touchdowns * 4).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].interceptions > 0 && (
                            <div className="flex justify-between">
                              <span>Interceptions: {playerStats.stats[0].interceptions}</span>
                              <span className="text-red-600 font-medium">
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
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Rushing</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].rushing_yards > 0 && (
                            <div className="flex justify-between">
                              <span>Rushing Yards: {playerStats.stats[0].rushing_yards}</span>
                              <span className="text-blue-600 font-medium">
                                {((playerStats.stats[0].rushing_yards * 0.1)).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].rushing_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span>Rushing TDs: {playerStats.stats[0].rushing_touchdowns}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].rushing_touchdowns * 6).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Receiving Stats */}
                    {(playerStats.stats[0].receiving_yards > 0 || playerStats.stats[0].receiving_touchdowns > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Receiving</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].receiving_yards > 0 && (
                            <div className="flex justify-between">
                              <span>Receiving Yards: {playerStats.stats[0].receiving_yards}</span>
                              <span className="text-blue-600 font-medium">
                                {((playerStats.stats[0].receiving_yards * 0.1)).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].receiving_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span>Receiving TDs: {playerStats.stats[0].receiving_touchdowns}</span>
                              <span className="text-green-600 font-medium">
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
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Kicking</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].field_goals_0_39 > 0 && (
                            <div className="flex justify-between">
                              <span>FG 0-39: {playerStats.stats[0].field_goals_0_39}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].field_goals_0_39 * 3).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].field_goals_40_49 > 0 && (
                            <div className="flex justify-between">
                              <span>FG 40-49: {playerStats.stats[0].field_goals_40_49}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].field_goals_40_49 * 4).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].field_goals_50_plus > 0 && (
                            <div className="flex justify-between">
                              <span>FG 50+: {playerStats.stats[0].field_goals_50_plus}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].field_goals_50_plus * 5).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].extra_points > 0 && (
                            <div className="flex justify-between">
                              <span>Extra Points: {playerStats.stats[0].extra_points}</span>
                              <span className="text-green-600 font-medium">
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
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Defense</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].sacks > 0 && (
                            <div className="flex justify-between">
                              <span>Sacks: {playerStats.stats[0].sacks}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].sacks * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].interceptions_defense > 0 && (
                            <div className="flex justify-between">
                              <span>Interceptions: {playerStats.stats[0].interceptions_defense}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].interceptions_defense * 2).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].fumble_recoveries > 0 && (
                            <div className="flex justify-between">
                              <span>Fumble Recoveries: {playerStats.stats[0].fumble_recoveries}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].fumble_recoveries * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].safeties > 0 && (
                            <div className="flex justify-between">
                              <span>Safeties: {playerStats.stats[0].safeties}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].safeties * 2).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].blocked_kicks > 0 && (
                            <div className="flex justify-between">
                              <span>Blocked Kicks: {playerStats.stats[0].blocked_kicks}</span>
                              <span className="text-green-600 font-medium">
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
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Special Teams</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].punt_return_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span>Punt Return TDs: {playerStats.stats[0].punt_return_touchdowns}</span>
                              <span className="text-green-600 font-medium">
                                {(playerStats.stats[0].punt_return_touchdowns * 6).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {playerStats.stats[0].kickoff_return_touchdowns > 0 && (
                            <div className="flex justify-between">
                              <span>Kickoff Return TDs: {playerStats.stats[0].kickoff_return_touchdowns}</span>
                              <span className="text-green-600 font-medium">
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
                        <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">Penalties</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Fumbles Lost: {playerStats.stats[0].fumbles_lost}</span>
                            <span className="text-red-600 font-medium">
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
            <div className="text-center py-8 text-gray-600">
              <p>No stats available for this player in Week {week}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;
