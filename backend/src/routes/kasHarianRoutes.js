import express from 'express';
import { getKasHarianByDate, simpanTutupToko, getHistoryKasHarian } from '../controllers/kasHarianController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/today', protect, getKasHarianByDate);
router.get('/history', protect, getHistoryKasHarian);
router.post('/tutup-toko', protect, simpanTutupToko);

export default router;
