import React, {useState} from 'react';

const PlayerSelectionForm = ({ availablePlayers, onSubmit, onCancel}) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [filterPosition, setFilterPosition] = useState('ALL');

    //Group players by position
    const groupedPlayers = availablePlayers.reduce((acc,player) => {
        if (!acc[player.position]) {
            acc[player.position] = [];
        }
        acc[player.position].push(player);
        return acc;
    }, {});

    //Get unique positions for filter
    const positions = ['ALL', ...Object.keys(groupedPlayers).sort()];

    //Filter players by position
    const filteredPlayers = filterPosition === 'ALL'
        ? availablePlayers
        : groupedPlayers[filterPosition] || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        if( selectedPlayer) {
            onSubmit(selectedPlayer);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Select Player</h2>
            
            {/* Position Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Position
              </label>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {positions.map(position => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
    
            {/* Player List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Available Players ({filteredPlayers.length})
              </h3>
              
              {filteredPlayers.length === 0 ? (
                <p className="text-gray-500">No players available for this position.</p>
              ) : (
                <div className="space-y-2">
                  {filteredPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlayer?.id === player.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{player.name}</h4>
                          <p className="text-sm text-gray-600">
                            {player.position} • {player.nflTeam}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {selectedPlayer?.id === player.id && (
                            <span className="text-blue-600">✓ Selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
    
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedPlayer}
                className={`px-4 py-2 rounded-md ${
                  selectedPlayer
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Add Player
              </button>
            </div>
          </div>
        </div>
      );
};

export default PlayerSelectionForm