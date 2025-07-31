import React, { useState } from 'react';
import {useParams, Link} from 'react-router-dom';
import { useData } from '../context/DataContext';
import CreateTeamForm from '../components/CreateTeamForm';
import Standings from '../components/Standings';

const LeaguePage = () => {
    const {leagueId} = useParams();
    const { leagues, createTeam, addTeamToLeague, deleteTeamFromLeague } = useData();
    const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);
    const league = leagues.find(l => l.id === leagueId);
    
    if (!league) {
        return <div className="p-8">League not found</div>;
    }

    const handleCreateTeam = (name, owner) => {
        const newTeam = createTeam(name, owner);
        addTeamToLeague(leagueId, newTeam);
        setShowCreateTeamForm(false);
    };

    const handleDeleteTeam = (teamId) => {
        deleteTeamFromLeague(leagueId, teamId);
    };
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">League Portal</h1>
            <p className="mb-2 text-gray-600">League ID: {league.name}</p>
            <p className="mb-2 text-gray-600">Status: {league.status}</p>
            <p className="mb-4 text-gray-600">Teams: {league.currentTeams}/{league.maxTeams}</p>
            
            <div className="mb-6">
                <button
                    onClick={() => setShowCreateTeamForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                    Add Team
                </button>
            </div>
            <Standings 
                teams={league.teams} 
                scoringRules={league.settings.scoringRules}
                onDeleteTeam={handleDeleteTeam}
            />
            
            {showCreateTeamForm && (
                <CreateTeamForm
                    onSubmit={handleCreateTeam}
                    onCancel={() => setShowCreateTeamForm(false)}
                />
            )}
        </div>
    );
};

export default LeaguePage;