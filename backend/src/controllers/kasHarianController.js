import KasHarian from '../models/KasHarian.js';
import TransaksiBarang from '../models/TransaksiBarang.js';
import BiayaOperasional from '../models/BiayaOperasional.js';

export const getKasHarianByDate = async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const targetDate = date ? new Date(date) : new Date();

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    // Get sales transactions for date (Kas Masuk)
    const salesTx = await TransaksiBarang.find({
      tipe: 'keluar',
      tanggal: { $gte: start, $lte: end }
    });
    const totalSales = salesTx.reduce((acc, curr) => acc + curr.total, 0);

    // Get stock purchase transactions for date (Kas Keluar - Stok)
    const stockPurchaseTx = await TransaksiBarang.find({
      tipe: 'masuk',
      tanggal: { $gte: start, $lte: end }
    });
    const totalStockPurchase = stockPurchaseTx.reduce((acc, curr) => acc + curr.total, 0);

    // Get operational expenses for date
    const opExpenses = await BiayaOperasional.find({
      tanggal: { $gte: start, $lte: end }
    });
    const totalOpExpenses = opExpenses.reduce((acc, curr) => acc + curr.jumlah, 0);

    const calculatedKasMasuk = totalSales;
    const calculatedKasKeluar = totalStockPurchase + totalOpExpenses;

    // Check if there is an existing saved record for this date
    let savedKas = await KasHarian.findOne({
      tanggal: { $gte: start, $lte: end }
    });

    const detailPengeluaran = [
      ...stockPurchaseTx.map((t) => ({ keterangan: `Pembelian Stok (${t.keterangan || 'Barang Masuk'})`, jumlah: t.total })),
      ...opExpenses.map((b) => ({ keterangan: `${b.jenis}: ${b.keterangan || ''}`.trim(), jumlah: b.jumlah }))
    ];

    res.json({
      tanggal: start,
      kas_masuk: calculatedKasMasuk,
      kas_keluar: calculatedKasKeluar,
      saldo_akhir: calculatedKasMasuk - calculatedKasKeluar,
      detail_pengeluaran: detailPengeluaran,
      is_closed: !!savedKas,
      saved_record: savedKas
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const simpanTutupToko = async (req, res) => {
  try {
    const { tanggal, detail_pengeluaran } = req.body;
    const targetDate = tanggal ? new Date(tanggal) : new Date();

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const salesTx = await TransaksiBarang.find({ tipe: 'keluar', tanggal: { $gte: start, $lte: end } });
    const kas_masuk = salesTx.reduce((acc, curr) => acc + curr.total, 0);

    const stockPurchaseTx = await TransaksiBarang.find({ tipe: 'masuk', tanggal: { $gte: start, $lte: end } });
    const totalStockPurchase = stockPurchaseTx.reduce((acc, curr) => acc + curr.total, 0);

    const opExpenses = await BiayaOperasional.find({ tanggal: { $gte: start, $lte: end } });
    const totalOpExpenses = opExpenses.reduce((acc, curr) => acc + curr.jumlah, 0);

    const kas_keluar = totalStockPurchase + totalOpExpenses;
    const saldo_akhir = kas_masuk - kas_keluar;

    const details = detail_pengeluaran || [
      ...stockPurchaseTx.map((t) => ({ keterangan: `Pembelian Stok`, jumlah: t.total })),
      ...opExpenses.map((b) => ({ keterangan: `${b.jenis}`, jumlah: b.jumlah }))
    ];

    let kas = await KasHarian.findOne({ tanggal: { $gte: start, $lte: end } });
    if (kas) {
      kas.kas_masuk = kas_masuk;
      kas.kas_keluar = kas_keluar;
      kas.saldo_akhir = saldo_akhir;
      kas.detail_pengeluaran = details;
      await kas.save();
    } else {
      kas = await KasHarian.create({
        tanggal: start,
        kas_masuk,
        kas_keluar,
        saldo_akhir,
        detail_pengeluaran: details
      });
    }

    res.json({ message: 'Tutup toko berhasil disimpan!', kas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistoryKasHarian = async (req, res) => {
  try {
    const history = await KasHarian.find().sort({ tanggal: -1 }).limit(30);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
