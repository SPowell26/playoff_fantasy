import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [leagues, setLeagues] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues');
      const leaguesData = await response.json();
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="loading">Loading your leagues...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🏈 Fantasy Playoff Dashboard</h1>
        <p>Manage your fantasy football leagues</p>
      </div>

      {/* Create New League Button */}
      <div className="create-league-section">
        <Link to="/create-league" className="create-league-button">
          ➕ Create New League
        </Link>
      </div>

      {/* Leagues by Year */}
      {sortedYears.length === 0 ? (
        <div className="no-leagues">
          <h2>No leagues yet!</h2>
          <p>Create your first fantasy playoff league to get started.</p>
        </div>
      ) : (
        sortedYears.map(year => (
          <div key={year} className="year-section">
            <h2 className="year-header">
              {year === currentYear.toString() ? '🏆 Current Season' : `📚 ${year} Season`}
            </h2>
            
            <div className="leagues-grid">
              {leaguesByYear[year].map(league => (
                <div key={league.id} className="league-card">
                  <div className="league-card-header">
                    <h3>{league.name}</h3>
                    <span className={`status-badge ${league.year === currentYear ? 'active' : 'past'}`}>
                      {league.year === currentYear ? 'Active' : 'Past'}
                    </span>
                  </div>
                  
                  <div className="league-info">
                    <p><strong>Commissioner:</strong> {league.commissioner}</p>
                    <p><strong>Teams:</strong> {league.teams?.length || 0}</p>
                    <p><strong>Current Week:</strong> {league.current_week || 'Not Started'}</p>
                  </div>

                  <div className="league-actions">
                    <Link 
                      to={`/leagues/${league.id}`} 
                      className="view-league-button"
                    >
                      👁️ View League
                    </Link>
                    
                    {league.year === currentYear && (
                      <Link 
                        to={`/leagues/${league.id}/manage`} 
                        className="manage-league-button"
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

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 16px;
        }

        .dashboard-header h1 {
          margin: 0 0 10px 0;
          font-size: 3rem;
        }

        .dashboard-header p {
          margin: 0;
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .create-league-section {
          text-align: center;
          margin-bottom: 40px;
        }

        .create-league-button {
          display: inline-block;
          background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
          color: white;
          padding: 15px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: bold;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .create-league-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .year-section {
          margin-bottom: 50px;
        }

        .year-header {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
          font-size: 2rem;
          border-bottom: 3px solid #667eea;
          padding-bottom: 10px;
        }

        .leagues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 25px;
        }

        .league-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          padding: 25px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .league-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .league-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .league-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .league-card-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.4rem;
        }

        .status-badge {
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.active {
          background-color: #4caf50;
          color: white;
        }

        .status-badge.past {
          background-color: #9e9e9e;
          color: white;
        }

        .league-info {
          margin-bottom: 20px;
        }

        .league-info p {
          margin: 8px 0;
          color: #666;
        }

        .league-info strong {
          color: #333;
        }

        .league-actions {
          display: flex;
          gap: 10px;
        }

        .view-league-button, .manage-league-button {
          flex: 1;
          padding: 10px 15px;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.3s ease;
        }

        .view-league-button {
          background-color: #667eea;
          color: white;
        }

        .view-league-button:hover {
          background-color: #5a6fd8;
          transform: translateY(-2px);
        }

        .manage-league-button {
          background-color: #4ecdc4;
          color: white;
        }

        .manage-league-button:hover {
          background-color: #45b7aa;
          transform: translateY(-2px);
        }

        .no-leagues {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .no-leagues h2 {
          color: #333;
          margin-bottom: 10px;
        }

        .loading {
          text-align: center;
          padding: 60px;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 