import express from 'express';
import { getTransaksi, createTransaksi, deleteTransaksi } from '../controllers/transaksiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTransaksi);
router.post('/', createTransaksi);
router.delete('/:id', authorize('admin'), deleteTransaksi); // Delete requires admin role

export default router;
