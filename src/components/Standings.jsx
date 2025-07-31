import React from 'react';
import { Link } from 'react-router-dom';
import {calculateTeamScore} from '../utils/calculations';

const Standings = ({teams, scoringRules, onDeleteTeam}) => {
    const sortedTeams = [...teams]
    .map(team => ({
        ...team,totalScore: calculateTeamScore(team, scoringRules)
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
    
    return(
        <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Standings</h2>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="pr-4">Rank</th>
            <th className="pr-4">Team</th>
            <th className="pr-4">Score</th>
            {onDeleteTeam && <th className="pr-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team, idx) => (
            <tr key={team.id}>
              <td className="pr-4">{idx + 1}</td>
              <td className="pr-4">
                <Link to={`/team/${team.id}`} className="text-blue-600 hover:underline">
                    {team.name}
                </Link>
              </td>
              <td className="pr-4">{team.totalScore.toFixed(2)}</td>
              {onDeleteTeam && (
                <td className="pr-4">
                  <button
                    onClick={() => onDeleteTeam(team.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
};

export default Standings;