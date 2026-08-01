import mongoose from 'mongoose';

const barangSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    kategori_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Kategori', required: true },
    satuan: { type: String, required: true, default: 'pcs' },
    harga_modal: { type: Number, required: true, min: 0 },
    harga_jual: { type: Number, required: true, min: 0 },
    stok: { type: Number, required: true, default: 0 },
    stok_minimum: { type: Number, required: true, default: 5 },
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Barang', barangSchema);
