import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LeaguePage = () => {
  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [spamLoading, setSpamLoading] = useState(false);
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamMessage, setSpamMessage] = useState('');
  const [spamSubject, setSpamSubject] = useState('');

  useEffect(() => {
    fetchLeagueData();
  }, [leagueId]);

  const fetchLeagueData = async () => {
    try {
      const [leagueRes, teamsRes] = await Promise.all([
        fetch(`/api/leagues/${leagueId}`),
        fetch(`/api/leagues/${leagueId}/teams`)
      ]);
      
      const leagueData = await leagueRes.json();
      const teamsData = await teamsRes.json();
      
      setLeague(leagueData);
      setTeams(teamsData);
      setIsCommissioner(leagueData.commissioner === 'Current User'); // Replace with actual auth
    } catch (error) {
      console.error('Error fetching league data:', error);
    }
  };

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

      {/* Teams Grid */}
      <div className="teams-grid">
        <h2>Teams</h2>
        <div className="teams-container">
          {teams.map(team => (
            <div 
              key={team.id} 
              className="team-card"
              onClick={() => window.location.href = `/teams/${team.id}`}
            >
              <h3>{team.name}</h3>
              <p>Owner: {team.owner}</p>
              <div className="team-stats">
                <span>Players: {team.player_count || 0}</span>
                <span>Points: {team.total_points || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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