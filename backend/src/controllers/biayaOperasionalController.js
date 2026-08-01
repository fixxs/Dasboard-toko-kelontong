import BiayaOperasional from '../models/BiayaOperasional.js';

export const getBiayaOperasional = async (req, res) => {
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

    const data = await BiayaOperasional.find(filter).sort({ tanggal: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBiayaOperasional = async (req, res) => {
  try {
    const { jenis, jumlah, keterangan, tanggal } = req.body;
    if (!jenis || !jumlah || jumlah <= 0) {
      return res.status(400).json({ message: 'Jenis dan jumlah biaya operasional wajib diisi' });
    }

    const biaya = await BiayaOperasional.create({
      jenis: jenis.trim(),
      jumlah: Number(jumlah),
      keterangan: keterangan || '',
      tanggal: tanggal ? new Date(tanggal) : new Date()
    });

    res.status(201).json(biaya);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBiayaOperasional = async (req, res) => {
  try {
    const { id } = req.params;
    const { jenis, jumlah, keterangan, tanggal } = req.body;
    const biaya = await BiayaOperasional.findByIdAndUpdate(
      id,
      { jenis, jumlah: Number(jumlah), keterangan, tanggal },
      { new: true }
    );
    if (!biaya) return res.status(404).json({ message: 'Data biaya tidak ditemukan' });
    res.json(biaya);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBiayaOperasional = async (req, res) => {
  try {
    const { id } = req.params;
    await BiayaOperasional.findByIdAndDelete(id);
    res.json({ message: 'Biaya operasional berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
