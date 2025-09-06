import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { calculateTeamScore, calculatePlayerScore} from '../utils/calculations';
import PlayerSelectionForm from '../components/PlayerSelectionForm';
import PlayerStatsModal from '../components/PlayerStatsModal';

const TeamPage = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [league, setLeague] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTotal, setShowTotal] = useState(true);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editStats, setEditStats] = useState({});
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(1);
    const [currentYear, setCurrentYear] = useState(2024);
    const [availableWeeks, setAvailableWeeks] = useState([]);
    const [selectedPlayerForStats, setSelectedPlayerForStats] = useState(null);
    const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);
    const { fetchRealStats, getPlayerWithRealStats } = useData();

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

    // Fetch available weeks when component mounts
    useEffect(() => {
        fetchAvailableWeeks();
    }, []);

    // Fetch stats when component mounts with initial week/year
    useEffect(() => {
        if (currentWeek && currentYear) {
            fetchRealStats(currentWeek, currentYear);
        }
    }, []); // Only run once on mount

    // Fetch stats when week or year changes
    useEffect(() => {
        if (currentWeek && currentYear) {
            fetchRealStats(currentWeek, currentYear);
        }
    }, [currentWeek, currentYear]);

    const fetchAvailableWeeks = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/stats/available-weeks');
            if (response.ok) {
                const data = await response.json();
                setAvailableWeeks(data.weeks || []);
                
                // Set default week and year to the first available
                if (data.weeks && data.weeks.length > 0) {
                    const firstWeek = data.weeks[0];
                    setCurrentWeek(firstWeek.week);
                    setCurrentYear(firstWeek.year);
                }
            }
        } catch (error) {
            console.error('Failed to fetch available weeks:', error);
        }
    };

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching team data for team ID:', teamId);
            
            // Fetch team data (which now includes league info)
            const response = await fetch(`http://localhost:3001/api/leagues/teams/${teamId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const teamData = await response.json();
            console.log('✅ Fetched team data:', teamData);
            
            // The backend now returns team with league info
            setTeam(teamData);
            setLeague(teamData.league);
            
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
            const response = await fetch(`http://localhost:3001/api/teams/${teamId}/players`);
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
            
            const response = await fetch(`http://localhost:3001/api/teams/${teamId}/players/${playerId}`, {
                method: 'DELETE'
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
            fumbles: -2
        };
    }
    
    console.log('🔍 Final scoring rules:', scoringRules);
    
    // Use real stats for scoring calculations
    const teamWithRealStats = {
        ...team,
        players: (team.players || []).map(player => {
            console.log('🔍 Processing player:', player.player_id, player.name, 'from team roster');
            const playerWithStats = getPlayerWithRealStats(player.player_id, currentWeek);
            if (playerWithStats) {
                console.log('🔍 Player with stats:', playerWithStats.id, playerWithStats.name, 'Stats:', playerWithStats.stats);
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
    
    const teamTotal = calculateTeamScore(teamWithRealStats, scoringRules);
    const grouped = {};
    teamWithRealStats.players.forEach(player => {
        if (!grouped[player.position]) grouped[player.position] = [];
        grouped[player.position].push(player);
    });
    console.log("grouped players with real stats:", grouped);

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

    const getRosterSpotPlayer = (grouped, position, index) => {
        const playersAtPosition = grouped[position] || [];
        if (playersAtPosition.length > index) {
            return playersAtPosition[index];
        }
        return null;
    };

    const getFlexPlayer = (grouped) => {
        const flexPlayers = grouped['FLEX'] || [];
        if (flexPlayers.length > 0) {
            return flexPlayers[0];
        }
        return null;
    };

    const getBenchPlayer = (grouped, index) => {
        const benchPlayers = grouped['BN'] || [];
        if (benchPlayers.length > index) {
            return benchPlayers[index];
        }
        return null;
    };

    // RosterPlayer component for consistent player display
    const RosterPlayer = ({ player, onRemove, onPlayerClick, currentWeek, scoringRules }) => (
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
                <div className="text-right min-w-[80px]">
                    <div className="text-sm font-medium text-white">
                        {calculatePlayerScore(player, scoringRules).toFixed(2)} pts
                    </div>
                    <div className="text-xs text-gray-400">Week {currentWeek} ({currentYear})</div>
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
                <button
                    onClick={() => setShowPlayerSelection(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                >
                    Add Player
                </button>
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
                                onClick={() => fetchRealStats(currentWeek, currentYear)}
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
                            <label className="text-sm font-medium text-gray-300">Year:</label>
                            <select 
                                value={currentYear} 
                                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            >
                                {Array.from(new Set(availableWeeks.map(w => w.year))).sort((a, b) => b - a).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-300">Week:</label>
                            <select 
                                value={currentWeek} 
                                onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            >
                                {availableWeeks
                                    .filter(w => w.year === currentYear)
                                    .sort((a, b) => a.week - b.week)
                                    .map(week => (
                                        <option key={`${week.year}-${week.week}`} value={week.week}>
                                            Week {week.week}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-400">
                            Available: {availableWeeks.filter(w => w.year === currentYear).length} weeks
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
                                        {getRosterSpotPlayer(grouped, 'QB', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'QB', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'RB', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'RB', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'RB', 1) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'RB', 1)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'WR', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'WR', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'WR', 1) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'WR', 1)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'TE', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'TE', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getFlexPlayer(grouped) ? (
                                            <RosterPlayer player={getFlexPlayer(grouped)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'PK', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'PK', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
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
                                        {getRosterSpotPlayer(grouped, 'D/ST', 0) ? (
                                            <RosterPlayer player={getRosterSpotPlayer(grouped, 'D/ST', 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bench Players */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Bench</h3>
                        </div>
                        <div className="divide-y divide-gray-700">
                            {/* Bench 1 */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 border border-gray-500 text-gray-300">BN</div>
                                        {getBenchPlayer(grouped, 0) ? (
                                            <RosterPlayer player={getBenchPlayer(grouped, 0)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bench 2 */}
                            <div className="px-6 py-4 hover:bg-gray-750 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 border border-gray-500 text-gray-300">BN</div>
                                        {getBenchPlayer(grouped, 1) ? (
                                            <RosterPlayer player={getBenchPlayer(grouped, 1)} onRemove={handleRemovePlayer} onPlayerClick={handlePlayerClick} currentWeek={currentWeek} scoringRules={scoringRules} />
                                        ) : (
                                            <div className="text-gray-500 italic">No player selected</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Stats Widget - Takes up 1/3 of the space */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Team Total Score */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-white mb-2">Week {currentWeek} Score ({currentYear})</h3>
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
                                <span className="text-white font-medium">TBD</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Season Total:</span>
                                <span className="text-white font-medium">TBD</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Games Played:</span>
                                <span className="text-white font-medium">TBD</span>
                            </div>
                        </div>
                    </div>

                    {/* Roster Status */}
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Roster Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Players Added:</span>
                                <span className="text-white font-medium">{Object.values(grouped).flat().length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Spots Remaining:</span>
                                <span className="text-white font-medium">{10 - Object.values(grouped).flat().length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Complete Roster:</span>
                                <span className={`font-medium ${Object.values(grouped).flat().length === 10 ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {Object.values(grouped).flat().length === 10 ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Selection Modal */}
            {showPlayerSelection && (
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
                year={currentYear}
            />
        </div>
    );
};

export default TeamPage;