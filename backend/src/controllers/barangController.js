import Barang from '../models/Barang.js';

export const getBarang = async (req, res) => {
  try {
    const { kategori, search, lowStock } = req.query;
    let query = {};

    if (kategori) {
      query.kategori_id = kategori;
    }

    if (search) {
      query.nama = { $regex: search, $options: 'i' };
    }

    let items = await Barang.find(query)
      .populate('kategori_id', 'nama')
      .populate('supplier_id', 'nama kontak')
      .sort({ nama: 1 });

    if (lowStock === 'true') {
      items = items.filter((item) => item.stok <= item.stok_minimum);
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findById(req.params.id)
      .populate('kategori_id', 'nama')
      .populate('supplier_id', 'nama kontak');
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBarang = async (req, res) => {
  try {
    const { nama, kategori_id, satuan, harga_modal, harga_jual, stok, stok_minimum, supplier_id } = req.body;

    if (!nama || !kategori_id || harga_modal === undefined || harga_jual === undefined) {
      return res.status(400).json({ message: 'Nama, kategori, harga modal, dan harga jual wajib diisi' });
    }

    const barang = await Barang.create({
      nama: nama.trim(),
      kategori_id,
      satuan: satuan || 'pcs',
      harga_modal: Number(harga_modal),
      harga_jual: Number(harga_jual),
      stok: Number(stok) || 0,
      stok_minimum: Number(stok_minimum) || 5,
      supplier_id: supplier_id || null
    });

    const populatedBarang = await Barang.findById(barang._id)
      .populate('kategori_id', 'nama')
      .populate('supplier_id', 'nama kontak');

    res.status(201).json(populatedBarang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kategori_id, satuan, harga_modal, harga_jual, stok, stok_minimum, supplier_id } = req.body;

    const barang = await Barang.findById(id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    if (nama) barang.nama = nama.trim();
    if (kategori_id) barang.kategori_id = kategori_id;
    if (satuan) barang.satuan = satuan;
    if (harga_modal !== undefined) barang.harga_modal = Number(harga_modal);
    if (harga_jual !== undefined) barang.harga_jual = Number(harga_jual);
    if (stok !== undefined) barang.stok = Number(stok);
    if (stok_minimum !== undefined) barang.stok_minimum = Number(stok_minimum);
    barang.supplier_id = supplier_id || null;

    await barang.save();

    const updated = await Barang.findById(id)
      .populate('kategori_id', 'nama')
      .populate('supplier_id', 'nama kontak');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;
    await Barang.findByIdAndDelete(id);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
