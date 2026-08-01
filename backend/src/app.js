import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import kategoriRoutes from './routes/kategoriRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import barangRoutes from './routes/barangRoutes.js';
import transaksiRoutes from './routes/transaksiRoutes.js';
import kasHarianRoutes from './routes/kasHarianRoutes.js';
import biayaOperasionalRoutes from './routes/biayaOperasionalRoutes.js';
import labaRugiRoutes from './routes/labaRugiRoutes.js';
import stokOpnameRoutes from './routes/stokOpnameRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config();

const app = express();

// Database Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/kas-harian', kasHarianRoutes);
app.use('/api/biaya-operasional', biayaOperasionalRoutes);
app.use('/api/laporan/laba-rugi', labaRugiRoutes);
app.use('/api/stok-opname', stokOpnameRoutes);
app.use('/api/export', exportRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'API Dashboard Toko Kelontong Aktif & Siap Digunakan' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Terjadi kesalahan pada server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
