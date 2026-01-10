import bcrypt from 'bcryptjs';

/**
 * Authentication middleware for commissioner protection
 */

// System API key for automated processes
// Set SYSTEM_API_KEY environment variable in production
// Automated processes (cron jobs, etc.) can call protected endpoints by including:
// Header: X-System-API-Key: <your-system-api-key>
// This bypasses commissioner authentication for system operations
const SYSTEM_API_KEY = process.env.SYSTEM_API_KEY || 'fantasy-system-key-change-in-production';

// Master email for god-mode access (all permissions, bypasses commissioner checks)
// Set MASTER_EMAIL environment variable to your email to enable god-mode
// Example: MASTER_EMAIL=your.email@example.com
// This gives you full access to all leagues and system operations
// Use a function to read at runtime instead of module load time (ES modules hoist imports)
function getMasterEmail() {
  return process.env.MASTER_EMAIL;
}

// Master email loaded at runtime via getMasterEmail() function

/**
 * Require commissioner authentication for a route
 * Verifies the user is logged in and is a commissioner for the specified league
 * @param {string} leagueIdParam - The parameter name containing the league ID (default: 'id')
 */
export function requireCommissioner(leagueIdParam = 'id') {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.session || !req.session.commissioner) {
        return res.status(401).json({
          error: 'Authentication required. Please log in as a commissioner.',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get league ID from request parameters
      const leagueId = req.params[leagueIdParam];
      if (!leagueId) {
        return res.status(400).json({
          error: 'League ID is required',
          code: 'MISSING_LEAGUE_ID'
        });
      }

      const commissionerEmail = req.session.commissioner.email;

      // Check if this is a master email (god-mode access)
      const masterEmail = getMasterEmail();
      if (masterEmail && commissionerEmail === masterEmail) {
        console.log('👑 Master email access granted - bypassing commissioner checks');
        return next();
      }

      // Verify this commissioner is authorized for this league
      const db = req.app.locals.db;
      const result = await db.query(
        `SELECT lm.*, l.name as league_name
         FROM league_members lm
         JOIN leagues l ON lm.league_id = l.id
         WHERE lm.league_id = $1 AND lm.user_email = $2 AND lm.role = 'commissioner'`,
        [leagueId, commissionerEmail]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          error: 'You are not authorized to modify this league.',
          code: 'NOT_LEAGUE_COMMISSIONER'
        });
      }

      // Store league member info in request for use in route handlers
      req.leagueMember = result.rows[0];
      req.leagueId = leagueId;

      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        error: 'Authentication error occurred',
        code: 'AUTH_ERROR'
      });
    }
  };
}

/**
 * Require commissioner authentication OR system API key for automated processes
 * Allows either commissioner login OR system API key (for cron jobs, etc.)
 * @param {string} leagueIdParam - The parameter name containing the league ID (default: 'id')
 */
export function requireCommissionerOrSystem(leagueIdParam = 'id') {
  return async (req, res, next) => {
    try {
      // Check for system API key first (for automated processes)
      const apiKey = req.headers['x-system-api-key'] || req.headers['system-api-key'];
      if (apiKey && apiKey === SYSTEM_API_KEY) {
        // System API key is valid, allow the request
        console.log('✅ System API key authentication successful');
        return next();
      }

      // Check for master email (god-mode access)
      const masterEmail = getMasterEmail();
      if (req.session && req.session.commissioner && masterEmail && req.session.commissioner.email === masterEmail) {
        console.log('👑 Master email access granted for system operation');
        return next();
      }

      // If no valid system API key or master email, check for commissioner authentication
      return requireCommissioner(leagueIdParam)(req, res, next);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        error: 'Authentication error occurred',
        code: 'AUTH_ERROR'
      });
    }
  };
}

/**
 * Get current commissioner session info
 */
export function getCurrentCommissioner(req, res) {
  if (!req.session || !req.session.commissioner) {
    return res.json({
      authenticated: false,
      commissioner: null,
      isMaster: false
    });
  }

  // Check if this is a master email
  const masterEmail = getMasterEmail();
  const isMaster = masterEmail && req.session.commissioner.email === masterEmail;

  res.json({
    authenticated: true,
    commissioner: req.session.commissioner,
    isMaster: isMaster
  });
}

/**
 * Login commissioner with email and password
 */
export async function loginCommissioner(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const db = req.app.locals.db;

    // Check if this is a master email
    const masterEmail = getMasterEmail();
    const isMaster = masterEmail && email === masterEmail;

    // Find commissioner by email (must exist in league_members for password verification)
    const result = await db.query(
      `SELECT lm.*, l.name as league_name, l.id as league_id
       FROM league_members lm
       JOIN leagues l ON lm.league_id = l.id
       WHERE lm.user_email = $1 AND lm.role = 'commissioner'
       LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const commissioner = result.rows[0];

    // Check if password hash exists
    if (!commissioner.password_hash) {
      return res.status(401).json({
        error: 'Password not set. Please contact your league administrator.',
        code: 'PASSWORD_NOT_SET'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, commissioner.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Create session
    req.session.commissioner = {
      id: commissioner?.id || null,
      email: email,
      username: commissioner?.username || 'Master Commissioner',
      league_id: commissioner?.league_id || null,
      league_name: commissioner?.league_name || null,
      isMaster: isMaster
    };

    if (isMaster) {
      console.log('👑 Master account login successful:', email);
    }

    res.json({
      success: true,
      message: 'Login successful',
      commissioner: req.session.commissioner,
      isMaster: isMaster
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
}

/**
 * Logout commissioner
 */
export function logoutCommissioner(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }

    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
}

/**
 * Check if current user is commissioner for a specific league
 */
export async function checkCommissionerForLeague(req, res) {
  try {
    const leagueId = req.params.leagueId;

    if (!leagueId) {
      return res.status(400).json({
        error: 'League ID is required',
        code: 'MISSING_LEAGUE_ID'
      });
    }

    if (!req.session || !req.session.commissioner) {
      return res.json({
        isCommissioner: false,
        leagueId: leagueId
      });
    }

    const commissionerEmail = req.session.commissioner.email;

    // Check if this is a master email (god-mode access)
    const masterEmail = getMasterEmail();
    const isMaster = masterEmail && commissionerEmail === masterEmail;
    
    if (isMaster) {
      // Master accounts have access to all leagues
      return res.json({
        isCommissioner: true,
        leagueId: leagueId,
        commissioner: req.session.commissioner,
        isMaster: true
      });
    }

    // Check if this user is commissioner for this league
    const db = req.app.locals.db;
    const result = await db.query(
      `SELECT lm.*, l.name as league_name
       FROM league_members lm
       JOIN leagues l ON lm.league_id = l.id
       WHERE lm.league_id = $1 AND lm.user_email = $2 AND lm.role = 'commissioner'`,
      [leagueId, commissionerEmail]
    );

    res.json({
      isCommissioner: result.rows.length > 0,
      leagueId: leagueId,
      commissioner: result.rows.length > 0 ? req.session.commissioner : null,
      isMaster: false
    });
  } catch (error) {
    console.error('Check commissioner error:', error);
    res.status(500).json({
      error: 'Failed to check commissioner status',
      code: 'CHECK_ERROR'
    });
  }
}

/**
 * Set password for a commissioner (admin function)
 * This is useful for initial setup or password reset
 */
export async function setCommissionerPassword(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Validate password strength (basic)
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    const db = req.app.locals.db;

    // Find commissioner
    const commissionerResult = await db.query(
      `SELECT * FROM league_members WHERE user_email = $1 AND role = 'commissioner'`,
      [email]
    );

    if (commissionerResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Commissioner not found',
        code: 'COMMISSIONER_NOT_FOUND'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password hash
    await db.query(
      `UPDATE league_members SET password_hash = $1 WHERE user_email = $2`,
      [passwordHash, email]
    );

    res.json({
      success: true,
      message: 'Password set successfully'
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      error: 'Failed to set password',
      code: 'SET_PASSWORD_ERROR'
    });
  }
}
