import express from 'express';
const router = express.Router();

// Import league rules for defaults
import { getDefaultScoringRules } from '../../league-rules.js';

// Temporary data storage (we'll replace with database later)
let leagues = [
  {
    id: 1,
    name: "Playoff Fantasy League",
    commissioner: "John Doe",
    scoring_rules: leagueSpecificScoringRules(), // Default scoring rules
    teams: [
      {
        id: 1,
        name: "Team Alpha",
        owner: "Alice",
        players: []
      }
    ]
  }
];

// GET all leagues
router.get('/', (req, res) => {
  try {
    res.json(leagues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});

// GET single league by ID
router.get('/:id', (req, res) => {
  try {
    const league = leagues.find(l => l.id === parseInt(req.params.id));
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    res.json(league);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch league' });
  }
});

// POST create new league
router.post('/', (req, res) => {
  try {
    const { name, commissioner, commissionerEmail, year, scoring_rules } = req.body;
    
    // Basic validation
    if (!name || !commissioner || !commissionerEmail) {
      return res.status(400).json({ error: 'Name, commissioner, and commissioner email are required' });
    }
    
    // Create the league
    const newLeague = {
      id: leagues.length + 1,
      name,
      commissioner,
      year: year || new Date().getFullYear(),
      scoring_rules: scoring_rules || getDefaultScoringRules(),
      teams: []
    };
    
    // Create first team for commissioner
    const commissionerTeam = {
      id: 1,
      name: `${commissioner}'s Team`,
      owner: commissioner,
      players: []
    };
    
    // Add team to league
    newLeague.teams.push(commissionerTeam);
    
    // Add league to storage
    leagues.push(newLeague);
    
    // Return league with commissioner info
    res.status(201).json({
      ...newLeague,
      commissionerInfo: {
        email: commissionerEmail,
        name: commissioner,
        teamId: commissionerTeam.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create league' });
  }
});

// PUT update league
router.put('/:id', (req, res) => {
  try {
    const { name, commissioner, scoring_rules } = req.body;
    const leagueIndex = leagues.findIndex(l => l.id === parseInt(req.params.id));
    
    if (leagueIndex === -1) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    leagues[leagueIndex] = {
      ...leagues[leagueIndex],
      name: name || leagues[leagueIndex].name,
      commissioner: commissioner || leagues[leagueIndex].commissioner,
      scoring_rules: scoring_rules || leagues[leagueIndex].scoring_rules
    };
    
    res.json(leagues[leagueIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update league' });
  }
});

// DELETE league
router.delete('/:id', (req, res) => {
  try {
    const leagueIndex = leagues.findIndex(l => l.id === parseInt(req.params.id));
    
    if (leagueIndex === -1) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    leagues.splice(leagueIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete league' });
  }
});

export default router; 