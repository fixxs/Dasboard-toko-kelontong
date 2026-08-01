import mongoose from 'mongoose';

const biayaOperasionalSchema = new mongoose.Schema(
  {
    jenis: { type: String, required: true },
    jumlah: { type: Number, required: true },
    keterangan: { type: String, default: '' },
    tanggal: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('BiayaOperasional', biayaOperasionalSchema);
