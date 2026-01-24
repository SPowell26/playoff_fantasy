import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { mockLeagues } from '../data/mockData';
import { nflfastrWeeklyMockData, getAvailablePlayers } from '../data/nflfastr_weekly_mock';
import { useYearly } from './YearlyContext';

// Create the context
const DataContext = createContext();

// Local storage keys
const STORAGE_KEYS = {
    LEAGUES: 'playoff_fantasy_leagues',
    PLAYERS: 'playoff_fantasy_players'
};

// Helper functions for localStorage
const loadFromStorage = (key, defaultValue = []) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error loading from localStorage (${key}):`, error);
        return defaultValue;
    }
};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
    }
};

// Provider component
export function DataProvider({ children }) {
    const [leagues, setLeagues] = useState(() => loadFromStorage(STORAGE_KEYS.LEAGUES, []));
    const [players, setPlayers] = useState(nflfastrWeeklyMockData.players);
    const [realStats, setRealStats] = useState({});
    const { currentYear, getPlayoffTeamsForYear } = useYearly();
    
    // Save leagues to localStorage whenever they change
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.LEAGUES, leagues);
    }, [leagues]);

    // Fetch leagues from backend on app startup
    useEffect(() => {
        fetchLeagues();
    }, []);

    // Function to fetch all leagues from backend
    const fetchLeagues = async () => {
        try {
            console.log('🔄 Fetching leagues from backend...');
            const response = await fetch(`${API_URL}/api/leagues`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const leaguesData = await response.json();
            console.log('✅ Fetched leagues from backend:', leaguesData);
            setLeagues(leaguesData);
        } catch (error) {
            console.error('❌ Failed to fetch leagues:', error);
            // Keep existing leagues from localStorage if fetch fails
        }
    };
    
    // Basic function to create a new league
    const createLeague = async (name, commissioner, commissionerEmail, password, year, season_type = 'regular') => {
        try {
            // Validate inputs
            if (!name || !commissioner || !commissionerEmail) {
                throw new Error('League name, commissioner, and commissioner email are required');
            }
            
            if (name.length < 3) {
                throw new Error('League name must be at least 3 characters');
            }
            
            if (commissioner.length < 2) {
                throw new Error('Commissioner name must be at least 2 characters');
            }
            
            console.log('🏈 Creating league via API:', { name, commissioner, commissionerEmail, password: '[HIDDEN]', year });
            
            // Create league via backend API - backend will generate the ID
            const response = await fetch(`${API_URL}/api/leagues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    commissioner,
                    commissionerEmail,
                    password,
                    year: year || currentYear,
                    season_type: season_type || 'regular'
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create league');
            }
            
            const newLeague = await response.json();
            console.log('✅ League created via API:', newLeague);
            
            // Update local state
            setLeagues([...leagues, newLeague]);
            return newLeague;
            
        } catch (error) {
            console.error('Failed to create league:', error);
            throw error; // Re-throw so the component can handle it
        }
    };

    // Function to update a league
    const updateLeague = async (leagueId, updates) => {
        try {
            // Prepare the request body - scoring_rules and roster_structure should be sent as JSON strings if they're objects
            const requestBody = { ...updates };
            if (updates.scoring_rules && typeof updates.scoring_rules === 'object') {
                requestBody.scoring_rules = JSON.stringify(updates.scoring_rules);
            }
            if (updates.roster_structure && typeof updates.roster_structure === 'object') {
                requestBody.roster_structure = JSON.stringify(updates.roster_structure);
            }
            
            const response = await fetch(`${API_URL}/api/leagues/${leagueId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update league');
            }
            
            const updatedLeague = await response.json();
            
            // Parse scoring_rules if it's a string
            if (updatedLeague.scoring_rules && typeof updatedLeague.scoring_rules === 'string') {
                try {
                    updatedLeague.scoring_rules = JSON.parse(updatedLeague.scoring_rules);
                } catch (e) {
                    console.warn('Failed to parse scoring_rules:', e);
                }
            }
            
            // Parse roster_structure if it's a string
            if (updatedLeague.roster_structure && typeof updatedLeague.roster_structure === 'string') {
                try {
                    updatedLeague.roster_structure = JSON.parse(updatedLeague.roster_structure);
                } catch (e) {
                    console.warn('Failed to parse roster_structure:', e);
                }
            }
            
            // Update local state
            setLeagues(leagues.map(league => 
                league.id === leagueId ? updatedLeague : league
            ));
            
            return updatedLeague;
        } catch (error) {
            console.error('Failed to update league:', error);
            throw error;
        }
    };
    
    // Function to delete a league
    const deleteLeague = async (leagueId) => {
        try {
            const response = await fetch(`${API_URL}/api/leagues/${leagueId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete league');
            }
            
            // Update local state
            setLeagues(leagues.filter(league => league.id !== leagueId));
        } catch (error) {
            console.error('Failed to delete league:', error);
            throw error;
        }
    };

    //Function to create a new team
    const createTeam = async (name, owner, leagueId) => {
        try {
            // Validate inputs
            if (!name || !owner || !leagueId) {
                throw new Error('Team name, owner, and league ID are required');
            }
            
            if (name.length < 2) {
                throw new Error('Team name must be at least 2 characters');
            }
            
            if (owner.length < 2) {
                throw new Error('Owner name must be at least 2 characters');
            }
            
            console.log('🏈 Creating team via API:', { name, owner, leagueId });
            
            // Create team via backend API - backend will generate the ID
            const response = await fetch(`${API_URL}/api/leagues/${leagueId}/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ name, owner })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create team');
            }
            
            const newTeam = await response.json();
            console.log('✅ Team created via API:', newTeam);
            
            return newTeam;
            
        } catch (error) {
            console.error('Failed to create team:', error);
            throw error; // Re-throw so the component can handle it
        }
    };
    
        //Function to add a team to a league
        const addTeamToLeague = (leagueId, team) => {
            setLeagues(leagues.map(league => {
                if (league.id === leagueId) {
                    return {
                        ...league,
                        teams: [...league.teams, team],
                        currentTeams: league.currentTeams + 1
                    };
                }
                return league;
            }));
        };

        // Function to get available players for a league (not already drafted)
        const getAvailablePlayersForLeague = (leagueId) => {
            const league = leagues.find(l => l.id === leagueId);
            if (!league) return [];

            // Get all player IDs that are already drafted in this league
            const draftedPlayerIds = league.teams.flatMap(team => 
                team.players.map(player => player.id)
            );

            // Return players that are not drafted
            return players.filter(player => !draftedPlayerIds.includes(player.id));
        };

        // Function to add a player to a team
        const addPlayerToTeam = (leagueId, teamId, player) => {
            setLeagues(leagues.map(league => {
                if (league.id === leagueId) {
                    return {
                        ...league,
                        teams: league.teams.map(team => {
                            if (team.id === teamId) {
                                return {
                                    ...team,
                                    players: [...team.players, player]
                                };
                            }
                            return team;
                        })
                    };
                }
                return league;
            }));
        };

        // Function to remove a player from a team
        const removePlayerFromTeam = (leagueId, teamId, playerId) => {
            setLeagues(leagues.map(league => {
                if (league.id === leagueId) {
                    return {
                        ...league,
                        teams: league.teams.map(team => {
                            if (team.id === teamId) {
                                return {
                                    ...team,
                                    players: team.players.filter(player => player.id !== playerId)
                                };
                            }
                            return team;
                        })
                    };
                }
                return league;
            }));
        };

        // Function to delete a team from a league
        const deleteTeamFromLeague = (leagueId, teamId) => {
            setLeagues(leagues.map(league => {
                if (league.id === leagueId) {
                    return {
                        ...league,
                        teams: league.teams.filter(team => team.id !== teamId),
                        currentTeams: league.currentTeams - 1
                    };
                }
                return league;
            }));
        };

        // Function to clear all data (for testing/reset)
        const clearAllData = () => {
            setLeagues([]);
            localStorage.removeItem(STORAGE_KEYS.LEAGUES);
        };

        // Function to fetch real playoff stats from backend
        const fetchRealStats = async (week = 1, year = 2024, seasonType = null) => {
            try {
                console.log(`🔄 Fetching real stats for week ${week}, year ${year}, seasonType: ${seasonType || 'all'}...`);
                let url = `${API_URL}/api/stats/scoring-ready/${week}?year=${year}`;
                if (seasonType) {
                    url += `&seasonType=${seasonType}`;
                }
                const response = await fetch(url);
                
                // Store stats with composite key: week-seasonType (even if empty)
                const statsKey = seasonType ? `${week}-${seasonType}` : `${week}`;
                
                if (!response.ok) {
                    // If 404 or other error, explicitly cache empty result
                    // This prevents accidentally using stats from a different season_type
                    if (response.status === 404) {
                        console.log(`⚠️ No stats found for week ${week}, seasonType: ${seasonType || 'all'} (404)`);
                        setRealStats(prev => ({ ...prev, [statsKey]: { players: [], count: 0 } }));
                        return [];
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log(`✅ Fetched ${data.count || 0} players with real stats for week ${week}, seasonType: ${seasonType || 'all'}`);
                
                // If no stats found for this season_type, explicitly cache empty result
                // This prevents accidentally using stats from a different season_type
                if (!data.players || data.players.length === 0) {
                    console.log(`⚠️ No stats found for week ${week}, seasonType: ${seasonType || 'all'}`);
                    // Still cache the empty result so we know we've checked
                    const statsKey = seasonType ? `${week}-${seasonType}` : `${week}`;
                    setRealStats(prev => ({ ...prev, [statsKey]: { players: [], count: 0 } }));
                    return [];
                }
                
                // Transform the data to match your existing player structure
                const transformedPlayers = data.players.map(player => ({
                    ...player,
                    stats: player.weeklyStats[week] || {} // Extract the week's stats
                }));
                
                // Store stats with composite key (already set above)
                setRealStats(prev => ({ ...prev, [statsKey]: data }));
                console.log(`📦 Cached stats with key: "${statsKey}"`);
                
                console.log(`🎯 Transformed ${transformedPlayers.length} players for scoring engine`);
                return transformedPlayers;
                
            } catch (error) {
                console.error('❌ Failed to fetch real stats:', error);
                // Fallback to mock data
                return players;
            }
        };

        // Helper function to search for players by name in stats
        const searchPlayerByName = (week, playerName) => {
            if (!realStats[week] || !realStats[week].players) return null;
            
            const found = realStats[week].players.find(p => 
                p.name.toLowerCase().includes(playerName.toLowerCase()) ||
                playerName.toLowerCase().includes(p.name.toLowerCase())
            );
            
            if (found) {
                console.log(`🔍 Found player by name search:`, found);
                return found;
            }
            
            return null;
        };

        // Function to get player with real stats for scoring
        const getPlayerWithRealStats = (playerId, week = 1, seasonType = null) => {
            console.log(`🔍 getPlayerWithRealStats called with playerId: ${playerId}, week: ${week}, seasonType: ${seasonType || 'all'}`);
            console.log(`🔍 Available realStats keys:`, Object.keys(realStats));
            
            // Build stats key using season_type if provided
            const statsKey = seasonType ? `${week}-${seasonType}` : `${week}`;
            console.log(`🔍 Looking for realStats[${statsKey}]:`, realStats[statsKey]);
            
            // If we have real stats for this week/seasonType, use them
            if (realStats[statsKey] && realStats[statsKey].players) {
                console.log(`🔍 Found realStats[${statsKey}].players, searching for player ${playerId}`);
                console.log(`🔍 Total players in realStats[${statsKey}]:`, realStats[statsKey].players.length);
                
                // Log a sample of available players for debugging
                if (week === 3) {
                    console.log(`🔍 Week 3 players sample:`, realStats[statsKey].players.slice(0, 3).map(p => ({ id: p.id, name: p.name, position: p.position })));
                }
                
                const realPlayer = realStats[statsKey].players.find(p => p.id === playerId);
                console.log(`🔍 Real player found:`, realPlayer);
                
                if (realPlayer && realPlayer.weeklyStats && realPlayer.weeklyStats[week]) {
                    console.log(`✅ Found real player stats for player ${playerId}:`, realPlayer.weeklyStats[week]);
                    
                    // The stats are already in camelCase format, so use them directly
                    const rawStats = realPlayer.weeklyStats[week];
                    console.log('🔍 Raw stats (already camelCase):', rawStats);
                    console.log('🔍 Raw stats keys:', Object.keys(rawStats));
                    console.log('🔍 Raw receptions value:', rawStats.receptions);
                    console.log('🔍 Raw receptions type:', typeof rawStats.receptions);
                    console.log('🔍 All raw stats values:', rawStats);
                    
                    const transformedStats = {
                        passingYards: rawStats.passingYards || 0,
                        passingTD: rawStats.passingTD || 0,
                        interceptions: rawStats.interceptions || 0,
                        rushingYards: rawStats.rushingYards || 0,
                        rushingTD: rawStats.rushingTD || 0,
                        receivingYards: rawStats.receivingYards || 0,
                        receivingTD: rawStats.receivingTD || 0,
                        fumbles: rawStats.fumbles || 0,
                        receptions: rawStats.receptions || 0,
                        // Kicker stats - individual distance categories
                        fieldGoals0_39: rawStats.fieldGoals0_39 || 0,
                        fieldGoals40_49: rawStats.fieldGoals40_49 || 0,
                        fieldGoals50_plus: rawStats.fieldGoals50_plus || 0,
                        fieldGoalsMade: rawStats.fieldGoalsMade || 0,
                        extraPointsMade: rawStats.extraPointsMade || 0,
                        fieldGoalsMissed: rawStats.fieldGoalsMissed || 0,
                        extraPointsMissed: rawStats.extraPointsMissed || 0,
                        // Defense stats
                        sacks: rawStats.sacks || 0,
                        interceptions: rawStats.interceptions || 0,
                        fumbleRecoveries: rawStats.fumbleRecoveries || 0,
                        safeties: rawStats.safeties || 0,
                        blockedKicks: rawStats.blockedKicks || 0,
                        defensiveTDs: rawStats.defensiveTDs || 0,
                        puntReturnTD: rawStats.puntReturnTD || rawStats.punt_return_touchdowns || 0,
                        kickoffReturnTD: rawStats.kickoffReturnTD || rawStats.kickoff_return_touchdowns || 0,
                        pointsAllowed: rawStats.pointsAllowed || 0,
                        // 2-point conversions
                        twoPointConversionsPassing: rawStats.twoPointConversionsPassing || 0,
                        twoPointConversionsReceiving: rawStats.twoPointConversionsReceiving || 0,
                        // Preserve boolean values correctly - handle true/1/'true' as true, everything else as false
                        teamWin: rawStats.teamWin === true || rawStats.teamWin === 1 || rawStats.teamWin === 'true' || 
                                 rawStats.team_win === true || rawStats.team_win === 1 || rawStats.team_win === 'true',
                        team_win: rawStats.team_win === true || rawStats.team_win === 1 || rawStats.team_win === 'true' ||
                                  rawStats.teamWin === true || rawStats.teamWin === 1 || rawStats.teamWin === 'true',
                        extraPointsMissed: rawStats.extraPointsMissed || 0
                    };
                    
                    console.log('🔍 Transformed stats:', transformedStats);
                    
                    return {
                        id: playerId,
                        name: realPlayer.name,
                        position: realPlayer.position,
                        team: realPlayer.team,
                        stats: transformedStats
                    };
                } else {
                    // Player not found - let's search by name to see if there's a mismatch
                    console.log(`🔍 Player ${playerId} not found in stats. Searching for similar names...`);
                    // This will help us see if the player exists with a different ID
                    
                    // Try to find the player by name from the team roster
                    // We need to get the player name from somewhere - let's check if we can get it from the team data
                    console.log(`🔍 Attempting name search for player ID ${playerId}`);
                }
            } else {
                console.log(`❌ No realStats[${statsKey}] or no players in realStats[${statsKey}]`);
                if (realStats[statsKey]) {
                    console.log(`🔍 realStats[${statsKey}] structure:`, realStats[statsKey]);
                }
                
                // If season_type was provided and we didn't find stats, log available keys
                if (seasonType) {
                    const availableKeys = Object.keys(realStats);
                    console.log(`⚠️ Stats not found for key "${statsKey}". Available keys:`, availableKeys);
                    console.log(`⚠️ This means stats for week ${week} with season_type="${seasonType}" have not been fetched yet.`);
                }
            }
            
            // Return null if no stats found - don't fall back to other season types
            // This ensures postseason leagues don't show regular season stats
            console.log(`🔄 No stats found for player ${playerId} with season_type="${seasonType || 'all'}", returning null`);
            return null;
        };

    const value = {
        leagues,
        players,
        realStats,
        createLeague,
        updateLeague,
        deleteLeague,
        createTeam,
        addTeamToLeague,
        getAvailablePlayersForLeague,
        addPlayerToTeam,
        removePlayerFromTeam,
        deleteTeamFromLeague,
        clearAllData,
        fetchRealStats,
        getPlayerWithRealStats,
        fetchLeagues
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

// Custom hook to use the context
export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}