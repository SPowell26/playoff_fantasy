import express from 'express';
import {
  loginCommissioner,
  logoutCommissioner,
  getCurrentCommissioner,
  checkCommissionerForLeague,
  setCommissionerPassword
} from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login - Login commissioner
router.post('/login', loginCommissioner);

// POST /api/auth/logout - Logout commissioner
router.post('/logout', logoutCommissioner);

// GET /api/auth/me - Get current commissioner session info
router.get('/me', getCurrentCommissioner);

// GET /api/auth/check/:leagueId - Check if current user is commissioner for league
router.get('/check/:leagueId', checkCommissionerForLeague);

// POST /api/auth/set-password - Set password for commissioner (admin/setup function)
router.post('/set-password', setCommissionerPassword);

export default router;
