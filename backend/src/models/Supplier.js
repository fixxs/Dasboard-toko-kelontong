import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, trim: true },
    kontak: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Supplier', supplierSchema);
