import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateLeagueStandings } from '../utils/teamScoreUtils';
import { useData } from '../context/DataContext';

const LeagueStandings = ({ teams, league, currentWeek, currentYear }) => {
  const navigate = useNavigate();
  const { getPlayerWithRealStats } = useData();

  // Calculate team scores and rankings using modular utility
  const teamStandings = useMemo(() => {
    console.log('🏈 LeagueStandings useMemo triggered:', {
      teams: teams?.length || 0,
      currentWeek,
      currentYear,
      league: league?.name
    });

    if (!teams || teams.length === 0) return [];

    // Use modular utility function (same logic as TeamPage)
    return calculateLeagueStandings(teams, league, getPlayerWithRealStats, currentWeek);
  }, [teams, league, currentWeek, currentYear, getPlayerWithRealStats]);

  // Get medal emoji for top 3
  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  // Handle team click
  const handleTeamClick = (teamId) => {
    navigate(`/team/${teamId}`);
  };

  if (!teams || teams.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">League Standings</h2>
        <p className="text-gray-400 text-center">No teams yet. Create your first team to see standings!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">
        League Standings - Week {currentWeek}
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Rank</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Team Name</th>
              <th className="text-right py-3 px-4 text-gray-300 font-medium">Week {currentWeek}</th>
              <th className="text-right py-3 px-4 text-gray-300 font-medium">Season Total</th>
              <th className="text-center py-3 px-4 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamStandings.map((team) => (
              <tr 
                key={team.id}
                className="border-b border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => handleTeamClick(team.id)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getRankEmoji(team.rank)}</span>
                    <span className="text-white font-medium">#{team.rank}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="text-white font-medium">{team.name}</div>
                    <div className="text-gray-400 text-sm">Owner: {team.owner}</div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-blue-400 font-semibold text-lg">
                    {team.weeklyScore > 0 ? team.weeklyScore.toFixed(1) : '0.0'}
                  </span>
                  <div className="text-xs text-gray-400">pts</div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-green-400 font-semibold text-lg">
                    {team.totalScore > 0 ? team.totalScore.toFixed(1) : '0.0'}
                  </span>
                  <div className="text-xs text-gray-400">pts</div>
                </td>
                <td className="py-4 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeamClick(team.id);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueStandings;