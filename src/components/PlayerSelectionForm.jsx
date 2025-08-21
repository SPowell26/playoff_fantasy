import React, { useState, useEffect } from 'react';

const PlayerSelectionForm = ({ leagueId, teamId, onPlayerAdded }) => {
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
        const playersResponse = await fetch('http://localhost:3001/api/players');
        const players = await playersResponse.json();
        
        // Get already selected players for this league (using existing teams endpoint)
        const selectedResponse = await fetch(`http://localhost:3001/api/leagues/${leagueId}/teams`);
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
      const response = await fetch(`http://localhost:3001/api/teams/${teamId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="player-selection-form">
      <h3>Add Players to Your Team</h3>
      
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search players by name, team, or position..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Player List */}
      <div className="player-list">
        {loading ? (
          <p>Loading players...</p>
        ) : filteredPlayers.length === 0 ? (
          <p>No available players found.</p>
        ) : (
          filteredPlayers.slice(0, 20).map(player => (
            <div
              key={player.id}
              className={`player-item ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
              onClick={() => handlePlayerSelect(player)}
            >
              <div className="player-info">
                <span className="player-name">{player.name}</span>
                <span className="player-details">
                  {formatPosition(player.position)} • {player.team}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Button */}
      {selectedPlayer && (
        <div className="add-player-section">
          <p>Selected: <strong>{selectedPlayer.name}</strong></p>
          <button 
            onClick={handleAddPlayer}
            className="add-button"
            disabled={!selectedPlayer}
          >
            Add {selectedPlayer.name} to Team
          </button>
        </div>
      )}

      <style jsx>{`
        .player-selection-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .search-container {
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .player-list {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .player-item {
          padding: 12px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .player-item:hover {
          background-color: #f5f5f5;
        }

        .player-item.selected {
          background-color: #e3f2fd;
          border-left: 4px solid #2196f3;
        }

        .player-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .player-name {
          font-weight: bold;
        }

        .player-details {
          color: #666;
          font-size: 14px;
        }

        .add-player-section {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          text-align: center;
        }

        .add-button {
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
        }

        .add-button:hover {
          background-color: #45a049;
        }

        .add-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PlayerSelectionForm;