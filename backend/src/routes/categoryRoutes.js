import { Router } from 'express';
import { getAllCategories, createCategory } from '../controllers/categoryController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAuth, getAllCategories);
router.post('/', requireAuth, createCategory);

export const categoryRoutes = router;

