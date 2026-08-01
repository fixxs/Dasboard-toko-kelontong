import mongoose from 'mongoose';

const detailPengeluaranSchema = new mongoose.Schema({
  keterangan: { type: String, required: true },
  jumlah: { type: Number, required: true }
});

const kasHarianSchema = new mongoose.Schema(
  {
    tanggal: { type: Date, required: true, unique: true },
    kas_masuk: { type: Number, default: 0 },
    kas_keluar: { type: Number, default: 0 },
    saldo_akhir: { type: Number, default: 0 },
    detail_pengeluaran: [detailPengeluaranSchema]
  },
  { timestamps: true }
);

export default mongoose.model('KasHarian', kasHarianSchema);
