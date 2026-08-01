import mongoose from 'mongoose';

const stokOpnameSchema = new mongoose.Schema(
  {
    barang_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Barang', required: true },
    stok_sistem: { type: Number, required: true },
    stok_fisik: { type: Number, required: true },
    selisih: { type: Number, required: true },
    alasan: { type: String, default: '' },
    tanggal: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('StokOpname', stokOpnameSchema);
