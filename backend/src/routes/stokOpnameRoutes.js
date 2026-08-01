import express from 'express';
import { getStokOpname, createStokOpname } from '../controllers/stokOpnameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getStokOpname);
router.post('/', protect, createStokOpname);

export default router;
