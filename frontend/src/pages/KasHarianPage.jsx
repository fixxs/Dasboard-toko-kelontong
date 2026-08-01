import React, { useState, useEffect } from 'react';
import { kasHarianAPI, biayaOperasionalAPI } from '../services/api';
import { Columns, Plus, RefreshCw } from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const KasHarianPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [kasData, setKasData] = useState(null);
  const [kasHistory, setKasHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expense Modal State
  const [showBiayaModal, setShowBiayaModal] = useState(false);
  const [jenisBiaya, setJenisBiaya] = useState('Listrik & Air');
  const [jumlahBiaya, setJumlahBiaya] = useState(0);
  const [keteranganBiaya, setKeteranganBiaya] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        kasHarianAPI.getToday(selectedDate),
        kasHarianAPI.getHistory()
      ]);
      setKasData(todayRes.data);
      setKasHistory(historyRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleAddBiayaSubmit = async (e) => {
    e.preventDefault();
    try {
      await biayaOperasionalAPI.create({
        jenis: jenisBiaya,
        jumlah: Number(jumlahBiaya),
        keterangan: keteranganBiaya,
        tanggal: selectedDate
      });
      setShowBiayaModal(false);
      setJumlahBiaya(0);
      setKeteranganBiaya('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan biaya');
    }
  };

  const handleTutupToko = async () => {
    try {
      await kasHarianAPI.tutupToko({ tanggal: selectedDate });
      alert('Nightly store closing saved!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal tutup toko');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expense Tracking & Daily Cash</h1>
          <p className="text-xs text-slate-500 font-medium">Daily operational expenses and nightly cash closing register</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="neu-inset rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
          />
          <button
            onClick={() => setShowBiayaModal(true)}
            className="flex items-center gap-2 bg-[#1c1e22] text-white hover:bg-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading cash data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="neu-card p-5 rounded-3xl space-y-2">
              <p className="text-xs text-slate-500 font-semibold">Total Cash In (Penjualan)</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatIDR(kasData?.kas_masuk)}</p>
            </div>

            <div className="neu-card p-5 rounded-3xl space-y-2">
              <p className="text-xs text-slate-500 font-semibold">Total Cash Out (Expenses & Stock)</p>
              <p className="text-2xl font-extrabold text-slate-900">{formatIDR(kasData?.kas_keluar)}</p>
            </div>

            <div className="neu-card p-5 rounded-3xl space-y-3 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Ending Balance (Saldo Akhir)</p>
                <p className="text-2xl font-extrabold text-slate-900">{formatIDR(kasData?.saldo_akhir)}</p>
              </div>

              <button
                onClick={handleTutupToko}
                className="w-full bg-[#1c1e22] text-white hover:bg-black font-bold text-xs py-2 rounded-xl"
              >
                Execute Nightly Closing
              </button>
            </div>
          </div>

          <div className="neu-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Expense Breakdown List</h3>
            {kasData?.detail_pengeluaran?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No expenses recorded for this date.</p>
            ) : (
              <div className="space-y-2">
                {kasData?.detail_pengeluaran?.map((item, idx) => (
                  <div key={idx} className="bg-[#dcdfe4] p-3 rounded-xl border border-slate-300 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{item.keterangan}</span>
                    <span className="font-extrabold text-slate-900">{formatIDR(item.jumlah)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Add Expense */}
      {showBiayaModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-md p-6 space-y-4 bg-[#e5e8ed]">
            <div className="flex justify-between items-center border-b border-slate-300 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add Operational Expense</h3>
              <button onClick={() => setShowBiayaModal(false)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            <form onSubmit={handleAddBiayaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Type</label>
                <select
                  value={jenisBiaya}
                  onChange={(e) => setJenisBiaya(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                >
                  <option value="Listrik & Air">Listrik & Air</option>
                  <option value="Sewa Toko">Sewa Toko</option>
                  <option value="Gaji Pegawai">Gaji Pegawai</option>
                  <option value="Kebersihan & Keamanan">Kebersihan & Keamanan</option>
                  <option value="Transportasi">Transportasi</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (IDR)</label>
                <input
                  type="number"
                  required
                  value={jumlahBiaya}
                  onChange={(e) => setJumlahBiaya(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={keteranganBiaya}
                  onChange={(e) => setKeteranganBiaya(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowBiayaModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1c1e22] text-white rounded-xl font-bold">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasHarianPage;
