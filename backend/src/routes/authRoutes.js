import { Router } from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRoutes = Router();

// POST /api/auth/register — create new account (public)
authRoutes.post('/register', register);

// POST /api/auth/login — login and start session (public)
authRoutes.post('/login', login);

// POST /api/auth/logout — destroy session (requires login)
authRoutes.post('/logout', requireAuth, logout);

// GET /api/auth/me — get current logged-in user profile (requires login)
authRoutes.get('/me', requireAuth, me);
