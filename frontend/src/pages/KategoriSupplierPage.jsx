import React, { useState, useEffect } from 'react';
import { kategoriAPI, supplierAPI } from '../services/api';
import { Folder, Truck, Plus, Trash2 } from 'lucide-react';

const KategoriSupplierPage = () => {
  const [kategoris, setKategoris] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kategori Form
  const [namaKat, setNamaKat] = useState('');
  const [ketKat, setKetKat] = useState('');

  // Supplier Form
  const [namaSup, setNamaSup] = useState('');
  const [kontakSup, setKontakSup] = useState('');
  const [alamatSup, setAlamatSup] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [kRes, sRes] = await Promise.all([kategoriAPI.getAll(), supplierAPI.getAll()]);
      setKategoris(kRes.data || []);
      setSuppliers(sRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddKategori = async (e) => {
    e.preventDefault();
    if (!namaKat) return;
    try {
      await kategoriAPI.create({ nama: namaKat, keterangan: ketKat });
      setNamaKat('');
      setKetKat('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding category');
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!namaSup) return;
    try {
      await supplierAPI.create({ nama: namaSup, kontak: kontakSup, alamat: alamatSup });
      setNamaSup('');
      setKontakSup('');
      setAlamatSup('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding supplier');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="neu-card p-6 rounded-3xl space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Supplier Management & Customer Database</h1>
        <p className="text-xs text-slate-500 font-medium">Manage master product categories, suppliers, and customer databases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories Section */}
        <div className="neu-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-600" /> Categories Master Data
          </h3>

          <form onSubmit={handleAddKategori} className="space-y-2 text-xs">
            <input
              type="text"
              required
              placeholder="Category Name..."
              value={namaKat}
              onChange={(e) => setNamaKat(e.target.value)}
              className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
            />
            <button type="submit" className="w-full bg-[#1c1e22] text-white font-bold py-2 rounded-xl">
              Add Category
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {kategoris.map((k) => (
              <div key={k._id} className="bg-[#dcdfe4] p-3 rounded-xl border border-slate-300 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900">{k.nama}</span>
                <span className="text-[10px] text-slate-500">{k.keterangan || 'Active Category'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Section */}
        <div className="neu-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-300 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-600" /> Supplier Directory
          </h3>

          <form onSubmit={handleAddSupplier} className="space-y-2 text-xs">
            <input
              type="text"
              required
              placeholder="Supplier Name..."
              value={namaSup}
              onChange={(e) => setNamaSup(e.target.value)}
              className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Contact Number..."
              value={kontakSup}
              onChange={(e) => setKontakSup(e.target.value)}
              className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
            />
            <button type="submit" className="w-full bg-[#1c1e22] text-white font-bold py-2 rounded-xl">
              Add Supplier
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {suppliers.map((s) => (
              <div key={s._id} className="bg-[#dcdfe4] p-3 rounded-xl border border-slate-300 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{s.nama}</p>
                  <p className="text-[10px] text-slate-500">{s.kontak || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KategoriSupplierPage;
