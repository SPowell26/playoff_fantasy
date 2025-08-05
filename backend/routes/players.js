const express = require('express');
const router = express.Router();

// Import mock data (we'll replace with database later)
const mockPlayers = [
  {
    id: 1,
    name: "Tom Brady",
    position: "QB",
    playoff_team: "Tampa Bay",
    fantasy_points: 285.5,
    stats: {
      passing_yards: 4500,
      passing_touchdowns: 25,
      interceptions: 12,
      rushing_yards: 50,
      rushing_touchdowns: 2
    }
  },
  {
    id: 2,
    name: "Patrick Mahomes",
    position: "QB",
    playoff_team: "Kansas City",
    fantasy_points: 320.8,
    stats: {
      passing_yards: 4800,
      passing_touchdowns: 35,
      interceptions: 8,
      rushing_yards: 150,
      rushing_touchdowns: 3
    }
  },
  {
    id: 3,
    name: "Christian McCaffrey",
    position: "RB",
    playoff_team: "San Francisco",
    fantasy_points: 298.2,
    stats: {
      rushing_yards: 1200,
      rushing_touchdowns: 12,
      receiving_yards: 800,
      receiving_touchdowns: 5
    }
  },
  {
    id: 4,
    name: "Tyreek Hill",
    position: "WR",
    playoff_team: "Miami",
    fantasy_points: 275.4,
    stats: {
      receiving_yards: 1400,
      receiving_touchdowns: 12,
      rushing_yards: 100,
      rushing_touchdowns: 1
    }
  }
];

// GET all players
router.get('/', (req, res) => {
  try {
    res.json(mockPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET single player by ID
router.get('/:id', (req, res) => {
  try {
    const player = mockPlayers.find(p => p.id === parseInt(req.params.id));
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// GET players by position
router.get('/position/:position', (req, res) => {
  try {
    const { position } = req.params;
    const filteredPlayers = mockPlayers.filter(p => 
      p.position.toLowerCase() === position.toLowerCase()
    );
    res.json(filteredPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players by position' });
  }
});

// GET players by playoff team
router.get('/team/:team', (req, res) => {
  try {
    const { team } = req.params;
    const filteredPlayers = mockPlayers.filter(p => 
      p.playoff_team.toLowerCase().includes(team.toLowerCase())
    );
    res.json(filteredPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players by team' });
  }
});

// GET top players by fantasy points
router.get('/top/:limit', (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const topPlayers = mockPlayers
      .sort((a, b) => b.fantasy_points - a.fantasy_points)
      .slice(0, limit);
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top players' });
  }
});

module.exports = router; 