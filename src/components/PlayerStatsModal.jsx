import React, { useState, useEffect, useMemo } from 'react';
import { useYearly } from '../context/YearlyContext';
import { useData } from '../context/DataContext';
import { getWeekDisplayName } from '../utils/weekDisplay';

const PlayerStatsModal = ({ player, isOpen, onClose, week, year, seasonType: leagueSeasonType }) => {
  const [loading, setLoading] = useState(false);
  const { getPlayerWithRealStats } = useData();
  
  // Use provided week/year or fall back to context
  const { currentWeek: contextWeek, nflSeasonYear: contextYear, seasonDisplay, seasonType: globalSeasonType, isPlayoffs } = useYearly();
  // Use league's season_type if provided, otherwise fall back to global context
  const seasonType = leagueSeasonType || globalSeasonType || 'regular';
  const currentWeek = week || contextWeek;
  const nflSeasonYear = year || contextYear;
  
  // Get player stats using the same source as scoring
  const playerWithStats = useMemo(() => {
    if (!isOpen || !player || !currentWeek) return null;
    return getPlayerWithRealStats(player.id || player.player_id, currentWeek, seasonType);
  }, [isOpen, player, currentWeek, seasonType, getPlayerWithRealStats]);
  
  // Transform stats to match modal's expected format (snake_case for display)
  const playerStats = useMemo(() => {
    if (!playerWithStats || !playerWithStats.stats) return null;
    
    const stats = playerWithStats.stats;
    // Transform camelCase back to snake_case for display compatibility
    return {
      player_id: playerWithStats.id,
      player_name: playerWithStats.name,
      position: playerWithStats.position,
      team: playerWithStats.team,
      stats: [{
        passing_yards: stats.passingYards || 0,
        passing_touchdowns: stats.passingTD || 0,
        interceptions: stats.interceptions || 0,
        rushing_yards: stats.rushingYards || 0,
        rushing_touchdowns: stats.rushingTD || 0,
        receiving_yards: stats.receivingYards || 0,
        receiving_touchdowns: stats.receivingTD || 0,
        receptions: stats.receptions || 0,
        fumbles_lost: stats.fumbles || 0,
        field_goals_0_39: stats.fieldGoals0_39 || 0,
        field_goals_40_49: stats.fieldGoals40_49 || 0,
        field_goals_50_plus: stats.fieldGoals50_plus || 0,
        extra_points: stats.extraPointsMade || 0,
        field_goals_missed: stats.fieldGoalsMissed || 0,
        extra_points_missed: stats.extraPointsMissed || 0,
        sacks: stats.sacks || 0,
        interceptions_defense: stats.interceptions || 0,
        fumble_recoveries: stats.fumbleRecoveries || 0,
        safeties: stats.safeties || 0,
        blocked_kicks: stats.blockedKicks || 0,
        punt_return_touchdowns: stats.puntReturnTD || 0,
        kickoff_return_touchdowns: stats.kickoffReturnTD || 0,
        points_allowed: stats.pointsAllowed || 0,
        team_win: stats.teamWin || stats.team_win || false,
        teamWin: stats.teamWin || stats.team_win || false
      }]
    };
  }, [playerWithStats]);

  // Helper function to get points allowed score and range description
  const getPointsAllowedInfo = (pointsAllowed) => {
    const pointsAllowedRules = [10, 7, 4, 1, 0, -1, -4];
    const ranges = [
      { range: "0 pts", score: pointsAllowedRules[0] },
      { range: "1-6 pts", score: pointsAllowedRules[1] },
      { range: "7-13 pts", score: pointsAllowedRules[2] },
      { range: "14-20 pts", score: pointsAllowedRules[3] },
      { range: "21-27 pts", score: pointsAllowedRules[4] },
      { range: "28-34 pts", score: pointsAllowedRules[5] },
      { range: "35+ pts", score: pointsAllowedRules[6] }
    ];
    
    if (pointsAllowed === 0) return ranges[0];
    else if (pointsAllowed <= 6) return ranges[1];
    else if (pointsAllowed <= 13) return ranges[2];
    else if (pointsAllowed <= 20) return ranges[3];
    else if (pointsAllowed <= 27) return ranges[4];
    else if (pointsAllowed <= 34) return ranges[5];
    else return ranges[6];
  };

  // Calculate total fantasy points from individual stats (ALL stats count regardless of position)
  // But defensive stats (sacks, points_allowed, team_win) only count for D/ST players
  const calculateTotalPoints = (stats, playerPosition) => {
    if (!stats) return 0;
    
    const pos = playerPosition || player?.position || '';
    let total = 0;
    const passingYards = stats.passing_yards || 0;
    const rushingYards = stats.rushing_yards || 0;
    const receivingYards = stats.receiving_yards || 0;
    
    // Passing stats (all players get these if they have passing stats)
    total += passingYards * 0.04;
    total += (stats.passing_touchdowns || 0) * 4;
    total += (stats.interceptions || 0) * -2;
    // Bonus: 3 points for 300+ passing yards
    if (passingYards >= 300) total += 3;
    
    // Rushing stats (all players get these if they have rushing stats)
    total += rushingYards * 0.1;
    total += (stats.rushing_touchdowns || 0) * 6;
    // Bonus: 3 points for 100+ rushing yards
    if (rushingYards >= 100) total += 3;
    
    // Receiving stats (all players get these if they have receiving stats)
    total += (stats.receptions || 0) * 1; // PPR
    total += receivingYards * 0.1;
    total += (stats.receiving_touchdowns || 0) * 6;
    // Bonus: 3 points for 100+ receiving yards
    if (receivingYards >= 100) total += 3;
    
    // Fumbles lost penalty (all players)
    total += (stats.fumbles_lost || 0) * -2;
    
    // Kicking stats (all players get these if they have kicking stats)
    total += (stats.field_goals_0_39 || 0) * 3;
    total += (stats.field_goals_40_49 || 0) * 4;
    total += (stats.field_goals_50_plus || 0) * 5;
    total += (stats.extra_points || 0) * 1;
    // Penalties for missed kicks
    total += (stats.field_goals_missed || 0) * -1;
    total += (stats.extra_points_missed || 0) * -1;
    
    // Defense stats (ONLY for D/ST players - team-level stats)
    if (pos === 'D/ST' || pos === 'DEF') {
      total += (stats.sacks || 0) * 1;
      total += (stats.interceptions_defense || 0) * 2;
      total += (stats.fumble_recoveries || 0) * 1; // Fixed: 1 point, not 2
      total += (stats.safeties || 0) * 2;
      total += (stats.blocked_kicks || 0) * 2;
      total += (stats.punt_return_touchdowns || 0) * 6;
      total += (stats.kickoff_return_touchdowns || 0) * 6;
      // Points allowed (only for D/ST)
      if (stats.points_allowed !== undefined && stats.points_allowed !== null) {
        total += getPointsAllowedInfo(stats.points_allowed).score;
      }
      // Team win (6 points if team won) - only for D/ST
      const teamWin = stats.team_win === true || stats.teamWin === true || 
                      stats.team_win === 1 || stats.teamWin === 1 ||
                      Boolean(stats.team_win) || Boolean(stats.teamWin);
      if (teamWin) {
        total += 6;
      }
    }
    
    return total;
  };

  // Loading state when fetching stats
  useEffect(() => {
    if (isOpen && player && currentWeek) {
      setLoading(!playerWithStats);
    } else {
      setLoading(false);
    }
  }, [isOpen, player, currentWeek, playerWithStats]);

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
                {getWeekDisplayName(currentWeek, seasonType || 'regular')} • {seasonDisplay} Season • {seasonType || 'Unknown'}
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
                  Total Points: {calculateTotalPoints(playerStats.stats?.[0], player.position).toFixed(2)}
                </h3>
                {/* Debug: Show all raw stats */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2 text-xs text-gray-400">
                    <summary className="cursor-pointer">Debug: Raw Stats</summary>
                    <pre className="mt-2 bg-gray-800 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(playerStats.stats?.[0], null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              
              {/* Stats breakdown */}
              <div className="space-y-3">
                {playerStats.stats && playerStats.stats.length > 0 && (
                  <div>
                    {/* Passing Stats - Show if any passing stats exist */}
                    {((playerStats.stats[0].passing_yards || 0) > 0 || (playerStats.stats[0].passing_touchdowns || 0) > 0 || (playerStats.stats[0].interceptions || 0) > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Passing</h4>
                        <div className="space-y-1 text-sm">
                          {playerStats.stats[0].passing_yards > 0 && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Passing Yards: {playerStats.stats[0].passing_yards}</span>
                                <span className="text-blue-400 font-medium">
                                  {((playerStats.stats[0].passing_yards * 0.04)).toFixed(2)} pts
                                </span>
                              </div>
                              {playerStats.stats[0].passing_yards >= 300 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">300+ Yard Bonus</span>
                                  <span className="text-yellow-400 font-medium">+3.00 pts</span>
                                </div>
                              )}
                            </>
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
                          {(playerStats.stats[0].rushing_yards || 0) > 0 && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Rushing Yards: {playerStats.stats[0].rushing_yards}</span>
                                <span className="text-blue-400 font-medium">
                                  {((playerStats.stats[0].rushing_yards * 0.1)).toFixed(2)} pts
                                </span>
                              </div>
                              {playerStats.stats[0].rushing_yards >= 100 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">100+ Yard Bonus</span>
                                  <span className="text-yellow-400 font-medium">+3.00 pts</span>
                                </div>
                              )}
                            </>
                          )}
                          {(playerStats.stats[0].rushing_touchdowns || 0) > 0 && (
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

                    {/* Receiving Stats - Show if any receiving stats exist */}
                    {((playerStats.stats[0].receiving_yards || 0) > 0 || (playerStats.stats[0].receiving_touchdowns || 0) > 0 || (playerStats.stats[0].receptions || 0) > 0) && (
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
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-300">Receiving Yards: {playerStats.stats[0].receiving_yards}</span>
                                <span className="text-blue-400 font-medium">
                                  {((playerStats.stats[0].receiving_yards * 0.1)).toFixed(2)} pts
                                </span>
                              </div>
                              {playerStats.stats[0].receiving_yards >= 100 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">100+ Yard Bonus</span>
                                  <span className="text-yellow-400 font-medium">+3.00 pts</span>
                                </div>
                              )}
                            </>
                          )}
                          {(playerStats.stats[0].receiving_touchdowns || 0) > 0 && (
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

                    {/* Kicker Stats - Show all kicking stats regardless of value */}
                    {((playerStats.stats[0].field_goals_0_39 || 0) > 0 || (playerStats.stats[0].field_goals_40_49 || 0) > 0 || (playerStats.stats[0].field_goals_50_plus || 0) > 0 || (playerStats.stats[0].extra_points || 0) > 0 || (playerStats.stats[0].field_goals_missed || 0) > 0 || (playerStats.stats[0].extra_points_missed || 0) > 0) && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Kicking</h4>
                        <div className="space-y-1 text-sm">
                          {(playerStats.stats[0].field_goals_0_39 || 0) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">FG 0-39: {playerStats.stats[0].field_goals_0_39}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].field_goals_0_39 * 3).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {(playerStats.stats[0].field_goals_40_49 || 0) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">FG 40-49: {playerStats.stats[0].field_goals_40_49}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].field_goals_40_49 * 4).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {(playerStats.stats[0].field_goals_50_plus || 0) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">FG 50+: {playerStats.stats[0].field_goals_50_plus}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].field_goals_50_plus * 5).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {(playerStats.stats[0].extra_points || 0) > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Extra Points: {playerStats.stats[0].extra_points}</span>
                              <span className="text-green-400 font-medium">
                                {(playerStats.stats[0].extra_points * 1).toFixed(2)} pts
                              </span>
                            </div>
                          )}
                          {((playerStats.stats[0].field_goals_missed || 0) > 0 || (playerStats.stats[0].extra_points_missed || 0) > 0) && (
                            <>
                              {(playerStats.stats[0].field_goals_missed || 0) > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Missed Field Goals: {playerStats.stats[0].field_goals_missed}</span>
                                  <span className="text-red-400 font-medium">
                                    {((playerStats.stats[0].field_goals_missed || 0) * -1).toFixed(2)} pts
                                  </span>
                                </div>
                              )}
                              {(playerStats.stats[0].extra_points_missed || 0) > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Missed Extra Points: {playerStats.stats[0].extra_points_missed}</span>
                                  <span className="text-red-400 font-medium">
                                    {((playerStats.stats[0].extra_points_missed || 0) * -1).toFixed(2)} pts
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Defensive Stats - Only for D/ST players - only show if position matches */}
                    {(player.position === 'D/ST' || player.position === 'DEF') && 
                     ((playerStats.stats[0].sacks || 0) > 0 || 
                      (playerStats.stats[0].interceptions_defense || 0) > 0 || 
                      (playerStats.stats[0].fumble_recoveries || 0) > 0 || 
                      (playerStats.stats[0].safeties || 0) > 0 || 
                      (playerStats.stats[0].blocked_kicks || 0) > 0 || 
                      (playerStats.stats[0].punt_return_touchdowns || 0) > 0 || 
                      (playerStats.stats[0].kickoff_return_touchdowns || 0) > 0 || 
                      (playerStats.stats[0].points_allowed !== undefined && playerStats.stats[0].points_allowed !== null) || 
                      playerStats.stats[0].team_win === true || 
                      playerStats.stats[0].teamWin === true) && (
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
                          {playerStats.stats[0].points_allowed !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">
                                Points Allowed: {playerStats.stats[0].points_allowed} ({getPointsAllowedInfo(playerStats.stats[0].points_allowed).range})
                              </span>
                              <span className={`font-medium ${getPointsAllowedInfo(playerStats.stats[0].points_allowed).score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {getPointsAllowedInfo(playerStats.stats[0].points_allowed).score} pts
                              </span>
                            </div>
                          )}
                          {(playerStats.stats[0].team_win === true || playerStats.stats[0].teamWin === true) && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Team Win</span>
                              <span className="text-green-400 font-medium">+6.00 pts</span>
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
