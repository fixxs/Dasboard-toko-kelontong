import React, { useState, useEffect } from 'react';
import { stokOpnameAPI, barangAPI } from '../services/api';
import { RefreshCw, Plus } from 'lucide-react';

const StokOpnamePage = () => {
  const [opnames, setOpnames] = useState([]);
  const [barangs, setBarangs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Audit Modal State
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedBarangId, setSelectedBarangId] = useState('');
  const [stokFisik, setStokFisik] = useState(0);
  const [alasan, setAlasan] = useState('Audit Rutin');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oRes, bRes] = await Promise.all([stokOpnameAPI.getAll(), barangAPI.getAll()]);
      setOpnames(oRes.data || []);
      setBarangs(bRes.data || []);
      if (bRes.data?.length > 0) {
        setSelectedBarangId(bRes.data[0]._id);
        setStokFisik(bRes.data[0].stok);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBarangChange = (id) => {
    setSelectedBarangId(id);
    const b = barangs.find((item) => item._id === id);
    if (b) setStokFisik(b.stok);
  };

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await stokOpnameAPI.create({
        barang_id: selectedBarangId,
        stok_fisik: Number(stokFisik),
        alasan
      });
      setShowAuditModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Audit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBarangObj = barangs.find((b) => b._id === selectedBarangId);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Low Stock Monitoring & Audit</h1>
          <p className="text-xs text-slate-500 font-medium">Physical inventory check vs system stock records</p>
        </div>

        <button
          onClick={() => setShowAuditModal(true)}
          className="flex items-center gap-2 bg-[#1c1e22] text-white hover:bg-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Audit</span>
        </button>
      </div>

      <div className="neu-card rounded-3xl overflow-hidden p-2">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading audit history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#d8dce2] uppercase font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">System Stock</th>
                  <th className="p-3.5">Physical Stock</th>
                  <th className="p-3.5">Discrepancy (Selisih)</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {opnames.map((o) => (
                  <tr key={o._id} className="hover:bg-black/5 transition-colors">
                    <td className="p-3.5 text-slate-600">{new Date(o.tanggal).toLocaleString('id-ID')}</td>
                    <td className="p-3.5 font-bold text-slate-900">{o.barang_id?.nama || 'Barang'}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{o.stok_sistem}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{o.stok_fisik}</td>
                    <td className="p-3.5 font-extrabold">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${o.selisih < 0 ? 'bg-rose-100 text-rose-800' : o.selisih > 0 ? 'neu-badge-green' : 'bg-slate-200 text-slate-700'}`}>
                        {o.selisih > 0 ? `+${o.selisih}` : o.selisih}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{o.alasan}</td>
                    <td className="p-3.5 text-slate-500 font-semibold">{o.user_id?.nama || 'Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAuditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-md p-6 space-y-4 bg-[#e5e8ed]">
            <div className="flex justify-between items-center border-b border-slate-300 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">New Physical Stock Audit</h3>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Product</label>
                <select
                  value={selectedBarangId}
                  onChange={(e) => handleBarangChange(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                >
                  {barangs.map((b) => (
                    <option key={b._id} value={b._id}>{b.nama} (System: {b.stok})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Counted Stock</label>
                <input
                  type="number"
                  required
                  value={stokFisik}
                  onChange={(e) => setStokFisik(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Note</label>
                <select
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                >
                  <option value="Audit Rutin">Audit Rutin</option>
                  <option value="Barang Rusak">Barang Rusak</option>
                  <option value="Barang Expired">Barang Expired</option>
                  <option value="Barang Hilang">Barang Hilang</option>
                  <option value="Koreksi Input">Koreksi Input</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAuditModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#1c1e22] text-white rounded-xl font-bold">
                  {submitting ? 'Saving...' : 'Execute Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StokOpnamePage;
