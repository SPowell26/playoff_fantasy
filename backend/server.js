import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({path: './.env'});

// Debug logging to see what's being read from .env
console.log(' Environment check:');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);
console.log('PORT:', process.env.PORT);
console.log('Current working directory:', process.cwd());

// Import routes
import leaguesRouter from './routes/leagues.js';
import playersRouter from './routes/players.js';
import statsRouter from './routes/stats.js';
import statusRouter from './routes/status.js';
import teamsRouter from './routes/teams.js';

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection pool
const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fantasy_playoff_db',
  password: process.env.DB_PASSWORD || 'your_password_here', // Set this in .env file
  port: 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected successfully!');
    console.log('📊 Database timestamp:', res.rows[0].now);
  }
});


// Middleware
app.use(cors()); // Allow requests from React app
app.use(express.json()); // Parse JSON request bodies

// Make database pool available to routes
app.locals.db = pool;

// Routes
app.use('/api/leagues', leaguesRouter);
app.use('/api/players', playersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/status', statusRouter);
app.use('/api/teams', teamsRouter);


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
  console.log(`📊 Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`📅 Status API: http://localhost:${PORT}/api/status`);
  console.log(`🏆 Teams API: http://localhost:${PORT}/api/teams`);
}); 