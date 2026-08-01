import React, { useState, useEffect } from 'react';
import { barangAPI, kategoriAPI, supplierAPI, transaksiAPI } from '../services/api';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const BarangPage = () => {
  const [barangs, setBarangs] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    kategori_id: '',
    satuan: 'pcs',
    harga_modal: 0,
    harga_jual: 0,
    stok: 0,
    stok_minimum: 5,
    supplier_id: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, kRes, sRes] = await Promise.all([
        barangAPI.getAll({
          search,
          kategori: selectedKategori,
          lowStock: lowStockFilter ? 'true' : 'false'
        }),
        kategoriAPI.getAll(),
        supplierAPI.getAll()
      ]);
      setBarangs(bRes.data);
      setKategoris(kRes.data);
      setSuppliers(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedKategori, lowStockFilter]);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({
      nama: '',
      kategori_id: kategoris[0]?._id || '',
      satuan: 'pcs',
      harga_modal: 0,
      harga_jual: 0,
      stok: 0,
      stok_minimum: 5,
      supplier_id: ''
    });
    setFormError('');
    setShowFormModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      nama: item.nama,
      kategori_id: item.kategori_id?._id || item.kategori_id,
      satuan: item.satuan,
      harga_modal: item.harga_modal,
      harga_jual: item.harga_jual,
      stok: item.stok,
      stok_minimum: item.stok_minimum,
      supplier_id: item.supplier_id?._id || item.supplier_id || ''
    });
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editItem) {
        await barangAPI.update(editItem._id, formData);
      } else {
        await barangAPI.create(formData);
      }
      setShowFormModal(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan barang');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Hapus barang "${nama}"?`)) {
      try {
        await barangAPI.delete(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus barang');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Management & Inventory</h1>
          <p className="text-xs text-slate-500 font-medium">Manage grocery catalog, cost price basis, and stock levels</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#1c1e22] text-white hover:bg-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 neu-card p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full neu-inset rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none"
          />
        </div>

        <select
          value={selectedKategori}
          onChange={(e) => setSelectedKategori(e.target.value)}
          className="w-full neu-inset rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
        >
          <option value="">All Categories</option>
          {kategoris.map((k) => (
            <option key={k._id} value={k._id}>
              {k.nama}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`flex items-center justify-center gap-2 text-xs px-4 py-2 rounded-xl border font-bold transition-all ${
            lowStockFilter
              ? 'bg-[#d8dce2] border-slate-400 text-slate-900'
              : 'bg-[#dcdfe4] border-slate-300 text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>{lowStockFilter ? 'Filter: Low Stock Active' : 'Low Stock Only'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="neu-card rounded-3xl overflow-hidden p-2">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#d8dce2] uppercase font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Cost Price</th>
                  <th className="p-3.5">Selling Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {barangs.map((item) => (
                  <tr key={item._id} className="hover:bg-black/5 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{item.nama}</td>
                    <td className="p-3.5 text-slate-600">{item.kategori_id?.nama || '-'}</td>
                    <td className="p-3.5 font-mono text-slate-500 uppercase">{item.satuan}</td>
                    <td className="p-3.5 text-slate-600">{formatIDR(item.harga_modal)}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{formatIDR(item.harga_jual)}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {item.stok}{' '}
                      {item.stok <= item.stok_minimum && (
                        <span className="neu-badge-green font-bold text-[10px] px-1.5 py-0.5 rounded-full ml-1">Restock</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEditModal(item)} className="p-1.5 text-slate-600 hover:text-slate-900">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id, item.nama)} className="p-1.5 text-slate-600 hover:text-slate-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-md p-6 space-y-4 bg-[#e5e8ed]">
            <div className="flex justify-between items-center border-b border-slate-300 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">{editItem ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowFormModal(false)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            {formError && <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={formData.kategori_id}
                    onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  >
                    {kategoris.map((k) => (
                      <option key={k._id} value={k._id}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cost Price</label>
                  <input
                    type="number"
                    value={formData.harga_modal}
                    onChange={(e) => setFormData({ ...formData, harga_modal: e.target.value })}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Selling Price</label>
                  <input
                    type="number"
                    value={formData.harga_jual}
                    onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={formData.stok_minimum}
                    onChange={(e) => setFormData({ ...formData, stok_minimum: e.target.value })}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1c1e22] text-white rounded-xl font-bold">
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangPage;
