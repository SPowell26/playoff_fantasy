import React, { createContext, useContext, useState, useEffect } from 'react';
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
    const [players] = useState(nflfastrWeeklyMockData.players);
    const { currentYear, getPlayoffTeamsForYear } = useYearly();
    
    // Save leagues to localStorage whenever they change
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.LEAGUES, leagues);
    }, [leagues]);
    
    // Basic function to create a new league
    const createLeague = (name, commissioner) => {
        try {
            // Validate inputs
            if (!name || !commissioner) {
                throw new Error('League name and commissioner are required');
            }
            
            if (name.length < 3) {
                throw new Error('League name must be at least 3 characters');
            }
            
            if (commissioner.length < 2) {
                throw new Error('Commissioner name must be at least 2 characters');
            }
            
            const newLeague = {
                id: `league_${Date.now()}`,
                name: name,
                commissioner: commissioner,
                status: 'setup',
                maxTeams: 8,
                currentTeams: 0,
                teams: [],
                settings: {
                    scoringRules: {
                        passingYards: 0.04,
                        passingTD: 4,
                        interceptions: -2,
                        rushingYards: 0.1,
                        rushingTD: 6,
                        receivingYards: 0.1,
                        receivingTD: 6,
                        fumbles: -2
                    },
                    playoffTeams: getPlayoffTeamsForYear(currentYear)
                }
            };
            
            setLeagues([...leagues, newLeague]);
            console.log('League created successfully:', newLeague.id);
            return newLeague;
        } catch (error) {
            console.error('Failed to create league:', error);
            throw error; // Re-throw so the component can handle it
        }
    };

    // Function to delete a league
    const deleteLeague = (leagueId) => {
        setLeagues(leagues.filter(league => league.id !== leagueId));
    };

    //Function to create a new team
    const createTeam = (name, owner) => {
        try {
            // Validate inputs
            if (!name || !owner) {
                throw new Error('Team name and owner are required');
            }
            
            if (name.length < 2) {
                throw new Error('Team name must be at least 2 characters');
            }
            
            if (owner.length < 2) {
                throw new Error('Owner name must be at least 2 characters');
            }
            
            const newTeam = {
                id: `team_${Date.now()}`,
                name: name,
                owner: owner,
                players: [],
                weeklyScores: [],
                totalScore: 0
            };
            
            console.log('Team created successfully:', newTeam.id);
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

    const value = {
        leagues,
        players,
        createLeague,
        deleteLeague,
        createTeam,
        addTeamToLeague,
        getAvailablePlayersForLeague,
        addPlayerToTeam,
        removePlayerFromTeam,
        deleteTeamFromLeague,
        clearAllData
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
