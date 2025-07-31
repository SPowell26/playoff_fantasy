import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import { useData } from '../context/DataContext';
import CreateLeagueForm from '../components/CreateLeagueForm';
import DataTest from '../components/DataTest';
import WeeklyDataTest from '../components/WeeklyDataTest';

const Dashboard = () => {
  const { leagues, createLeague, deleteLeague } = useData();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateLeague = (name, commissioner) => {
    const newLeague = createLeague(name, commissioner);
    console.log('Created league:', newLeague);
    setShowCreateForm(false);
  };

  const handleDeleteLeague = (leagueId) => {
    deleteLeague(leagueId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Fantasy Playoff Site</h1>
      {/* Action Buttons */}
      <div className="mb-6">
        <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-4"
        >
            Create New League
        </button>
      </div>
    
      {leagues.map((league,index) => (
        <div key={league.id} className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
          <p className="text-lg"> League {index+ 1}: <Link to={`/league/${league.id}`} className="font-semibold text-green-600 hover:underline ml-2">{league.name}</Link></p>
          <p className="text-sm text-gray-600">ID: {league.id}</p>
          <p className="text-sm text-gray-600">Status: {league.status}</p>
            </div>
            <button
              onClick={() => handleDeleteLeague(league.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
     ))}

                        {/* Data Test Component */}
                  <div className="mt-8">
                    <DataTest />
                  </div>
                  
                  {/* Weekly Data Test Component */}
                  <div className="mt-8">
                    <WeeklyDataTest />
                  </div>
      
      {showCreateForm && (
        <CreateLeagueForm
          onSubmit={handleCreateLeague}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;