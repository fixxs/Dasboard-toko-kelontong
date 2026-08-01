import express from 'express';
import { getKategori, createKategori, updateKategori, deleteKategori } from '../controllers/kategoriController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getKategori);
router.post('/', protect, createKategori);
router.put('/:id', protect, updateKategori);
router.delete('/:id', protect, deleteKategori);

export default router;
