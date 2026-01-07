import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useYearly } from '../context/YearlyContext';
import CreateTeamForm from '../components/CreateTeamForm';
import LeagueStandings from '../components/LeagueStandings';
import { API_URL } from '../config/api';

const LeaguePage = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { leagues, createTeam, addTeamToLeague, fetchRealStats } = useData();
  const { currentWeek, nflSeasonYear } = useYearly();
  
  // State for spam modal
  const [spamLoading, setSpamLoading] = useState(false);
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamMessage, setSpamMessage] = useState('');
  const [spamSubject, setSpamSubject] = useState('');
  
  // State for team creation modal
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  
  // Find the league from DataContext - handle both string and integer IDs
  const league = leagues.find(l => l.id == leagueId); // Use == instead of === for type coercion
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const isCommissioner = league?.commissioner === 'Current User'; // Replace with actual auth

  // Debug logging
  console.log('🔍 LeaguePage Debug:', {
    leagueId,
    leagueIdType: typeof leagueId,
    leaguesCount: leagues.length,
    leagues: leagues.map(l => ({ id: l.id, idType: typeof l.id, name: l.name })),
    foundLeague: league
  });

  // Fetch teams from backend
  const fetchTeams = async () => {
    if (!league) return;
    
    try {
      setTeamsLoading(true);
      console.log('🔄 Fetching teams for league:', league.id);
      
      const response = await fetch(`${API_URL}/api/leagues/${league.id}/teams`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const teamsData = await response.json();
      console.log('✅ Fetched teams:', teamsData);
      
      // Fetch rosters for each team
      const teamsWithRosters = await Promise.all(
        teamsData.map(async (team) => {
          try {
            const rosterResponse = await fetch(`${API_URL}/api/teams/${team.id}/players`);
            if (rosterResponse.ok) {
              const rosterData = await rosterResponse.json();
              return { ...team, players: rosterData };
            }
            return { ...team, players: [] };
          } catch (error) {
            console.error(`❌ Failed to fetch roster for team ${team.id}:`, error);
            return { ...team, players: [] };
          }
        })
      );
      
      console.log('✅ Fetched teams with rosters:', teamsWithRosters);
      setTeams(teamsWithRosters);
      
    } catch (error) {
      console.error('❌ Failed to fetch teams:', error);
      setTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // Redirect if league not found and fetch teams
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { leagueId, league, leaguesCount: leagues.length });
    
    if (!league) {
      console.error('❌ League not found:', { leagueId, leaguesCount: leagues.length });
      // Don't redirect immediately - give it a chance to load
      if (leagues.length > 0) {
        console.log('⚠️ Leagues exist but this one not found - redirecting');
        navigate('/');
      }
      return;
    }
    
    // Fetch teams when league is found
    console.log('✅ League found, fetching teams');
    fetchTeams();
  }, [league, leagueId, navigate, leagues.length]);

  // Fetch real stats when currentWeek and nflSeasonYear are available
  useEffect(() => {
    if (currentWeek && nflSeasonYear && league) {
      console.log('🔄 Fetching real stats for league page:', { currentWeek, nflSeasonYear, league: league.name });
      fetchRealStats(currentWeek, nflSeasonYear);
    }
  }, [currentWeek, nflSeasonYear, league?.id]);

  const handleSpamMembers = async () => {
    // Set default message if empty
    const defaultMessage = `🏈 Week ${league.current_week} Update for ${league.name}! Check your standings and make sure your lineup is set!`;
    const defaultSubject = `Fantasy Playoff Update - ${league.name}`;
    
    setSpamMessage(defaultMessage);
    setSpamSubject(defaultSubject);
    setShowSpamModal(true);
  };

  const sendSpamMessage = async () => {
    setSpamLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/leagues/${leagueId}/spam-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: spamMessage,
          subject: spamSubject
        })
      });

      if (response.ok) {
        alert('✅ Message sent to all league members!');
        setShowSpamModal(false);
        setSpamMessage('');
        setSpamSubject('');
      } else {
        alert('❌ Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error spamming members:', error);
      alert('❌ Error sending message. Please try again.');
    } finally {
      setSpamLoading(false);
    }
  };

  if (!league) return <div className="min-h-screen bg-gray-900 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-lg border-b border-gray-700 mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{league.name}</h1>
                <p className="text-gray-300">Commissioner: {league.commissioner} • Year: {league.year}</p>
              </div>
            </div>
            
            {/* Commissioner Controls */}
            {isCommissioner && (
              <div className="flex space-x-3">
                <button 
                  onClick={handleSpamMembers}
                  disabled={spamLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                >
                  {spamLoading ? '📧 Sending...' : '📧 Spam Members'}
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg">⚙️ League Settings</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Team Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6 border border-gray-700">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Teams</h2>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors shadow-lg font-semibold text-lg"
          >
            ➕ Create New Team
          </button>
        </div>
      </div>

      {/* League Standings */}
      {teamsLoading ? (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-300 text-center">Loading standings...</p>
        </div>
      ) : (
        <LeagueStandings 
          teams={teams} 
          league={league} 
          currentWeek={currentWeek} 
          currentYear={nflSeasonYear} 
        />
      )}

      {/* Spam Modal */}
      {showSpamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">📧 Send Message to League Members</h3>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium">Subject:</label>
              <input
                type="text"
                value={spamSubject}
                onChange={(e) => setSpamSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">Message:</label>
              <textarea
                value={spamMessage}
                onChange={(e) => setSpamMessage(e.target.value)}
                placeholder="Enter your message..."
                rows="6"
                className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowSpamModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={sendSpamMessage}
                disabled={spamLoading || !spamMessage.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {spamLoading ? '📧 Sending...' : '📧 Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <CreateTeamForm
          onSubmit={async (teamName, owner) => {
            try {
              console.log('🏈 Creating team:', { teamName, owner, leagueId: league.id });
              const newTeam = await createTeam(teamName, owner, league.id);
              console.log('✅ Team created:', newTeam);
              
              // Refresh teams instead of reloading the page
              await fetchTeams();
              
            } catch (error) {
              console.error('❌ Failed to create team:', error);
              alert(`Failed to create team: ${error.message}`);
            } finally {
              setShowCreateTeamModal(false);
            }
          }}
          onCancel={() => setShowCreateTeamModal(false)}
        />
      )}
    </div>
  );
};

export default LeaguePage; 