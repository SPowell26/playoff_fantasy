import React from 'react';
import { Link } from 'react-router-dom';
import WeekStatus from '../components/WeekStatus';
import { useData } from '../context/DataContext';

const Dashboard = () => {
  const { leagues } = useData();
  const currentYear = new Date().getFullYear();

  // Group leagues by year
  const leaguesByYear = leagues.reduce((acc, league) => {
    if (!acc[league.year]) {
      acc[league.year] = [];
    }
    acc[league.year].push(league);
    return acc;
  }, {});

  // Sort years in descending order (newest first)
  const sortedYears = Object.keys(leaguesByYear).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-lg border-b border-gray-700 mb-6">
        <div className="px-6 py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">🏈 Fantasy Playoff Dashboard</h1>
          <p className="text-xl text-gray-300">Manage your fantasy football leagues</p>
        </div>
      </div>

      {/* Current Week Status */}
      <div className="mb-8">
        <WeekStatus />
      </div>

      {/* Create New League Button */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700 text-center">
        <Link to="/create-league" className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 rounded-lg transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          ➕ Create New League
        </Link>
      </div>

      {/* Leagues by Year */}
      {sortedYears.length === 0 ? (
        <div className="bg-gray-800 p-12 rounded-lg border border-gray-700 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">No leagues yet!</h2>
          <p className="text-gray-400 text-lg">Create your first fantasy playoff league to get started.</p>
        </div>
      ) : (
        sortedYears.map(year => (
          <div key={year} className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center border-b-2 border-blue-600 pb-3">
              {year === currentYear.toString() ? '🏆 Current Season' : `📚 ${year} Season`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leaguesByYear[year].map(league => (
                <div key={league.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 transition-all duration-200 hover:border-blue-500 hover:shadow-lg hover:transform hover:-translate-y-1">
                  <div className="relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
                  </div>
                  
                  <div className="mt-2 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-white">{league.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        league.year === currentYear 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {league.year === currentYear ? 'Active' : 'Past'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-300"><span className="font-medium text-gray-200">Commissioner:</span> {league.commissioner}</p>
                      <p className="text-gray-300"><span className="font-medium text-gray-200">Teams:</span> {league.teams?.length || 0}</p>
                      <p className="text-gray-300"><span className="font-medium text-gray-200">Current Week:</span> {league.current_week || 'Not Started'}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link 
                      to={`/league/${league.id}`} 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                    >
                      👁️ View League
                    </Link>
                    
                    {league.year === currentYear && (
                      <Link 
                        to={`/league/${league.id}/manage`} 
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
                      >
                        ⚙️ Manage
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard; 