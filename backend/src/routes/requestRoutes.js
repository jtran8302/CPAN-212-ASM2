import { Router } from 'express';
import {
    createRequest,
    getAllRequests,
    getRequestById,
    updateRequestStatus
} from '../controllers/requestController.js';
import { submitQuote, getQuotesForRequest } from '../controllers/quoteController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.post('/', requireAuth, requireRole('resident'), createRequest);
router.get('/', requireAuth, getAllRequests);
router.get('/:id', requireAuth, getRequestById);
router.patch('/:id/status', requireAuth, requireRole('resident'), updateRequestStatus);

// quote routes nested under requests
router.post('/:id/quotes', requireAuth, requireRole('provider'), submitQuote);
router.get('/:id/quotes', requireAuth, getQuotesForRequest);

export const requestRoutes = router;
