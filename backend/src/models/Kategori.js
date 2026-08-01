import mongoose from 'mongoose';

const kategoriSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, unique: true, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Kategori', kategoriSchema);
