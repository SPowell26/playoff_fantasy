import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import CreateLeagueForm from '../components/CreateLeagueForm';

const CreateLeaguePage = () => {
  const navigate = useNavigate();
  const { createLeague } = useData();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (leagueData) => {
    setIsCreating(true);
    try {
      console.log('🏈 Creating league with data:', leagueData);
      
      // Create the league using your DataContext
      const newLeague = await createLeague(
        leagueData.name, 
        leagueData.commissioner, 
        leagueData.commissionerEmail, 
        leagueData.year
      );
      
      console.log('✅ League created successfully:', newLeague);
      
      // Navigate to the new league page
      navigate(`/league/${newLeague.id}`);
      
    } catch (error) {
      console.error('❌ Failed to create league:', error);
      alert(`Failed to create league: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-league-page">
      <div className="page-header">
        <h1>🏈 Create New Fantasy League</h1>
        <p>Set up your playoff fantasy football league</p>
      </div>
      
      <CreateLeagueForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      
      <style jsx>{`
        .create-league-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        
        .page-header {
          text-align: center;
          color: white;
          margin-bottom: 30px;
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .page-header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default CreateLeaguePage;

