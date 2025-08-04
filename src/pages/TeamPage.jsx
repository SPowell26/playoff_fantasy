import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { calculateTeamScore, calculatePlayerScore} from '../utils/calculations';
import PlayerSelectionForm from '../components/PlayerSelectionForm';


const TeamPage = () => {
    const {teamId} = useParams();
    const [showTotal, setShowTotal] = useState(true);
    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editStats, setEditStats] = useState({});
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);
    const { leagues, getAvailablePlayersForLeague, addPlayerToTeam, removePlayerFromTeam } = useData();
    
    let team, league;
    for (const l of leagues) {
        const found = l.teams.find(t => t.id === teamId);
        if (found) {
            team = found;
            league = l;
            break;
        }
    }

    if (!team || !league) {
        return <div>Team not found</div>
    }

    const handleAddPlayer = (selectedPlayer) => {
        // Add player to the team using proper state management
        addPlayerToTeam(league.id, team.id, selectedPlayer);
        setShowPlayerSelection(false);
    };

    const handleRemovePlayer = (playerId) => {
        removePlayerFromTeam(league.id, team.id, playerId);
    };

    const scoringRules = league.settings.scoringRules;
    const teamTotal = calculateTeamScore(team, scoringRules)
    const grouped = {};
    team.players.forEach(player => {
        if (!grouped[player.position]) grouped[player.position] = [];
        grouped[player.position].push(player);
    });
    console.log("grouped players:", grouped);

        
    //placeholder
    return (
        <div className="mb-4">
            <h1 className='text-2xl font-bold mb-4'>Team Locker Room</h1>
            {/* Team info and roster here*/}
            <div className="mb-4">
                <button
                    onClick={() => setShowPlayerSelection(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mr-4"
                >
                    Add Player
                </button>
            </div>
            <div className="mb-4">
            <button 
                onClick={() => setShowTotal(true)}
                className={`mr-2 px-3 py-1 rounded ${showTotal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
                Total Score
            </button>
            <button
                onClick={() => setShowTotal(false)}
                className={`px-3 py-1 rounded ${!showTotal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                disabled // Disable for now, until you implement weekly logic
            >
                Weekly Score
            </button>   
            </div>
            
            {Object.keys(grouped).map(position => (
                <div key={position} className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">{position}</h2>
                    <ul>
                        {grouped[position].map(player => (
                            <li key={player.id} className="flex justify-between items-center border-b py-1">
                                <span>{player.name}</span>
                                <span>Points: {calculatePlayerScore(player, scoringRules).toFixed(2)}</span>
                                <div className="flex space-x-2">
                                    <button className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                        onClick={() => {
                                            setEditingPlayerId(player.id);
                                            setEditStats(player.stats);
                                        }}
                                    >
                                        Edit Stats
                                    </button>
                                    <button 
                                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                        onClick={() => handleRemovePlayer(player.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <div className="mb-6 text-lg font-semibold">
                Team {showTotal ? 'Total' : 'Weekly'} Score: {teamTotal}
            </div>
            {editingPlayerId && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Edit Stats</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          // Find the player and update their stats
          const player = team.players.find(p => p.id === editingPlayerId);
          if (player) {
            player.stats = { ...editStats };
          }
          setEditingPlayerId(null);
        }}
        className="flex flex-col gap-2"
      >
        {/* Add an input for each stat you want to edit */}
        <label>
          Passing Yards:
          <input
            type="number"
            value={editStats.passingYards || ''}
            onChange={e => setEditStats({ ...editStats, passingYards: Number(e.target.value) })}
            className="ml-2 px-2 py-1 border rounded"
          />
        </label>
        <label>
          Passing TD:
          <input
            type="number"
            value={editStats.passingTD || ''}
            onChange={e => setEditStats({ ...editStats, passingTD: Number(e.target.value) })}
            className="ml-2 px-2 py-1 border rounded"
          />
        </label>
        <label>
          Rushing Yards:
          <input
            type="number"
            value={editStats.rushingYards || ''}
            onChange={e => setEditStats({ ...editStats, rushingYards: Number(e.target.value) })}
            className="ml-2 px-2 py-1 border rounded"
          />
        </label>
        {/* Add more fields as needed */}
        <div className="flex justify-end gap-2 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            onClick={() => setEditingPlayerId(null)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
            {showPlayerSelection && (
                <PlayerSelectionForm
                    availablePlayers={getAvailablePlayersForLeague(league.id)}
                    onSubmit={handleAddPlayer}
                    onCancel={() => setShowPlayerSelection(false)}
                />
            )}
        </div>
        
    );
};

export default TeamPage;