import StokOpname from '../models/StokOpname.js';
import Barang from '../models/Barang.js';

export const getStokOpname = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};

    if (startDate || endDate) {
      filter.tanggal = {};
      if (startDate) filter.tanggal.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.tanggal.$lte = end;
      }
    }

    const list = await StokOpname.find(filter)
      .populate({
        path: 'barang_id',
        populate: { path: 'kategori_id', select: 'nama' }
      })
      .sort({ tanggal: -1 });

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStokOpname = async (req, res) => {
  try {
    const { barang_id, stok_fisik, alasan, tanggal } = req.body;

    if (!barang_id || stok_fisik === undefined || stok_fisik < 0) {
      return res.status(400).json({ message: 'Barang dan stok fisik valid wajib diisi' });
    }

    const barang = await Barang.findById(barang_id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    const stok_sistem = barang.stok;
    const selisih = Number(stok_fisik) - stok_sistem;

    const opname = await StokOpname.create({
      barang_id,
      stok_sistem,
      stok_fisik: Number(stok_fisik),
      selisih,
      alasan: alasan || '',
      tanggal: tanggal ? new Date(tanggal) : new Date()
    });

    // Automatically synchronize actual system stock to physical count
    barang.stok = Number(stok_fisik);
    await barang.save();

    const populated = await StokOpname.findById(opname._id).populate({
      path: 'barang_id',
      populate: { path: 'kategori_id', select: 'nama' }
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
