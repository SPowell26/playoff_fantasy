import React from 'react';

const LeagueCard = ({ league, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={() => onSelect(league)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{league.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          league.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {league.status}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Teams:</span>
          <span className="font-medium">{league.currentTeams}/{league.maxTeams}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(league.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Playoff Teams: {league.settings.playoffTeams.join(', ')}
        </div>
      </div>
    </div>
  );
};

export default LeagueCard; 