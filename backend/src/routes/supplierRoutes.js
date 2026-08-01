import express from 'express';
import { getSupplier, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSupplier);
router.post('/', protect, createSupplier);
router.put('/:id', protect, updateSupplier);
router.delete('/:id', protect, deleteSupplier);

export default router;
