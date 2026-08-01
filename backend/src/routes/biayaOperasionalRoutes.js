import express from 'express';
import {
  getBiayaOperasional,
  createBiayaOperasional,
  updateBiayaOperasional,
  deleteBiayaOperasional
} from '../controllers/biayaOperasionalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getBiayaOperasional);
router.post('/', protect, createBiayaOperasional);
router.put('/:id', protect, updateBiayaOperasional);
router.delete('/:id', protect, deleteBiayaOperasional);

export default router;
