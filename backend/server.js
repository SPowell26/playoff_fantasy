const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const leaguesRouter = require('./routes/leagues');
const playersRouter = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from React app
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/leagues', leaguesRouter);
app.use('/api/players', playersRouter);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Express server is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Fantasy Playoff Backend is healthy'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🏈 Leagues API: http://localhost:${PORT}/api/leagues`);
  console.log(`👥 Players API: http://localhost:${PORT}/api/players`);
}); 