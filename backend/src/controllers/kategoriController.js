import Kategori from '../models/Kategori.js';

export const getKategori = async (req, res) => {
  try {
    const data = await Kategori.find().sort({ nama: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createKategori = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama kategori wajib diisi' });

    const exists = await Kategori.findOne({ nama: { $regex: new RegExp(`^${nama.trim()}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'Kategori sudah ada' });

    const kategori = await Kategori.create({ nama: nama.trim() });
    res.status(201).json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;
    const kategori = await Kategori.findByIdAndUpdate(id, { nama }, { new: true });
    if (!kategori) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteKategori = async (req, res) => {
  try {
    const { id } = req.params;
    await Kategori.findByIdAndDelete(id);
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
