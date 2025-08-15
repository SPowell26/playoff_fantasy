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

    const handleRemovePlayer = (playerId) => {
        // Remove player from team using backend API
        console.log('Removing player:', playerId);
    };

    const scoringRules = league.scoring_rules || {};
    
    // Use real stats for scoring calculations
    const teamWithRealStats = {
        ...team,
        players: (team.players || []).map(player => getPlayerWithRealStats(player.id, currentWeek) || player)
    };
    
    const teamTotal = calculateTeamScore(teamWithRealStats, scoringRules);
    const grouped = {};
    teamWithRealStats.players.forEach(player => {
        if (!grouped[player.position]) grouped[player.position] = [];
        grouped[player.position].push(player);
    });
    console.log("grouped players with real stats:", grouped);

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className='text-2xl font-bold'>Team Locker Room</h1>
                <button
                    onClick={() => navigate(`/league/${league.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    ← Back to League
                </button>
            </div>
            
            {/* Team Info */}
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h2 className="text-xl font-semibold mb-2">{team.name}</h2>
                <p><strong>Owner:</strong> {team.owner}</p>
                <p><strong>League:</strong> {league.name}</p>
                <p><strong>Total Score:</strong> {teamTotal.toFixed(2)}</p>
            </div>

            {/* Team Actions */}
            <div className="mb-4">
                <button
                    onClick={() => setShowPlayerSelection(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mr-4"
                >
                    Add Player
                </button>
            </div>

            {/* Week Selection and Stats Loading */}
            <div className="mb-4">
                <div className="flex items-center space-x-4 mb-4">
                    <label className="flex items-center space-x-2">
                        <span>Week:</span>
                        <select 
                            value={currentWeek} 
                            onChange={(e) => setCurrentWeek(parseInt(e.target.value))}
                            className="px-3 py-1 border rounded"
                        >
                            <option value={1}>1 - Wild Card</option>
                            <option value={2}>2 - Divisional</option>
                            <option value={3}>3 - Conference Championship</option>
                            <option value={4}>4 - Super Bowl</option>
                        </select>
                    </label>
                    <button
                        onClick={() => fetchRealStats(currentWeek, 2024)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                        Load Real Stats
                    </button>
                </div>
                
                <div className="flex space-x-2 mb-4">
                    <button 
                        onClick={() => setShowTotal(true)}
                        className={`px-3 py-1 rounded ${showTotal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Total Score
                    </button>
                    <button
                        onClick={() => setShowTotal(false)}
                        className={`px-3 py-1 rounded ${!showTotal ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Weekly Score
                    </button>   
                </div>
            </div>
            
            {Object.keys(grouped).map(position => (
                <div key={position} className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">{position}</h2>
                    <ul>
                        {grouped[position].map(player => (
                            <li key={player.id} className="flex justify-between items-center border-b py-1">
                                <span 
                                    className="cursor-pointer hover:text-blue-600 hover:underline font-medium"
                                    onClick={() => handlePlayerClick(player)}
                                >
                                    {player.name}
                                </span>
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
                    leagueId={league.id}
                    teamId={team.id}
                    onPlayerAdded={handleAddPlayer}
                />
            )}

            {/* Player Stats Modal */}
            <PlayerStatsModal
                player={selectedPlayerForStats}
                isOpen={showPlayerStatsModal}
                onClose={() => setShowPlayerStatsModal(false)}
                week={currentWeek}
                year={2024}
            />
        </div>
        
    );
};

export default TeamPage;