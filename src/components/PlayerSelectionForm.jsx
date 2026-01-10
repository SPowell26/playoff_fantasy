import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const PlayerSelectionForm = ({ leagueId, teamId, onPlayerAdded, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper function to format position display
  const formatPosition = (position) => {
    // Convert PK to K for display
    if (position === 'PK') return 'K';
    return position;
  };

  // Fetch all players and check availability
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        // Get all players from backend
        const playersResponse = await fetch(`${API_URL}/api/players`);
        const players = await playersResponse.json();
        
        // Get already selected players for this league (using existing teams endpoint)
        const selectedResponse = await fetch(`${API_URL}/api/leagues/${leagueId}/teams`);
        const teams = await selectedResponse.json();
        
        // Filter to only show QB, RB, WR, TE, PK (kickers), D/ST positions
        const validPositions = ['QB', 'RB', 'WR', 'TE', 'PK', 'D/ST'];
        const available = players.filter(player => validPositions.includes(player.position));
        
        // Debug logging to see what we're getting
        console.log('All players:', players.length);
        console.log('Valid positions:', validPositions);
        console.log('Available players:', available.length);
        console.log('Position breakdown:', players.reduce((acc, player) => {
          acc[player.position] = (acc[player.position] || 0) + 1;
          return acc;
        }, {}));
        
        setAllPlayers(players);
        setAvailablePlayers(available);
        setFilteredPlayers(available);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [leagueId]);

  // Optimistic filtering - immediate UI update on search input
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Filter immediately (optimistic update)
    if (!newSearchTerm.trim()) {
      setFilteredPlayers(availablePlayers);
    } else {
      const filtered = availablePlayers.filter(player => {
        const searchLower = newSearchTerm.toLowerCase();
        const nameMatch = player.name.toLowerCase().includes(searchLower);
        const teamMatch = player.team.toLowerCase().includes(searchLower);
        const positionMatch = player.position.toLowerCase().includes(searchLower);
        // Also allow searching for 'K' to find 'PK' players
        const kSearchMatch = searchLower === 'k' && player.position === 'PK';
        
        return nameMatch || teamMatch || positionMatch || kSearchMatch;
      });
      setFilteredPlayers(filtered);
    }
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  const handleAddPlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const response = await fetch(`${API_URL}/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          player_id: selectedPlayer.id,
          roster_position: 'BN' // Default to bench, can be changed later
        })
      });

      if (response.ok) {
        // Remove from available players
        setAvailablePlayers(prev => 
          prev.filter(p => p.id !== selectedPlayer.id)
        );
        setSelectedPlayer(null);
        setSearchTerm('');
        
        // Notify parent component
        onPlayerAdded(selectedPlayer);
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Add Players to Your Team</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search players by name, team, or position..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Player List */}
        <div className="border border-gray-600 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading players...</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400">No available players found.</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredPlayers.slice(0, 20).map(player => (
                <div
                  key={player.id}
                  className={`p-4 border-b border-gray-600 cursor-pointer transition-colors ${
                    selectedPlayer?.id === player.id 
                      ? 'bg-blue-900/30 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">{player.name}</div>
                      <div className="text-sm text-gray-400">
                        {formatPosition(player.position)} • {player.team}
                      </div>
                    </div>
                    {selectedPlayer?.id === player.id && (
                      <div className="text-blue-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Button */}
        {selectedPlayer && (
          <div className="mt-6 p-4 bg-gray-700 border border-gray-600 rounded-lg text-center">
            <p className="text-gray-300 mb-3">
              Selected: <strong className="text-white">{selectedPlayer.name}</strong>
            </p>
            <button 
              onClick={handleAddPlayer}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              disabled={!selectedPlayer}
            >
              Add {selectedPlayer.name} to Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSelectionForm;