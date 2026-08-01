import Supplier from '../models/Supplier.js';

export const getSupplier = async (req, res) => {
  try {
    const data = await Supplier.find().sort({ nama: 1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { nama, kontak } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama supplier wajib diisi' });

    const supplier = await Supplier.create({ nama, kontak });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kontak } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(id, { nama, kontak }, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier tidak ditemukan' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await Supplier.findByIdAndDelete(id);
    res.json({ message: 'Supplier berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
