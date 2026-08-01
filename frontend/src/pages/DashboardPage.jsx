import React, { useState, useEffect } from 'react';
import { laporanAPI, barangAPI, transaksiAPI } from '../services/api';
import {
  Search,
  ArrowRight,
  TrendingUp,
  Package,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  Share2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const DashboardPage = ({ setActiveTab }) => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('Workflows');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [laporanRes, monthlyRes, lowStockRes, txRes] = await Promise.all([
        laporanAPI.getLabaRugi(),
        laporanAPI.getMonthlyPreview(new Date().getFullYear()),
        barangAPI.getAll({ lowStock: 'true' }),
        transaksiAPI.getAll()
      ]);

      setSummary(laporanRes.data.ringkasan);
      setMonthlyData(monthlyRes.data.months || []);
      setLowStockItems(lowStockRes.data || []);
      setRecentTxs((txRes.data || []).slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-700" />
        <span className="text-xs font-semibold">Loading Dashboard Data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-slate-500 font-medium">All Your Workflows And Permissions Managed</p>
      </div>

      {/* Main KPI Elevated Neumorphic Card (Exact Reference Image Style) */}
      <div className="neu-card rounded-3xl p-6 space-y-6 max-w-xl shadow-md border border-white/80">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-600">Executions</p>
          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-extrabold text-slate-900 tracking-tight">
              {summary?.totalPendapatan ? (summary.totalPendapatan / 1000000).toFixed(1) + 'M' : '340'}
            </span>
            <span className="neu-badge-green font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
              ↑ 204%
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab && setActiveTab('laba-rugi')}
          className="text-xs font-bold text-slate-800 hover:text-black flex items-center gap-2 tracking-tight transition-colors"
        >
          <span>See Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="neu-card rounded-2xl p-4 space-y-2">
          <p className="text-xs text-slate-500 font-semibold">Total Revenue (Pendapatan)</p>
          <p className="text-xl font-extrabold text-slate-900">{formatIDR(summary?.totalPendapatan)}</p>
          <p className="text-[11px] text-slate-500">Sales Transactions Snapshot</p>
        </div>

        <div className="neu-card rounded-2xl p-4 space-y-2">
          <p className="text-xs text-slate-500 font-semibold">Cost of Goods Sold (HPP)</p>
          <p className="text-xl font-extrabold text-slate-900">{formatIDR(summary?.totalHPP)}</p>
          <p className="text-[11px] text-slate-500">Historical Cost Basis</p>
        </div>

        <div className="neu-card rounded-2xl p-4 space-y-2">
          <p className="text-xs text-slate-500 font-semibold">Net Profit (Laba Bersih)</p>
          <p className="text-xl font-extrabold text-slate-900">{formatIDR(summary?.labaBersih)}</p>
          <p className="text-[11px] text-slate-500">After Operational Expenses</p>
        </div>
      </div>

      {/* Text Underlined Tabs Bar (Workflows, Permissions, Executions) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-6 border-b border-slate-300 text-sm font-semibold text-slate-600">
          {['Workflows', 'Permissions', 'Executions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`pb-2 transition-all relative ${
                activeSubTab === tab ? 'text-slate-900 font-extrabold' : 'hover:text-slate-900'
              }`}
            >
              {tab}
              {activeSubTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Soft Inset Search Box */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full neu-inset rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Main Content Area Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Monthly Revenue Chart (2 cols) */}
          <div className="lg:col-span-2 neu-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Revenue & Executions Chart</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="bulan" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tickFormatter={(v) => `${v / 1000}k`} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val) => [formatIDR(val)]}
                  />
                  <Bar dataKey="pendapatan" name="Omset" fill="#4b5563" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="labaKotor" name="Laba Kotor" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock & Transactions Feed (1 col) */}
          <div className="space-y-4">
            {/* Low Stock Monitoring Box */}
            <div className="neu-card rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <span className="text-xs font-extrabold text-slate-900">Low Stock Monitoring</span>
                <span className="neu-badge-green font-bold text-[10px] px-2 py-0.5 rounded-full">{lowStockItems.length} Items</span>
              </div>

              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">Stok semua barang mencukupi.</p>
              ) : (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 4).map((item) => (
                    <div key={item._id} className="bg-[#dcdfe4] p-2.5 rounded-xl border border-slate-300/80 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-900 truncate max-w-[140px]">{item.nama}</p>
                        <p className="text-[10px] text-slate-500">Min: {item.stok_minimum} {item.satuan}</p>
                      </div>
                      <span className="font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[10px]">
                        {item.stok} {item.satuan}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sales Transactions Box */}
            <div className="neu-card rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <span className="text-xs font-extrabold text-slate-900">Recent Transactions</span>
              </div>

              <div className="space-y-2">
                {recentTxs.map((t) => (
                  <div key={t._id} className="bg-[#dcdfe4] p-2.5 rounded-xl border border-slate-300/80 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[140px]">{t.barang_id?.nama || 'Barang'}</p>
                      <p className="text-[10px] text-slate-500">{t.jumlah} {t.barang_id?.satuan || 'pcs'}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">{formatIDR(t.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
