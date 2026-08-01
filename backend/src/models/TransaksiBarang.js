import mongoose from 'mongoose';

const transaksiBarangSchema = new mongoose.Schema(
  {
    barang_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Barang', required: true },
    tipe: { type: String, enum: ['masuk', 'keluar'], required: true },
    jumlah: { type: Number, required: true, min: 1 },
    harga_saat_transaksi: { type: Number, required: true }, // harga jual (for keluar) or harga modal (for masuk)
    harga_modal_saat_transaksi: { type: Number, required: true }, // snapshot HPP basis
    total: { type: Number, required: true },
    metode_pembayaran: { type: String, enum: ['tunai', 'qris', 'transfer', 'kasbon'], default: 'tunai' },
    uang_diterima: { type: Number, default: 0 },
    kembalian: { type: Number, default: 0 },
    nama_pelanggan_kasbon: { type: String, default: '' },
    kasir_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    no_nota: { type: String, default: '' },
    keterangan: { type: String, default: '' },
    tanggal: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('TransaksiBarang', transaksiBarangSchema);
