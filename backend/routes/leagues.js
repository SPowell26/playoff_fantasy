const express = require('express');
const router = express.Router();

// Temporary data storage (we'll replace with database later)
let leagues = [
  {
    id: 1,
    name: "Playoff Fantasy League",
    commissioner: "John Doe",
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
    const { name, commissioner } = req.body;
    
    // Basic validation
    if (!name || !commissioner) {
      return res.status(400).json({ error: 'Name and commissioner are required' });
    }
    
    const newLeague = {
      id: leagues.length + 1,
      name,
      commissioner,
      teams: []
    };
    
    leagues.push(newLeague);
    res.status(201).json(newLeague);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create league' });
  }
});

// PUT update league
router.put('/:id', (req, res) => {
  try {
    const { name, commissioner } = req.body;
    const leagueIndex = leagues.findIndex(l => l.id === parseInt(req.params.id));
    
    if (leagueIndex === -1) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    leagues[leagueIndex] = {
      ...leagues[leagueIndex],
      name: name || leagues[leagueIndex].name,
      commissioner: commissioner || leagues[leagueIndex].commissioner
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

module.exports = router; 