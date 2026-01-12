import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const LeagueSettingsPage = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { leagues, updateLeague, deleteLeague } = useData();
  const { isCommissionerForLeague } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [league, setLeague] = useState(null);
  const [scoringRules, setScoringRules] = useState(null);
  const [rosterStructure, setRosterStructure] = useState(null);
  
  const isCommissioner = isCommissionerForLeague(leagueId);
  
  // Helper function to merge scoring rules with defaults to ensure all fields exist
  const mergeWithDefaults = (rules) => {
    const defaults = getDefaultScoringRules();
    if (!rules) return defaults;
    
    // Deep merge defaults with existing rules
    return {
      offensive: {
        passing: { ...defaults.offensive.passing, ...(rules.offensive?.passing || {}) },
        rushing: { ...defaults.offensive.rushing, ...(rules.offensive?.rushing || {}) },
        receiving: { ...defaults.offensive.receiving, ...(rules.offensive?.receiving || {}) },
        receptionPoints: rules.offensive?.receptionPoints ?? defaults.offensive.receptionPoints ?? 1,
        fumbles: { ...defaults.offensive.fumbles, ...(rules.offensive?.fumbles || {}) }
      },
      defensive: {
        specialTeams: { ...defaults.defensive.specialTeams, ...(rules.defensive?.specialTeams || {}) },
        pointsAllowed: { ...defaults.defensive.pointsAllowed, ...(rules.defensive?.pointsAllowed || {}) },
        teamWinPoints: rules.defensive?.teamWinPoints ?? defaults.defensive.teamWinPoints ?? 6
      },
      kicker: {
        fieldGoals: { ...defaults.kicker.fieldGoals, ...(rules.kicker?.fieldGoals || {}) },
        extraPointPoints: rules.kicker?.extraPointPoints ?? defaults.kicker.extraPointPoints ?? 1,
        fieldGoalsMissedPoints: rules.kicker?.fieldGoalsMissedPoints ?? defaults.kicker.fieldGoalsMissedPoints ?? -1,
        extraPointsMissedPoints: rules.kicker?.extraPointsMissedPoints ?? defaults.kicker.extraPointsMissedPoints ?? -1
      }
    };
  };
  
  // Default roster structure
  const getDefaultRosterStructure = () => ({
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    K: 1,
    DEF: 1,
    FLEX: 1,
    BN: 3
  });
  
  // Find league and initialize scoring rules and roster structure
  useEffect(() => {
    const foundLeague = leagues.find(l => l.id == leagueId);
    if (foundLeague) {
      setLeague(foundLeague);
      // Parse scoring rules if it's a string, otherwise use as-is
      let rules = typeof foundLeague.scoring_rules === 'string' 
        ? JSON.parse(foundLeague.scoring_rules) 
        : foundLeague.scoring_rules;
      
      // Merge with defaults to ensure all fields are present
      rules = mergeWithDefaults(rules);
      setScoringRules(rules);
      
      // Parse roster structure if it's a string, otherwise use as-is
      let roster = typeof foundLeague.roster_structure === 'string' 
        ? JSON.parse(foundLeague.roster_structure) 
        : foundLeague.roster_structure;
      
      // Use default if not present
      if (!roster) {
        roster = getDefaultRosterStructure();
      }
      
      // Merge with defaults to ensure all fields are present
      roster = { ...getDefaultRosterStructure(), ...roster };
      setRosterStructure(roster);
    }
  }, [leagueId, leagues]);
  
  // Redirect if not commissioner
  useEffect(() => {
    if (leagues.length > 0 && !isCommissioner) {
      navigate(`/league/${leagueId}`);
    }
  }, [isCommissioner, leagueId, navigate, leagues.length]);
  
  const getDefaultScoringRules = () => ({
    offensive: {
      passing: { yardsPerPoint: 0.04, touchdownPoints: 4, interceptionPoints: -2 },
      rushing: { yardsPerPoint: 0.1, touchdownPoints: 6 },
      receiving: { yardsPerPoint: 0.1, touchdownPoints: 6 },
      receptionPoints: 1,
      fumbles: { lostPoints: -2 }
    },
    defensive: {
      specialTeams: {
        blockedKickPoints: 2,
        safetyPoints: 2,
        fumbleRecoveryPoints: 1,
        interceptionPoints: 2,
        sackPoints: 1,
        puntReturnTDPoints: 6,
        kickoffReturnTDPoints: 6
      },
      pointsAllowed: {
        shutoutPoints: 10,
        oneToSixPoints: 7,
        sevenToThirteenPoints: 4,
        fourteenToTwentyPoints: 1,
        twentyOneToTwentySevenPoints: 0,
        twentyEightToThirtyFourPoints: -1,
        thirtyFivePlusPoints: -4
      },
      teamWinPoints: 6
    },
    kicker: {
      fieldGoals: {
        zeroToThirtyNinePoints: 3,
        fortyToFortyNinePoints: 4,
        fiftyPlusPoints: 5
      },
      extraPointPoints: 1,
      fieldGoalsMissedPoints: -1,  // Penalty for missed field goals
      extraPointsMissedPoints: -1   // Penalty for missed extra points
    }
  });
  
  const handleScoringRuleChange = (path, value) => {
    const newRules = JSON.parse(JSON.stringify(scoringRules));
    const keys = path.split('.');
    let current = newRules;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = parseFloat(value) || 0;
    setScoringRules(newRules);
  };
  
  const handleRosterStructureChange = (position, value) => {
    const newStructure = { ...rosterStructure };
    const numValue = parseInt(value, 10) || 0;
    if (numValue < 0) return; // Don't allow negative values
    newStructure[position] = numValue;
    setRosterStructure(newStructure);
  };
  
  const handleSave = async () => {
    if (!league || !scoringRules || !rosterStructure) return;
    
    setSaving(true);
    try {
      await updateLeague(league.id, { 
        scoring_rules: scoringRules,
        roster_structure: rosterStructure
      });
      alert('✅ League settings updated successfully!');
      navigate(`/league/${league.id}`);
    } catch (error) {
      console.error('Failed to update league:', error);
      alert(`❌ Failed to update league settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!league) return;
    
    setLoading(true);
    try {
      await deleteLeague(league.id);
      alert('✅ League deleted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete league:', error);
      alert(`❌ Failed to delete league: ${error.message}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  if (!league || !scoringRules || !rosterStructure) {
    return <div className="min-h-screen bg-gray-900 text-white p-6">Loading...</div>;
  }
  
  if (!isCommissioner) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 shadow-lg border-b border-gray-700 mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/league/${league.id}`)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">League Settings</h1>
                <p className="text-gray-300">{league.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-6 pb-6">
        {/* Scoring Rules Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Scoring Rules</h2>
          
          {/* Offensive Scoring */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">Offensive Scoring</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passing */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Passing</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Yards per Point</label>
                    <input
                      type="number"
                      step="0.01"
                      value={scoringRules.offensive.passing.yardsPerPoint}
                      onChange={(e) => handleScoringRuleChange('offensive.passing.yardsPerPoint', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Touchdown Points</label>
                    <input
                      type="number"
                      value={scoringRules.offensive.passing.touchdownPoints}
                      onChange={(e) => handleScoringRuleChange('offensive.passing.touchdownPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Interception Points</label>
                    <input
                      type="number"
                      value={scoringRules.offensive.passing.interceptionPoints}
                      onChange={(e) => handleScoringRuleChange('offensive.passing.interceptionPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Rushing */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Rushing</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Yards per Point</label>
                    <input
                      type="number"
                      step="0.01"
                      value={scoringRules.offensive.rushing.yardsPerPoint}
                      onChange={(e) => handleScoringRuleChange('offensive.rushing.yardsPerPoint', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Touchdown Points</label>
                    <input
                      type="number"
                      value={scoringRules.offensive.rushing.touchdownPoints}
                      onChange={(e) => handleScoringRuleChange('offensive.rushing.touchdownPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Receiving */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Receiving</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Yards per Point</label>
                    <input
                      type="number"
                      step="0.01"
                      value={scoringRules.offensive.receiving.yardsPerPoint}
                      onChange={(e) => handleScoringRuleChange('offensive.receiving.yardsPerPoint', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Touchdown Points</label>
                    <input
                      type="number"
                      value={scoringRules.offensive.receiving.touchdownPoints}
                      onChange={(e) => handleScoringRuleChange('offensive.receiving.touchdownPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Points per Reception (PPR)</label>
                    <input
                      type="number"
                      value={scoringRules.offensive.receptionPoints ?? 1}
                      onChange={(e) => handleScoringRuleChange('offensive.receptionPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
              
              {/* Fumbles */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Fumbles</h4>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Fumbles Lost Points</label>
                  <input
                    type="number"
                    value={scoringRules.offensive.fumbles.lostPoints}
                    onChange={(e) => handleScoringRuleChange('offensive.fumbles.lostPoints', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Defensive Scoring */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Defensive/Special Teams Scoring</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Special Teams */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Special Teams</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Blocked Kick Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.blockedKickPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.blockedKickPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Safety Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.safetyPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.safetyPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Fumble Recovery Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.fumbleRecoveryPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.fumbleRecoveryPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Interception Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.interceptionPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.interceptionPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Sack Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.sackPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.sackPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Punt Return TD Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.puntReturnTDPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.puntReturnTDPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Kickoff Return TD Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.specialTeams.kickoffReturnTDPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.specialTeams.kickoffReturnTDPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Points Allowed */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Points Allowed</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Shutout (0 pts)</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.shutoutPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.shutoutPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">1-6 Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.oneToSixPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.oneToSixPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">7-13 Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.sevenToThirteenPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.sevenToThirteenPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">14-20 Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.fourteenToTwentyPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.fourteenToTwentyPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">21-27 Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.twentyOneToTwentySevenPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.twentyOneToTwentySevenPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">28-34 Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.twentyEightToThirtyFourPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.twentyEightToThirtyFourPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">35+ Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.pointsAllowed.thirtyFivePlusPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.pointsAllowed.thirtyFivePlusPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Team Win Points</label>
                    <input
                      type="number"
                      value={scoringRules.defensive.teamWinPoints}
                      onChange={(e) => handleScoringRuleChange('defensive.teamWinPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Kicker Scoring */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Kicker Scoring</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Field Goals</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">0-39 Yards</label>
                    <input
                      type="number"
                      value={scoringRules.kicker.fieldGoals.zeroToThirtyNinePoints}
                      onChange={(e) => handleScoringRuleChange('kicker.fieldGoals.zeroToThirtyNinePoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">40-49 Yards</label>
                    <input
                      type="number"
                      value={scoringRules.kicker.fieldGoals.fortyToFortyNinePoints}
                      onChange={(e) => handleScoringRuleChange('kicker.fieldGoals.fortyToFortyNinePoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">50+ Yards</label>
                    <input
                      type="number"
                      value={scoringRules.kicker.fieldGoals.fiftyPlusPoints}
                      onChange={(e) => handleScoringRuleChange('kicker.fieldGoals.fiftyPlusPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Extra Points</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Extra Point Points</label>
                    <input
                      type="number"
                      value={scoringRules.kicker.extraPointPoints}
                      onChange={(e) => handleScoringRuleChange('kicker.extraPointPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Missed Extra Point Penalty</label>
                    <input
                      type="number"
                      value={scoringRules.kicker?.extraPointsMissedPoints ?? -1}
                      onChange={(e) => handleScoringRuleChange('kicker.extraPointsMissedPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Penalties</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Missed Field Goal Penalty</label>
                    <input
                      type="number"
                      value={scoringRules.kicker?.fieldGoalsMissedPoints ?? -1}
                      onChange={(e) => handleScoringRuleChange('kicker.fieldGoalsMissedPoints', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => navigate(`/league/${league.id}`)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {/* Roster Structure Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Roster Structure</h2>
          <p className="text-gray-300 mb-6">Customize the number of players at each position for this league.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(rosterStructure).map(([position, count]) => (
              <div key={position} className="bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {position === 'DEF' ? 'D/ST' : position}
                </label>
                <input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => handleRosterStructureChange(position, e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-center text-lg font-semibold"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>Total Roster Spots:</strong>{' '}
              <span className="text-blue-400 font-semibold">
                {Object.values(rosterStructure).reduce((sum, count) => sum + count, 0)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Delete League Section */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-red-700 p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
          <p className="text-gray-300 mb-4">Permanently delete this league. This action cannot be undone.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Delete League
          </button>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Delete League</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong className="text-white">{league.name}</strong>? 
              This will permanently delete the league and all associated teams and data. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {loading ? 'Deleting...' : 'Yes, Delete League'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueSettingsPage;

