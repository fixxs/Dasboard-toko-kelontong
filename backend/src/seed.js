import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Kategori from './models/Kategori.js';
import Supplier from './models/Supplier.js';
import Barang from './models/Barang.js';
import TransaksiBarang from './models/TransaksiBarang.js';
import KasHarian from './models/KasHarian.js';
import BiayaOperasional from './models/BiayaOperasional.js';
import StokOpname from './models/StokOpname.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/toko_kelontong');
    console.log('Connected to MongoDB for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Kategori.deleteMany({});
    await Supplier.deleteMany({});
    await Barang.deleteMany({});
    await TransaksiBarang.deleteMany({});
    await KasHarian.deleteMany({});
    await BiayaOperasional.deleteMany({});
    await StokOpname.deleteMany({});

    console.log('Old database records cleared.');

    // 1. Seed Accounts (Admin & Kasir)
    const admin = await User.create({
      nama: 'Fikri Rusdinerza (Owner)',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      status: 'aktif'
    });

    const kasir = await User.create({
      nama: 'Budi Raharjo (Kasir)',
      username: 'kasir',
      password: 'kasir123',
      role: 'kasir',
      status: 'aktif'
    });

    console.log('Accounts created:');
    console.log(' - Admin : username: admin  | password: admin123');
    console.log(' - Kasir : username: kasir  | password: kasir123');

    // 2. Seed Categories
    const katSembako = await Kategori.create({ nama: 'Sembako' });
    const katMinuman = await Kategori.create({ nama: 'Minuman' });
    const katRokok = await Kategori.create({ nama: 'Rokok' });
    const katSnack = await Kategori.create({ nama: 'Makanan Ringan' });
    const katBumbu = await Kategori.create({ nama: 'Bumbu Dapur' });
    const katMandi = await Kategori.create({ nama: 'Mandi & Cuci' });

    // 3. Seed Suppliers
    const supIndofood = await Supplier.create({ nama: 'PT Indofood Sukses Makmur', kontak: '0812-9988-7766' });
    const supMayora = await Supplier.create({ nama: 'PT Mayora Indah', kontak: '0811-2233-4455' });
    const supUnilever = await Supplier.create({ nama: 'PT Unilever Indonesia', kontak: '0813-4455-6677' });
    const supJaya = await Supplier.create({ nama: 'Agen Sembako Berkah Jaya', kontak: '0856-7788-9900' });

    // 4. Seed Products
    const barangs = await Barang.insertMany([
      {
        nama: 'Beras Premium Ramos 5kg',
        kategori_id: katSembako._id,
        satuan: 'karung',
        harga_modal: 68000,
        harga_jual: 75000,
        stok: 25,
        stok_minimum: 10,
        supplier_id: supJaya._id
      },
      {
        nama: 'Minyak Goreng Bimoli 2L',
        kategori_id: katSembako._id,
        satuan: 'pouch',
        harga_modal: 34000,
        harga_jual: 38500,
        stok: 18,
        stok_minimum: 8,
        supplier_id: supJaya._id
      },
      {
        nama: 'Gula Pasir Gulaku 1kg',
        kategori_id: katSembako._id,
        satuan: 'kg',
        harga_modal: 15500,
        harga_jual: 17500,
        stok: 4, // Low stock warning!
        stok_minimum: 10,
        supplier_id: supJaya._id
      },
      {
        nama: 'Telur Ayam Negeri 1kg',
        kategori_id: katSembako._id,
        satuan: 'kg',
        harga_modal: 26000,
        harga_jual: 29000,
        stok: 30,
        stok_minimum: 10,
        supplier_id: supJaya._id
      },
      {
        nama: 'Indomie Goreng Spesial 85g',
        kategori_id: katSnack._id,
        satuan: 'pcs',
        harga_modal: 2800,
        harga_jual: 3500,
        stok: 120,
        stok_minimum: 40,
        supplier_id: supIndofood._id
      },
      {
        nama: 'Teh Pucuk Harum 350ml',
        kategori_id: katMinuman._id,
        satuan: 'botol',
        harga_modal: 2700,
        harga_jual: 3500,
        stok: 48,
        stok_minimum: 24,
        supplier_id: supMayora._id
      },
      {
        nama: 'Le Minerale 600ml',
        kategori_id: katMinuman._id,
        satuan: 'botol',
        harga_modal: 2400,
        harga_jual: 3000,
        stok: 3, // Low stock warning!
        stok_minimum: 20,
        supplier_id: supMayora._id
      },
      {
        nama: 'Sampoerna Mild 16',
        kategori_id: katRokok._id,
        satuan: 'bungkus',
        harga_modal: 30500,
        harga_jual: 33000,
        stok: 40,
        stok_minimum: 15,
        supplier_id: supJaya._id
      },
      {
        nama: 'Garam Dapur Cap Kapal 250g',
        kategori_id: katBumbu._id,
        satuan: 'pcs',
        harga_modal: 2000,
        harga_jual: 3000,
        stok: 15,
        stok_minimum: 10,
        supplier_id: supJaya._id
      },
      {
        nama: 'Sabun Mandi Lifebuoy 110g',
        kategori_id: katMandi._id,
        satuan: 'pcs',
        harga_modal: 4200,
        harga_jual: 5500,
        stok: 22,
        stok_minimum: 10,
        supplier_id: supUnilever._id
      }
    ]);
    console.log(`${barangs.length} products seeded.`);

    // 5. Seed Transactions
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const beras = barangs[0];
      const minyak = barangs[1];
      const indomie = barangs[4];

      await TransaksiBarang.create({
        barang_id: beras._id,
        tipe: 'keluar',
        jumlah: 2,
        harga_saat_transaksi: beras.harga_jual,
        harga_modal_saat_transaksi: beras.harga_modal,
        total: 2 * beras.harga_jual,
        metode_pembayaran: 'tunai',
        uang_diterima: 150000,
        kembalian: 0,
        kasir_id: kasir._id,
        no_nota: `NOTA-${Date.now()}-${i}A`,
        keterangan: 'Penjualan toko kasir',
        tanggal: d
      });

      await TransaksiBarang.create({
        barang_id: minyak._id,
        tipe: 'keluar',
        jumlah: 3,
        harga_saat_transaksi: minyak.harga_jual,
        harga_modal_saat_transaksi: minyak.harga_modal,
        total: 3 * minyak.harga_jual,
        metode_pembayaran: 'qris',
        kasir_id: kasir._id,
        no_nota: `NOTA-${Date.now()}-${i}B`,
        keterangan: 'Penjualan QRIS',
        tanggal: d
      });

      await TransaksiBarang.create({
        barang_id: indomie._id,
        tipe: 'keluar',
        jumlah: 10,
        harga_saat_transaksi: indomie.harga_jual,
        harga_modal_saat_transaksi: indomie.harga_modal,
        total: 10 * indomie.harga_jual,
        metode_pembayaran: 'tunai',
        uang_diterima: 50000,
        kembalian: 15000,
        kasir_id: kasir._id,
        no_nota: `NOTA-${Date.now()}-${i}C`,
        keterangan: 'Penjualan eceran',
        tanggal: d
      });
    }

    // Operational Expenses
    await BiayaOperasional.create({
      jenis: 'Listrik & Air',
      jumlah: 350000,
      keterangan: 'Tagihan PLN & PAM Toko Bulan Ini',
      tanggal: new Date(today.getFullYear(), today.getMonth(), 5)
    });

    await BiayaOperasional.create({
      jenis: 'Kebersihan',
      jumlah: 50000,
      keterangan: 'Iuran Kebersihan Lingkungan',
      tanggal: new Date(today.getFullYear(), today.getMonth(), 10)
    });

    // Stock Opname
    await StokOpname.create({
      barang_id: barangs[2]._id,
      stok_sistem: 6,
      stok_fisik: 4,
      selisih: -2,
      alasan: 'Kemasan bocor dan digigit semut',
      tanggal: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2)
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
