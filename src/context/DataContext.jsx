import React, { createContext, useContext, useState } from 'react';
import { mockLeagues } from '../data/mockData';
import { nflfastrWeeklyMockData, getAvailablePlayers } from '../data/nflfastr_weekly_mock';
import { useYearly } from './YearlyContext';

// Create the context
const DataContext = createContext();

// Provider component
export function DataProvider({ children }) {
    const [leagues, setLeagues] = useState([]);
    const [players] = useState(nflfastrWeeklyMockData.players);
    const { currentYear, getPlayoffTeamsForYear } = useYearly();
    
    // Basic function to create a new league
    const createLeague = (name, commissioner) => {
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
        return newLeague;
    };

    // Function to delete a league
    const deleteLeague = (leagueId) => {
        setLeagues(leagues.filter(league => league.id !== leagueId));
    };

    //Function to create a new team
    const createTeam = (name, owner) => {
        const newTeam = {
            id: `team_${Date.now()}`,
            name: name,
            owner: owner,
            players: [],
            weeklyScores: [],
            totalScore: 0
        };
        return newTeam;
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

    const value = {
        leagues,
        players,
        createLeague,
        deleteLeague,
        createTeam,
        addTeamToLeague,
        getAvailablePlayersForLeague,
        removePlayerFromTeam,
        deleteTeamFromLeague
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
