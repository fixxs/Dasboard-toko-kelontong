import TransaksiBarang from '../models/TransaksiBarang.js';
import BiayaOperasional from '../models/BiayaOperasional.js';
import Kategori from '../models/Kategori.js';

export const getLaporanLabaRugi = async (req, res) => {
  try {
    const { startDate, endDate, month, year, kategori_id } = req.query;

    let start, end;

    if (month && year) {
      start = new Date(Number(year), Number(month) - 1, 1);
      end = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const txQuery = {
      tipe: 'keluar',
      tanggal: { $gte: start, $lte: end }
    };

    let salesTx = await TransaksiBarang.find(txQuery).populate({
      path: 'barang_id',
      populate: { path: 'kategori_id', select: 'nama' }
    });

    if (kategori_id) {
      salesTx = salesTx.filter(
        (tx) => tx.barang_id && tx.barang_id.kategori_id && tx.barang_id.kategori_id._id.toString() === kategori_id
      );
    }

    // Pendapatan = Total Penjualan
    const totalPendapatan = salesTx.reduce((sum, tx) => sum + tx.total, 0);

    // HPP = Sum of (harga_modal_saat_transaksi * jumlah)
    const totalHPP = salesTx.reduce((sum, tx) => {
      const hppItem = tx.harga_modal_saat_transaksi
        ? tx.harga_modal_saat_transaksi * tx.jumlah
        : (tx.barang_id ? tx.barang_id.harga_modal : tx.harga_saat_transaksi) * tx.jumlah;
      return sum + hppItem;
    }, 0);

    // Laba Kotor = Pendapatan - HPP
    const labaKotor = totalPendapatan - totalHPP;

    // Biaya Operasional for date range
    const biayaQuery = { tanggal: { $gte: start, $lte: end } };
    const listBiaya = await BiayaOperasional.find(biayaQuery);
    const totalBiayaOperasional = listBiaya.reduce((sum, b) => sum + b.jumlah, 0);

    // Laba Bersih = Laba Kotor - Biaya Operasional
    const labaBersih = labaKotor - totalBiayaOperasional;

    // Breakdown per kategori
    const perKategoriMap = {};
    salesTx.forEach((tx) => {
      const katNama = tx.barang_id?.kategori_id?.nama || 'Lainnya';
      if (!perKategoriMap[katNama]) {
        perKategoriMap[katNama] = {
          kategori: katNama,
          totalPenjualan: 0,
          totalQty: 0,
          totalHPP: 0,
          labaKotor: 0
        };
      }
      const hppItem = (tx.harga_modal_saat_transaksi || tx.barang_id?.harga_modal || 0) * tx.jumlah;
      perKategoriMap[katNama].totalPenjualan += tx.total;
      perKategoriMap[katNama].totalQty += tx.jumlah;
      perKategoriMap[katNama].totalHPP += hppItem;
      perKategoriMap[katNama].labaKotor += tx.total - hppItem;
    });

    const breakdownKategori = Object.values(perKategoriMap);

    res.json({
      periode: {
        start,
        end
      },
      ringkasan: {
        totalPendapatan,
        totalHPP,
        labaKotor,
        totalBiayaOperasional,
        labaBersih
      },
      breakdownKategori,
      detailBiayaOperasional: listBiaya
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyRevenuePreview = async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const months = [];

    const kategoris = await Kategori.find().sort({ nama: 1 });

    for (let m = 0; m < 12; m++) {
      const start = new Date(year, m, 1);
      const end = new Date(year, m + 1, 0, 23, 59, 59, 999);

      const sales = await TransaksiBarang.find({
        tipe: 'keluar',
        tanggal: { $gte: start, $lte: end }
      }).populate({
        path: 'barang_id',
        populate: { path: 'kategori_id', select: 'nama' }
      });

      const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);

      const totalHPP = sales.reduce((acc, curr) => {
        const hpp = (curr.harga_modal_saat_transaksi || curr.barang_id?.harga_modal || 0) * curr.jumlah;
        return acc + hpp;
      }, 0);

      const categoryRevenue = {};
      kategoris.forEach((k) => (categoryRevenue[k.nama] = 0));

      sales.forEach((s) => {
        const katName = s.barang_id?.kategori_id?.nama || 'Uncategorized';
        categoryRevenue[katName] = (categoryRevenue[katName] || 0) + s.total;
      });

      months.push({
        bulan: start.toLocaleString('id-ID', { month: 'long' }),
        bulanIndex: m + 1,
        pendapatan: totalRevenue,
        hpp: totalHPP,
        labaKotor: totalRevenue - totalHPP,
        byCategory: categoryRevenue
      });
    }

    res.json({ year, months });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
