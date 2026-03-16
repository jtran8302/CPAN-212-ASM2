import { Router } from 'express';
import { acceptQuote } from '../controllers/quoteController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const quoteRoutes = Router();

// PATCH /api/quotes/:id/accept
quoteRoutes.patch('/:id/accept', requireAuth, requireRole('resident'), acceptQuote);
