import express from 'express';
import { getBarang, getBarangById, createBarang, updateBarang, deleteBarang } from '../controllers/barangController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getBarang);
router.get('/:id', protect, getBarangById);
router.post('/', protect, createBarang);
router.put('/:id', protect, updateBarang);
router.delete('/:id', protect, deleteBarang);

export default router;
