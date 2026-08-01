import express from 'express';
import { exportReport } from '../controllers/exportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Export functionality is restricted to Admin

router.get('/', exportReport);

export default router;
