import React, { useState, useEffect } from 'react';
import { laporanAPI } from '../services/api';
import { TrendingUp, RefreshCw } from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const LabaRugiPage = () => {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadData = async () => {
    setLoading(true);
    try {
      const lRes = await laporanAPI.getLabaRugi({ month: selectedMonth, year: selectedYear });
      setLaporan(lRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const ringkasan = laporan?.ringkasan;
  const breakdown = laporan?.breakdownKategori || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Revenue Reports & Profit Loss Statement</h1>
          <p className="text-xs text-slate-500 font-medium">Financial breakdown based on historical cost basis (HPP)</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="neu-inset rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
          >
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
              <option key={idx + 1} value={idx + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="neu-inset rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none font-semibold"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Loading report data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 neu-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-300 pb-3">Financial Statement Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-[#dcdfe4] p-3.5 rounded-2xl border border-slate-300">
                <span className="font-semibold text-slate-700">1. Total Revenue (Sales)</span>
                <span className="font-extrabold text-slate-900 text-sm">{formatIDR(ringkasan?.totalPendapatan)}</span>
              </div>
              <div className="flex justify-between items-center bg-[#dcdfe4] p-3.5 rounded-2xl border border-slate-300">
                <span className="font-semibold text-slate-700">2. Cost of Goods Sold (HPP Basis)</span>
                <span className="font-extrabold text-slate-900 text-sm">- {formatIDR(ringkasan?.totalHPP)}</span>
              </div>
              <div className="flex justify-between items-center bg-[#dcdfe4] p-3.5 rounded-2xl border border-slate-300">
                <span className="font-semibold text-slate-700">3. Gross Profit (Omset - HPP)</span>
                <span className="font-extrabold text-slate-900 text-sm">{formatIDR(ringkasan?.labaKotor)}</span>
              </div>
              <div className="flex justify-between items-center bg-[#dcdfe4] p-3.5 rounded-2xl border border-slate-300">
                <span className="font-semibold text-slate-700">4. Operational Expenses</span>
                <span className="font-extrabold text-slate-900 text-sm">- {formatIDR(ringkasan?.totalBiayaOperasional)}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1c1e22] text-white p-4 rounded-2xl shadow-md">
                <span className="font-extrabold text-sm">NET PROFIT (Laba Bersih)</span>
                <span className="font-black text-lg text-white">{formatIDR(ringkasan?.labaBersih)}</span>
              </div>
            </div>
          </div>

          <div className="neu-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-300 pb-3">Category Revenue Breakdown</h3>
            <div className="space-y-2 text-xs">
              {breakdown.map((item, idx) => (
                <div key={idx} className="bg-[#dcdfe4] p-3 rounded-xl border border-slate-300 space-y-1">
                  <div className="flex justify-between font-extrabold text-slate-900">
                    <span>{item.kategori}</span>
                    <span>{formatIDR(item.totalPenjualan)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Qty: {item.totalQty}</span>
                    <span>Gross: {formatIDR(item.labaKotor)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabaRugiPage;
