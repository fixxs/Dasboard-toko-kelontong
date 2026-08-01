import express from 'express';
import { getLaporanLabaRugi, getMonthlyRevenuePreview } from '../controllers/labaRugiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // P&L Statement is exclusive to Admin/Owner

router.get('/', getLaporanLabaRugi);
router.get('/monthly-preview', getMonthlyRevenuePreview);

export default router;
