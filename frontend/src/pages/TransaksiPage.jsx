import React, { useState, useEffect } from 'react';
import { transaksiAPI, barangAPI, kategoriAPI } from '../services/api';
import { ArrowUpDown, RefreshCw, Trash2, Search, Filter } from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const TransaksiPage = ({ userRole }) => {
  const [transaksis, setTransaksis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipeFilter, setTipeFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const tRes = await transaksiAPI.getAll({ tipe: tipeFilter });
      setTransaksis(tRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tipeFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete transaction? Stock will be reversed.')) {
      try {
        await transaksiAPI.delete(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Transactions & Purchase Orders</h1>
          <p className="text-xs text-slate-500 font-medium">Historical audit log of stock in & stock out transactions</p>
        </div>

        <select
          value={tipeFilter}
          onChange={(e) => setTipeFilter(e.target.value)}
          className="neu-inset rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
        >
          <option value="">All Types (Sales & Stock In)</option>
          <option value="keluar">Sales Only (Keluar)</option>
          <option value="masuk">Purchase Orders (Masuk)</option>
        </select>
      </div>

      <div className="neu-card rounded-3xl overflow-hidden p-2">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading transactions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#d8dce2] uppercase font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Qty</th>
                  <th className="p-3.5">Price (Snapshot)</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Method</th>
                  {userRole === 'admin' && <th className="p-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {transaksis.map((t) => (
                  <tr key={t._id} className="hover:bg-black/5 transition-colors">
                    <td className="p-3.5 text-slate-600">{new Date(t.tanggal).toLocaleString('id-ID')}</td>
                    <td className="p-3.5 font-bold text-slate-900">{t.barang_id?.nama || 'Barang'}</td>
                    <td className="p-3.5">
                      <span className="neu-pill-active uppercase font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        {t.tipe}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{t.jumlah} {t.barang_id?.satuan || 'pcs'}</td>
                    <td className="p-3.5 text-slate-600">{formatIDR(t.harga_saat_transaksi)}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{formatIDR(t.total)}</td>
                    <td className="p-3.5 uppercase font-mono text-[10px] text-slate-500">{t.metode_pembayaran || 'tunai'}</td>
                    {userRole === 'admin' && (
                      <td className="p-3.5 text-right">
                        <button onClick={() => handleDelete(t._id)} className="p-1.5 text-slate-500 hover:text-slate-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransaksiPage;
