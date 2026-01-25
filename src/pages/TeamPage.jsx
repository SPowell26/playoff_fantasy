import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useYearly } from '../context/YearlyContext';
import { useAuth } from '../context/AuthContext';
import { calculateTeamScore, calculatePlayerScore, calculateStartingLineupScore} from '../utils/calculations';
import { calculateTeamScoreWithStats } from '../utils/teamScoreUtils';
import PlayerSelectionForm from '../components/PlayerSelectionForm';
import PlayerStatsModal from '../components/PlayerStatsModal';
import { getWeekDisplayName } from '../utils/weekDisplay';
import { API_URL } from '../config/api';

const TeamPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { isCommissionerForLeague } = useAuth();
    const [team, setTeam] = useState(null);
    const [league, setLeague] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCommissioner, setIsCommissioner] = useState(false);
    const [showTotal, setShowTotal] = useState(true);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editStats, setEditStats] = useState({});
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
    const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);
    const { fetchRealStats, getPlayerWithRealStats } = useData();
    const { nflSeasonYear, seasonDisplay, seasonType: globalSeasonType } = useYearly();
    // Use league's season_type if available, otherwise fall back to global context
    const seasonType = league?.season_type || globalSeasonType || 'regular';
    const [teamSeasonStats, setTeamSeasonStats] = useState(null);
    const [teamRank, setTeamRank] = useState(null);

    // Fetch team and league data on component mount
    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    // Fetch team roster after team data is loaded (only once)
    useEffect(() => {
        if (team && team.id && !team.players) {
            fetchTeamRoster();
        }
    }, [team?.id]); // Only depend on team ID, not the entire team object

    // Fetch available weeks when component mounts or league changes
    useEffect(() => {
        if (league?.season_type && nflSeasonYear) {
            fetchAvailableWeeks();
        }
    }, [league?.season_type, league?.id, nflSeasonYear]);

    // Fetch stats when week, year, or league season_type changes
    // Don't fetch until league data is loaded to ensure we use the correct season_type
    useEffect(() => {
        if (currentWeek && nflSeasonYear && league?.season_type) {
            console.log(`🔄 Fetching stats for week ${currentWeek}, year ${nflSeasonYear}, season_type: ${league.season_type}`);
            fetchRealStats(currentWeek, nflSeasonYear, league.season_type);
        }
    }, [currentWeek, nflSeasonYear, league?.season_type]);

    // Fetch season totals from backend (for rankings and consistency check)
    const fetchTeamSeasonStats = useCallback(async () => {
        if (!league?.id || !nflSeasonYear || !team?.id) return;
        
        try {
            const seasonTypeParam = seasonType;
            const response = await fetch(
                `${API_URL}/api/stats/season-totals/${league.id}?year=${nflSeasonYear}&seasonType=${seasonTypeParam}`
            );
            
            if (response.ok) {
                const data = await response.json();
                const teamStats = data.seasonTotals?.find(st => st.team_id === team.id);
                
                if (teamStats) {
                    setTeamSeasonStats(teamStats);
                    
                    // Calculate rank - season totals are already sorted by total DESC
                    const rank = data.seasonTotals.findIndex(st => st.team_id === team.id) + 1;
                    setTeamRank(rank || null);
                    
                    // Log for debugging - compare backend vs frontend calculation
                    console.log('📊 Backend season totals:', teamStats);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching team season stats:', error);
        }
    }, [league?.id, nflSeasonYear, team?.id, seasonType]);

    useEffect(() => {
        fetchTeamSeasonStats();
    }, [fetchTeamSeasonStats]);
    
    // Also calculate client-side for comparison/verification
    const clientSideSeasonTotals = useMemo(() => {
        if (!team || !availableWeeks.length || !league) return null;
        
        const weeklyScores = [];
        let seasonTotal = 0;
        
        // Calculate score for each available week using the same logic as current week
        for (const week of availableWeeks) {
            const weekTeamWithStats = {
                ...team,
                players: (team.players || []).map(player => {
                    const playerWithStats = getPlayerWithRealStats(player.player_id, week, seasonType);
                    return playerWithStats || { ...player, stats: {} };
                })
            };
            
            const weekScoreData = calculateTeamScoreWithStats(weekTeamWithStats, league, getPlayerWithRealStats, week, seasonType);
            const weekScore = weekScoreData.weeklyScore || 0;
            
            if (weekScore > 0) {
                weeklyScores.push({ week, score: weekScore });
                seasonTotal += weekScore;
            }
        }
        
        return {
            season_total: Math.round(seasonTotal * 100) / 100,
            weeks_played: weeklyScores.length,
            weekly_breakdown: weeklyScores
        };
    }, [team, availableWeeks, league, seasonType, getPlayerWithRealStats]);
    
    // Log comparison for debugging
    useEffect(() => {
        if (teamSeasonStats && clientSideSeasonTotals) {
            console.log('🔍 Season Totals Comparison:');
            console.log('  Backend:', teamSeasonStats.season_total);
            console.log('  Client-side:', clientSideSeasonTotals.season_total);
            console.log('  Difference:', Math.abs((teamSeasonStats.season_total || 0) - (clientSideSeasonTotals.season_total || 0)).toFixed(2));
        }
    }, [teamSeasonStats, clientSideSeasonTotals]);
    
    // Fetch stats for all weeks when component loads
    useEffect(() => {
        if (team && availableWeeks.length && league?.season_type) {
            Promise.all(
                availableWeeks.map(week => fetchRealStats(week, nflSeasonYear, seasonType))
            ).catch(error => {
                console.error('❌ Error fetching stats for all weeks:', error);
            });
        }
    }, [team, availableWeeks, league?.season_type, nflSeasonYear, seasonType, fetchRealStats]);

    const fetchAvailableWeeks = async () => {
        try {
            // Generate all possible weeks based on league's season_type, not from database
            const seasonTypeParam = league?.season_type || 'regular';
            
            let maxWeek = 18; // Default to regular season
            if (seasonTypeParam === 'postseason') {
                maxWeek = 4;
            }
            
            // Generate weeks array for current year
            const weeks = [];
            for (let week = 1; week <= maxWeek; week++) {
                weeks.push({
                    week: week,
                    year: nflSeasonYear,
                    season_type: seasonTypeParam
                });
            }
            
            setAvailableWeeks(weeks);
            
            // Set default week to 1 if not already set
            if (!currentWeek || currentWeek > maxWeek) {
                setCurrentWeek(1);
            }
        } catch (error) {
            console.error('Failed to generate available weeks:', error);
        }
    };

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching team data for team ID:', teamId);
            
            // Fetch team data (which now includes league info)
            const response = await fetch(`${API_URL}/api/leagues/teams/${teamId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const teamData = await response.json();
            console.log('✅ Fetched team data:', teamData);
            
            // The backend now returns team with league info
            setTeam(teamData);
            setLeague(teamData.league);

            // Check commissioner status for this league
            if (teamData.league?.id) {
                setIsCommissioner(isCommissionerForLeague(teamData.league.id));
            }
            
        } catch (error) {
            console.error('❌ Failed to fetch team data:', error);
            // Could redirect to league page or show error
        } finally {
            setLoading(false);
        }
    };

    const fetchTeamRoster = async () => {
        try {
            console.log('🔄 Fetching team roster for team ID:', teamId);
            
            // Fetch team roster using the new flat RESTful endpoint
            const response = await fetch(`${API_URL}/api/teams/${teamId}/players`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rosterData = await response.json();
            console.log('✅ Fetched team roster:', rosterData);
            
            // Update team with the roster data
            setTeam(prevTeam => ({
                ...prevTeam,
                players: rosterData
            }));
            
        } catch (error) {
            console.error('❌ Failed to fetch team roster:', error);
        }
    };


    if (loading) {
        return <div className="mb-4">Loading team data...</div>;
    }

    if (!team || !league) {
        return <div className="mb-4">Team not found</div>;
    }

    const handleAddPlayer = async (selectedPlayer) => {
        try {
            console.log('✅ Player added successfully:', selectedPlayer);
            setShowPlayerSelection(false);
            
            // Refresh team data to show the newly added player
            await fetchTeamData();
            
            // Also fetch the updated roster
            await fetchTeamRoster();
            
        } catch (error) {
            console.error('❌ Error handling player addition:', error);
        }
    };

    const handlePlayerClick = (player) => {
        setSelectedPlayerForStats(player);
        setShowPlayerStatsModal(true);
    };

    const handleRemovePlayer = async (playerId) => {
        try {
            console.log('🔄 Attempting to remove player:', playerId, 'from team:', teamId);
            
            const response = await fetch(`${API_URL}/api/teams/${teamId}/players/${playerId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                console.log('✅ Player removed successfully');
                // Refresh the team roster to show the updated list
                await fetchTeamRoster();
            } else {
                const errorData = await response.json();
                console.error('❌ Delete failed:', errorData);
            }
        } catch (error) {
            console.error('❌ Failed to remove player:', error);
        }
    };

    // Helper function to format position display
    const formatPosition = (position) => {
        // Convert PK to K for display
        if (position === 'PK') return 'K';
        return position;
    };

    // Extract offensive scoring rules from nested structure
    let scoringRules = league.scoring_rules || {};
    if (scoringRules.offensive) {
        scoringRules = scoringRules.offensive;
    }
    
    // Flatten nested structure and extract PPR
    if (scoringRules.passing) {
        scoringRules = {
            passingYards: scoringRules.passing.yardsPerPoint || 0.04,
            passingTD: scoringRules.passing.touchdownPoints || 4,
            interceptions: scoringRules.passing.interceptionPoints || -2,
            rushingYards: scoringRules.rushing?.yardsPerPoint || 0.1,
            rushingTD: scoringRules.rushing?.touchdownPoints || 6,
            receivingYards: scoringRules.receiving?.yardsPerPoint || 0.1,
            receivingTD: scoringRules.receiving?.touchdownPoints || 6,
            PPR: scoringRules.receptionPoints || 1,  // Points per reception
            receptionPoints: scoringRules.receptionPoints || 1,  // Also include for compatibility
            fumbles: scoringRules.fumbles?.lostPoints || -2
        };
    }
    
    // Fallback to default rules if not found
    if (!scoringRules.passingYards) {
        scoringRules = {
            passingYards: 0.04,
            passingTD: 4,
            interceptions: -2,
            rushingYards: 0.1,
            rushingTD: 6,
            receivingYards: 0.1,
            receivingTD: 6,
            PPR: 1,
            receptionPoints: 1,
            fumbles: -2
        };
    }
    
    // Add D/ST scoring rules to ensure consistent scoring
    // IMPORTANT: Preserve offensive interceptions rule (-2) - don't overwrite with defensive rule (+2)
    scoringRules = {
        ...scoringRules,
        sacks: 1,
        // Keep offensive interceptions as -2 (for QBs throwing INTs)
        interceptions: scoringRules.interceptions || -2, // Preserve offensive interceptions rule
        // D/ST interceptions (made) = +2 points each (separate from offensive interceptions thrown)
        defensiveInterceptions: 2,
        fumbleRecoveries: 1, // Fixed: 1 point, not 2
        safeties: 2,
        blockedKicks: 2,
        puntReturnTD: 6,
        kickoffReturnTD: 6,
        teamWinPoints: 6, // 6 points for team win
        pointsAllowed: [10, 7, 4, 1, 0, -1, -4] // Correct ranges: 0, 1-6, 7-13, 14-20, 21-27, 28-34, 35+
    };
    
    console.log('🔍 Final scoring rules:', scoringRules);
    
    // Use real stats for scoring calculations
    const teamWithRealStats = {
        ...team,
        players: (team.players || []).map(player => {
            console.log('🔍 Processing player:', player.player_id, player.name, 'from team roster');
            const playerWithStats = getPlayerWithRealStats(player.player_id, currentWeek, seasonType);
            if (playerWithStats) {
                console.log('🔍 Player with stats:', playerWithStats.id, playerWithStats.name, 'Stats:', playerWithStats.stats);
                
                // Enhanced D/ST debug logging
                if (playerWithStats.position === 'D/ST' || playerWithStats.position === 'DEF') {
                    console.log('🏈 D/ST CALCULATION DEBUG:');
                    console.log('   Player:', playerWithStats.name, 'Position:', playerWithStats.position);
                    console.log('   Player stats:', playerWithStats.stats);
                    console.log('   Stats keys:', Object.keys(playerWithStats.stats || {}));
                    
                    // D/ST scoring rules (matching backend)
                    const dstScoringRules = {
                        sacks: 1,
                        interceptions: 2,
                        fumbleRecoveries: 1, // Fixed: should be 1 point, not 2
                        defensiveTDs: 6,
                        safeties: 2,
                        blockedKicks: 2,
                        puntReturnTDs: 6,
                        kickoffReturnTDs: 6
                    };
                    
                    // Points allowed scoring (correct ranges)
                    const getPointsAllowedScore = (pointsAllowed) => {
                        if (pointsAllowed === 0) return 10;
                        else if (pointsAllowed <= 6) return 7;
                        else if (pointsAllowed <= 13) return 4;
                        else if (pointsAllowed <= 20) return 1;
                        else if (pointsAllowed <= 27) return 0;
                        else if (pointsAllowed <= 34) return -1;
                        else return -4;
                    };
                    
                    // Get stat values - check both possible field names
                    const sacks = playerWithStats.stats?.sacks || 0;
                    const interceptions = playerWithStats.stats?.interceptions || 0;
                    const fumbleRecoveries = playerWithStats.stats?.fumbleRecoveries || 0;
                    const defensiveTDs = playerWithStats.stats?.defensiveTDs || 0;
                    const safeties = playerWithStats.stats?.safeties || 0;
                    const blockedKicks = playerWithStats.stats?.blockedKicks || 0;
                    const puntReturnTDs = playerWithStats.stats?.puntReturnTD || 0;
                    const kickoffReturnTDs = playerWithStats.stats?.kickoffReturnTD || 0;
                    const pointsAllowed = playerWithStats.stats?.pointsAllowed || 0;
                    const teamWin = playerWithStats.stats?.teamWin || playerWithStats.stats?.team_win || false;
                    
                    // Debug: Show all D/ST related stats
                    console.log('   Raw D/ST stats from API:');
                    console.log('     sacks:', playerWithStats.stats?.sacks);
                    console.log('     interceptions:', playerWithStats.stats?.interceptions);
                    console.log('     fumbleRecoveries:', playerWithStats.stats?.fumbleRecoveries);
                    console.log('     safeties:', playerWithStats.stats?.safeties);
                    console.log('     blockedKicks:', playerWithStats.stats?.blockedKicks);
                    console.log('     puntReturnTDs:', playerWithStats.stats?.puntReturnTD);
                    console.log('     kickoffReturnTDs:', playerWithStats.stats?.kickoffReturnTD);
                    console.log('     pointsAllowed:', playerWithStats.stats?.pointsAllowed);
                    console.log('     teamWin:', teamWin);
                    
                    // Log individual calculations
                    console.log(`   sacks: ${sacks} × ${dstScoringRules.sacks} = ${sacks * dstScoringRules.sacks}`);
                    console.log(`   interceptions: ${interceptions} × ${dstScoringRules.interceptions} = ${interceptions * dstScoringRules.interceptions}`);
                    console.log(`   fumbleRecoveries: ${fumbleRecoveries} × ${dstScoringRules.fumbleRecoveries} = ${fumbleRecoveries * dstScoringRules.fumbleRecoveries}`);
                    console.log(`   defensiveTDs: ${defensiveTDs} × ${dstScoringRules.defensiveTDs} = ${defensiveTDs * dstScoringRules.defensiveTDs}`);
                    console.log(`   safeties: ${safeties} × ${dstScoringRules.safeties} = ${safeties * dstScoringRules.safeties}`);
                    console.log(`   blockedKicks: ${blockedKicks} × ${dstScoringRules.blockedKicks} = ${blockedKicks * dstScoringRules.blockedKicks}`);
                    console.log(`   puntReturnTDs: ${puntReturnTDs} × ${dstScoringRules.puntReturnTDs} = ${puntReturnTDs * dstScoringRules.puntReturnTDs}`);
                    console.log(`   kickoffReturnTDs: ${kickoffReturnTDs} × ${dstScoringRules.kickoffReturnTDs} = ${kickoffReturnTDs * dstScoringRules.kickoffReturnTDs}`);
                    
                    // Points allowed calculation
                    const pointsAllowedScore = getPointsAllowedScore(pointsAllowed);
                    console.log(`   pointsAllowed: ${pointsAllowed} points = ${pointsAllowedScore} points`);
                    
                    // Calculate total
                    let totalPoints = 0;
                    totalPoints += sacks * dstScoringRules.sacks;
                    totalPoints += interceptions * dstScoringRules.interceptions;
                    totalPoints += fumbleRecoveries * dstScoringRules.fumbleRecoveries;
                    totalPoints += defensiveTDs * dstScoringRules.defensiveTDs;
                    totalPoints += safeties * dstScoringRules.safeties;
                    totalPoints += blockedKicks * dstScoringRules.blockedKicks;
                    totalPoints += puntReturnTDs * dstScoringRules.puntReturnTDs;
                    totalPoints += kickoffReturnTDs * dstScoringRules.kickoffReturnTDs;
                    totalPoints += pointsAllowedScore;
                    
                    // Team win bonus (6 points if team won)
                    if (teamWin) {
                        totalPoints += 6;
                        console.log(`   teamWin: Yes = +6 points`);
                    } else {
                        console.log(`   teamWin: No = 0 points`);
                    }
                    
                    console.log(`   Total D/ST Points: ${totalPoints.toFixed(2)}`);
                }
                
                return {
                    ...player,
                    ...playerWithStats
                };
            } else {
                console.log('🔍 No stats found for player, using original player data with empty stats:', player.player_id, player.name);
                return {
                    ...player,
                    stats: {} // Ensure every player has a stats property
                };
            }
        })
    };
    
    console.log('🔍 Original team.players:', team.players);
    console.log('🔍 teamWithRealStats.players:', teamWithRealStats.players);
    
    // Use modular team score calculation (same logic as LeaguePage)
    const teamScoreData = calculateTeamScoreWithStats(team, league, getPlayerWithRealStats, currentWeek, seasonType);
    const teamTotal = teamScoreData.weeklyScore;
    
    // Calculate best ball lineup (simple version)
    const playersWithScores = teamWithRealStats.players.map(player => ({
        ...player,
        calculatedScore: calculatePlayerScore(player, scoringRules)
    })).sort((a, b) => b.calculatedScore - a.calculatedScore);

    // Build optimal lineup
    const optimalLineup = {
        QB: playersWithScores.find(p => p.position === 'QB') || null,
        RB1: playersWithScores.filter(p => p.position === 'RB')[0] || null,
        RB2: playersWithScores.filter(p => p.position === 'RB')[1] || null,
        WR1: playersWithScores.filter(p => p.position === 'WR')[0] || null,
        WR2: playersWithScores.filter(p => p.position === 'WR')[1] || null,
        TE: playersWithScores.find(p => p.position === 'TE') || null,
        K: playersWithScores.find(p => p.position === 'K' || p.position === 'PK') || null,
        DEF: playersWithScores.find(p => p.position === 'D/ST' || p.position === 'DEF') || null,
        FLEX: null
    };

    // Find FLEX player (best remaining RB/WR/TE not already in lineup)
    const usedPlayerIds = new Set();
    Object.values(optimalLineup).forEach(player => {
        if (player) usedPlayerIds.add(player.player_id || player.id);
    });

    const flexCandidates = playersWithScores.filter(player => 
        !usedPlayerIds.has(player.player_id || player.id) && 
        ['RB', 'WR', 'TE'].includes(player.position)
    );
    optimalLineup.FLEX = flexCandidates[0] || null;

    // Update used player IDs for bench calculation
    if (optimalLineup.FLEX) usedPlayerIds.add(optimalLineup.FLEX.player_id || optimalLineup.FLEX.id);

    // Bench players are everyone else
    const benchPlayers = playersWithScores.filter(player => 
        !usedPlayerIds.has(player.player_id || player.id)
    );
    
    
    // Debug kicker positions specifically
    const kickers = teamWithRealStats.players.filter(p => p.position === 'K' || p.position === 'PK');
    console.log("🦵 Kickers found:", kickers.map(k => ({ name: k.name, position: k.position, stats: k.stats })));

    const getPositionColor = (position) => {
        const colors = {
            'QB': 'bg-blue-100 border-blue-300 text-blue-800',
            'RB': 'bg-green-100 border-green-300 text-green-800',
            'WR': 'bg-purple-100 border-purple-300 text-purple-800',
            'TE': 'bg-orange-100 border-orange-300 text-orange-800',
            'K': 'bg-yellow-100 border-yellow-300 text-yellow-800',
            'PK': 'bg-yellow-100 border-yellow-300 text-yellow-800', // Also handle PK
            'D/ST': 'bg-red-100 border-red-300 text-red-800',
            'DEF': 'bg-red-100 border-red-300 text-red-800'
        };
        return colors[position] || 'bg-gray-100 border-gray-300 text-gray-800';
    };

    const getRosterSpotPlayer = (position, index) => {
        if (position === 'QB') return optimalLineup.QB;
        if (position === 'RB') {
            if (index === 0) return optimalLineup.RB1;
            if (index === 1) return optimalLineup.RB2;
        }
        if (position === 'WR') {
            if (index === 0) return optimalLineup.WR1;
            if (index === 1) return optimalLineup.WR2;
        }
        if (position === 'TE') return optimalLineup.TE;
        if (position === 'K') return optimalLineup.K;
        if (position === 'D/ST' || position === 'DEF') return optimalLineup.DEF;
        return null;
    };

    const getFlexPlayer = () => {
        return optimalLineup.FLEX;
    };

    const getBenchPlayer = (index) => {
        if (benchPlayers.length > index) {
            return benchPlayers[index];
        }
        return null;
    };

    // RosterPlayer component for consistent player display
    const RosterPlayer = ({ player, onRemove, onPlayerClick, currentWeek, scoringRules, isCommissioner }) => (
        <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                    <div className="min-w-0 flex-1">
                        <button
                            onClick={() => onPlayerClick(player)}
                            className="text-sm font-medium text-blue-200 hover:text-green-300 transition-colors text-left"
                        >
                            {player.name}
                        </button>
                        <p className="text-sm text-gray-400">{player.team}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                {isCommissioner && onRemove && (
                <div className="flex space-x-2">
                    <button
                        onClick={() => onRemove(player.player_id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove player"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
                )}
                <div className="text-right min-w-[80px]">
                    <div className="text-sm font-medium text-white">
                        {calculatePlayerScore(player, scoringRules).toFixed(2)} pts
                    </div>
                    <div className="text-xs text-gray-400">{getWeekDisplayName(currentWeek, seasonType || 'regular')} ({seasonDisplay})</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="mb-4">
                <div className="bg-gray-800 shadow-lg border-b border-gray-700 mb-6">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate(`/league/${league.id}`)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className='text-3xl font-bold text-white'>{team.name}</h1>
                                    <p className="text-gray-300">Owner: {team.owner} • League: {league.name}</p>
                                </div>
                            </div>
                {isCommissioner ? (
                <button
                    onClick={() => setShowPlayerSelection(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                >
                    Add Player
                </button>
                ) : (
                    <p className="text-gray-400 italic">Commissioner login required to manage roster</p>
                )}
                        </div>
                    </div>
            </div>

                {/* Team Info */}
                <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2">Week Selection</h2>
                            <p className="text-gray-300">Select a week to view player stats</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={() => fetchRealStats(currentWeek, nflSeasonYear, seasonType)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-300 bg-blue-900/20 hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors border border-blue-700/50"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Stats
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-300">Season:</label>
                            <span className="px-3 py-2 bg-gray-700 text-white rounded-md">
                                {seasonDisplay}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-300">Week:</label>
                            <select 
                                value={currentWeek} 
                                onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            >
                                {availableWeeks
                                    .sort((a, b) => a.week - b.week)
                                    .map(week => (
                                        <option key={`${week.year}-${week.week}`} value={week.week}>
                                            {getWeekDisplayName(week.week, seasonType)}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-400">
                            {seasonType === 'postseason' ? '4' : '18'} weeks
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Team Roster by Position */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Roster Widget - Takes up 2/3 of the space */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Starting Lineup */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Starting Lineup</h3>
                        </div>
                        <div className="divide-y divide-gray-700">
                            {/* QB */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/50 border border-blue-600 text-blue-300">QB</div>
                                        {getRosterSpotPlayer('QB', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('QB', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RB1 */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/50 border border-green-600 text-green-300">RB</div>
                                        {getRosterSpotPlayer('RB', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('RB', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RB2 */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/50 border border-green-600 text-green-300">RB</div>
                                        {getRosterSpotPlayer('RB', 1) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('RB', 1)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* WR1 */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-purple-900/50 border border-purple-600 text-purple-300">WR</div>
                                        {getRosterSpotPlayer('WR', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('WR', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* WR2 */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-purple-900/50 border border-purple-600 text-purple-300">WR</div>
                                        {getRosterSpotPlayer('WR', 1) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('WR', 1)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TE */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-orange-900/50 border border-orange-600 text-orange-300">TE</div>
                                        {getRosterSpotPlayer('TE', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('TE', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* FLEX */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-900/50 border border-indigo-600 text-indigo-300">FLEX</div>
                                        {getFlexPlayer() ? (
                                            <RosterPlayer player={getFlexPlayer()} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* K */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/50 border border-yellow-600 text-yellow-300">K</div>
                                        {getRosterSpotPlayer('K', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('K', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DEF */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/50 border border-red-600 text-red-300">D/ST</div>
                                        {getRosterSpotPlayer('D/ST', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer('D/ST', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bench Players */}
                    {(() => {
                        // Get bench count from league roster_structure, default to 3
                        let benchCount = 3;
                        if (league?.roster_structure) {
                            const rosterStructure = typeof league.roster_structure === 'string' 
                                ? JSON.parse(league.roster_structure) 
                                : league.roster_structure;
                            benchCount = rosterStructure.BN || 3;
                        }
                        
                        return (
                            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                                <div className="px-6 py-4 border-b border-gray-700">
                                    <h3 className="text-lg font-semibold text-white">Bench</h3>
                                </div>
                                <div className="divide-y divide-gray-700">
                                    {Array.from({ length: benchCount }, (_, index) => (
                                        <div key={index} className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 border border-gray-500 text-gray-300">BN</div>
                                                    {getBenchPlayer(index) ? (
                                                        <RosterPlayer player={getBenchPlayer(index)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} isCommissioner={isCommissioner} />
                                                    ) : (
                                                        <div className="text-gray-500 italic">No player selected</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Team Stats Widget - Takes up 1/3 of the space */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Team Total Score */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-white mb-2">{getWeekDisplayName(currentWeek, seasonType || 'regular')} Score ({seasonDisplay})</h3>
                            <div className="text-4xl font-bold text-blue-400">{teamTotal.toFixed(2)}</div>
                            <p className="text-sm text-gray-400 mt-2">Current roster total</p>
                        </div>
                    </div>

                    {/* Team Standings */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-medium text-white mb-4">League Standings</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Current Rank:</span>
                                <span className="text-white font-medium">
                                    {teamRank ? `#${teamRank}` : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Season Total:</span>
                                <span className="text-white font-medium">
                                    {teamSeasonStats?.season_total 
                                        ? parseFloat(teamSeasonStats.season_total).toFixed(1) 
                                        : '0.0'}
                                </span>
                            </div>
                            {teamSeasonStats?.weekly_breakdown && teamSeasonStats.weekly_breakdown.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-700">
                                    <div className="text-xs text-gray-400 mb-1">Weekly Breakdown:</div>
                                    {teamSeasonStats.weekly_breakdown.map((week, idx) => (
                                        <div key={idx} className="flex justify-between text-xs text-gray-300">
                                            <span>Week {week.week}:</span>
                                            <span>{week.score.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Weeks Played:</span>
                                <span className="text-white font-medium">
                                    {teamSeasonStats?.weeks_played || '0'}
                                </span>
                            </div>
                            {teamSeasonStats?.average_weekly_score && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Avg Score:</span>
                                    <span className="text-white font-medium">
                                        {parseFloat(teamSeasonStats.average_weekly_score).toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Roster Status */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Roster Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Players Added:</span>
                                <span className="text-white font-medium">{teamWithRealStats.players.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Spots Remaining:</span>
                                <span className="text-white font-medium">{12 - teamWithRealStats.players.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Complete Roster:</span>
                                <span className={`font-medium ${teamWithRealStats.players.length === 12 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {teamWithRealStats.players.length === 12 ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Selection Modal */}
            {showPlayerSelection && isCommissioner && (
                <PlayerSelectionForm
                    leagueId={league.id}
                    teamId={teamId}
                    onPlayerAdded={handleAddPlayer}
                    onClose={() => setShowPlayerSelection(false)}
                />
            )}

            {/* Player Stats Modal */}
            <PlayerStatsModal
                player={selectedPlayerForStats}
                isOpen={showPlayerStatsModal}
                onClose={() => setShowPlayerStatsModal(false)}
                week={currentWeek}
                year={nflSeasonYear}
                seasonType={seasonType}
            />
        </div>
    );
};

export default TeamPage;