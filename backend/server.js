// MUST load dotenv FIRST before any other imports that might use process.env
import dotenv from 'dotenv';
dotenv.config({path: './.env'});

// Now import everything else
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pg from 'pg';
import pgSession from 'connect-pg-simple';

// Environment loaded

// Import routes
import authRouter from './routes/auth.js';
import leaguesRouter from './routes/leagues.js';
import playersRouter from './routes/players.js';
import statsRouter from './routes/stats.js';
import statusRouter from './routes/status.js';
import teamsRouter from './routes/teams.js';

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection pool
const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fantasy_playoff_db',
  password: process.env.DB_PASSWORD || 'Yoshi420!',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
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


// Session store configuration (PostgreSQL-based for production)
const PgSession = pgSession(session);

// Session configuration
app.use(session({
  store: new PgSession({
    pool: pool, // Use existing PostgreSQL connection pool
    tableName: 'user_sessions', // Table name for sessions
    createTableIfMissing: true, // Auto-create table if it doesn't exist
  }),
  secret: process.env.SESSION_SECRET || 'fantasy-playoff-secret-key-change-in-production',
  name: 'fantasy.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true, // Always use secure cookies in production (required for cross-site)
    sameSite: 'none', // Allow cross-site cookies (needed for Vercel frontend to Railway backend)
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    // Don't set domain - let browser handle it
  },
  rolling: true // Reset expiration on activity
}));

// Middleware
// CORS configuration - allow Vercel and localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin contains vercel.app or is in allowed list
    if (origin.includes('vercel.app') || origin.includes('localhost') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, log but allow (you can tighten this later)
      console.log('CORS: Allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
})); // Allow requests from React app
app.use(express.json()); // Parse JSON request bodies

// Make database pool available to routes
app.locals.db = pool;

// Routes
app.use('/api/auth', authRouter);
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🏈 Leagues API: http://localhost:${PORT}/api/leagues`);
  console.log(`👥 Players API: http://localhost:${PORT}/api/players`);
  console.log(`📊 Stats API: http://localhost:${PORT}/api/stats`);
  console.log(`📅 Status API: http://localhost:${PORT}/api/status`);
  console.log(`🏆 Teams API: http://localhost:${PORT}/api/teams`);
}); 