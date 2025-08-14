import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CreateTeamForm from '../components/CreateTeamForm';

const LeaguePage = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { leagues, createTeam, addTeamToLeague } = useData();
  
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
      
      const response = await fetch(`http://localhost:3001/api/leagues/${league.id}/teams`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const teamsData = await response.json();
      console.log('✅ Fetched teams:', teamsData);
      setTeams(teamsData);
      
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
      const response = await fetch(`/api/leagues/${leagueId}/spam-members`, {
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

  if (!league) return <div>Loading...</div>;

  return (
    <div className="league-page">
      <div className="league-header">
        <h1>{league.name}</h1>
        <p>Commissioner: {league.commissioner}</p>
        <p>Year: {league.year}</p>
        
                 {/* Commissioner Controls */}
         {isCommissioner && (
           <div className="commissioner-controls">
             <button 
               onClick={handleSpamMembers}
               disabled={spamLoading}
               className="spam-button"
             >
               {spamLoading ? '📧 Sending...' : '📧 Spam Members'}
             </button>
             <button className="settings-button">⚙️ League Settings</button>
           </div>
         )}

         {/* Spam Modal */}
         {showSpamModal && (
           <div className="modal-overlay">
             <div className="spam-modal">
               <h3>📧 Send Message to League Members</h3>
               
               <div className="form-group">
                 <label>Subject:</label>
                 <input
                   type="text"
                   value={spamSubject}
                   onChange={(e) => setSpamSubject(e.target.value)}
                   placeholder="Enter email subject..."
                   className="form-input"
                 />
               </div>

               <div className="form-group">
                 <label>Message:</label>
                 <textarea
                   value={spamMessage}
                   onChange={(e) => setSpamMessage(e.target.value)}
                   placeholder="Enter your message..."
                   rows="6"
                   className="form-textarea"
                 />
               </div>

               <div className="modal-actions">
                 <button 
                   onClick={() => setShowSpamModal(false)}
                   className="cancel-button"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={sendSpamMessage}
                   disabled={spamLoading || !spamMessage.trim()}
                   className="send-button"
                 >
                   {spamLoading ? '📧 Sending...' : '📧 Send Message'}
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>

      {/* Create Team Section */}
      <div className="create-team-section">
        <h2>Teams</h2>
        <button
          onClick={() => setShowCreateTeamModal(true)}
          className="create-team-button"
        >
          ➕ Create New Team
        </button>
      </div>

             {/* Teams Grid */}
       <div className="teams-grid">
         <h2>Teams ({teams.length})</h2>
         {teamsLoading ? (
           <p>Loading teams...</p>
         ) : teams.length === 0 ? (
           <p>No teams yet. Create your first team above!</p>
         ) : (
           <div className="teams-container">
             {teams.map(team => (
               <div 
                 key={team.id} 
                 className="team-card"
                 onClick={() => navigate(`/team/${team.id}`)}
               >
                 <h3>{team.name}</h3>
                 <p>Owner: {team.owner}</p>
                 <div className="team-stats">
                   <span>Players: {team.players?.length || 0}</span>
                   <span>Points: {team.total_points || 0}</span>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>

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

      <style jsx>{`
        .league-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .league-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          text-align: center;
        }

        .league-header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
        }

        .commissioner-controls {
          margin-top: 20px;
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .spam-button, .settings-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .spam-button {
          background-color: #ff6b6b;
          color: white;
        }

        .spam-button:hover:not(:disabled) {
          background-color: #ff5252;
          transform: translateY(-2px);
        }

        .spam-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .settings-button {
          background-color: #4ecdc4;
          color: white;
        }

        .settings-button:hover {
          background-color: #45b7aa;
          transform: translateY(-2px);
        }

        .teams-grid {
          margin-top: 30px;
        }

        .teams-grid h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        .teams-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .team-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .team-card:hover {
          border-color: #667eea;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .team-card h3 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.3rem;
        }

        .team-card p {
          margin: 5px 0;
          color: #666;
        }

        .team-stats {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

                 .team-stats span {
           background-color: #f8f9fa;
           padding: 5px 10px;
           border-radius: 15px;
           font-size: 14px;
           color: #555;
         }

         /* Modal Styles */
         .modal-overlay {
           position: fixed;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background-color: rgba(0, 0, 0, 0.5);
           display: flex;
           align-items: center;
           justify-content: center;
           z-index: 1000;
         }

         .spam-modal {
           background: white;
           border-radius: 12px;
           padding: 30px;
           max-width: 500px;
           width: 90%;
           max-height: 80vh;
           overflow-y: auto;
           box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
         }

         .spam-modal h3 {
           margin: 0 0 20px 0;
           color: #333;
           text-align: center;
         }

         .form-group {
           margin-bottom: 20px;
         }

         .form-group label {
           display: block;
           margin-bottom: 8px;
           font-weight: bold;
           color: #333;
         }

         .form-input, .form-textarea {
           width: 100%;
           padding: 12px;
           border: 2px solid #e0e0e0;
           border-radius: 8px;
           font-size: 14px;
           transition: border-color 0.3s ease;
         }

         .form-input:focus, .form-textarea:focus {
           outline: none;
           border-color: #667eea;
         }

         .form-textarea {
           resize: vertical;
           min-height: 120px;
         }

         .modal-actions {
           display: flex;
           gap: 15px;
           justify-content: flex-end;
           margin-top: 25px;
         }

         .cancel-button, .send-button {
           padding: 12px 24px;
           border: none;
           border-radius: 8px;
           font-size: 16px;
           cursor: pointer;
           transition: all 0.3s ease;
         }

         .cancel-button {
           background-color: #f8f9fa;
           color: #666;
           border: 2px solid #e0e0e0;
         }

         .cancel-button:hover {
           background-color: #e9ecef;
         }

         /* Team Creation Styles */
         .create-team-section {
           background: white;
           padding: 25px;
           border-radius: 12px;
           box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
           margin-bottom: 30px;
           text-align: center;
         }

         .create-team-section h2 {
           margin: 0 0 20px 0;
           color: #333;
         }

         .create-team-button {
           padding: 15px 30px;
           background-color: #28a745;
           color: white;
           border: none;
           border-radius: 8px;
           font-size: 16px;
           cursor: pointer;
           transition: all 0.3s ease;
           font-weight: bold;
         }

         .create-team-button:hover {
           background-color: #218838;
           transform: translateY(-2px);
           box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
         }

         .send-button {
           background-color: #ff6b6b;
           color: white;
         }

         .send-button:hover:not(:disabled) {
           background-color: #ff5252;
           transform: translateY(-2px);
         }

         .send-button:disabled {
           background-color: #ccc;
           cursor: not-allowed;
         }
       `}</style>
    </div>
  );
};

export default LeaguePage; 