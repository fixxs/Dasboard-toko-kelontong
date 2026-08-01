import React, { useState } from 'react';
import {
  Home,
  Globe,
  Sparkles,
  Share2,
  Columns,
  Package,
  Settings,
  Clock,
  Archive,
  ChevronDown,
  AlertCircle,
  ShoppingBag,
  Truck,
  Users,
  Sliders
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex shrink-0 select-none p-3 gap-3">
      {/* COLUMN 1: Dark Floating Vertical Icon Bar (Leftmost) */}
      <div className="w-14 dark-icon-bar rounded-3xl py-4 px-2 flex flex-col justify-between items-center shadow-2xl shrink-0">
        <div className="space-y-6 flex flex-col items-center">
          {/* Custom "JB with fixs" Brand Logo Button */}
          <button
            onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'pos')}
            title="JB with fixs — Speed | Security | Trust"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center group hover:scale-105 transition-all"
          >
            <div className="w-full h-full bg-[#121417] rounded-full flex flex-col items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20"></div>
              <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tighter leading-none italic">
                JB
              </span>
            </div>
          </button>

          {/* Navigation Icon Rail */}
          <div className="space-y-3 flex flex-col items-center">
            <button
              onClick={() => setActiveTab('pos')}
              title="Mode POS Kasir"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'pos' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('dashboard')}
                title="Sales Dashboard"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === 'dashboard' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setActiveTab('barang')}
              title="Product Management"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'barang' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('transaksi')}
              title="Sales & Purchase Orders"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'transaksi' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('kas-harian')}
              title="Expense Tracking & Kas"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'kas-harian' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-4 h-4" />
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('laba-rugi')}
                title="Revenue Reports"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === 'laba-rugi' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Settings Icon */}
        <button
          onClick={() => setActiveTab(isAdmin ? 'users' : 'pos')}
          title="Pengaturan & User Accounts"
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* COLUMN 2: Secondary Light Gray Neumorphic Sidebar */}
      <div className="w-72 neu-sidebar rounded-3xl p-4 flex flex-col justify-between border border-[#d1d5db] shadow-sm shrink-0 overflow-y-auto">
        <div className="space-y-5">
          {/* Top Mac OS Window Dots */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block border border-black/10"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block border border-black/10"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block border border-black/10"></span>
            </div>
            <button className="text-slate-400 hover:text-slate-700">
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Profile & JB Brand Banner Header */}
          <div className="p-3 bg-[#dcdfe4] rounded-2xl border border-slate-300 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-[#121417] rounded-full flex items-center justify-center text-[10px] font-black text-cyan-400 italic">
                  JB
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-900 leading-none">jb with fixs</p>
                <p className="text-[9px] font-semibold text-cyan-700 uppercase tracking-tighter">Speed • Security • Trust</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-300/80 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <button onClick={onLogout} className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-slate-900 group">
                  <span className="truncate">{user?.nama || 'Fikri Rusdinerza'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 shrink-0" />
                </button>
                <p className="text-[10px] text-slate-500 truncate">{user?.username ? `${user.username}@kelontong.com` : 'fikri.rusdinerza@kelontong.com'}</p>
              </div>
              <span className="neu-badge-green font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">{user?.role || 'Admin'}</span>
            </div>
          </div>

          {/* Combined Clean Store Management Sidebar Menu */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 tracking-tight px-1 mb-1">Store Workflows</p>

            <button
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pos' ? 'neu-pill-active text-slate-900 font-bold' : 'text-slate-700 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-slate-600" />
                <span>POS Kasir Eceran</span>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard' ? 'neu-pill-active text-slate-900 font-bold' : 'text-slate-700 hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-slate-600" />
                  <span>Sales Dashboard</span>
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab('barang')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'barang' ? 'neu-pill-active text-slate-900 font-bold' : 'text-slate-700 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-slate-600" />
                <span>Product Management</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('transaksi')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transaksi' ? 'neu-pill-active text-slate-900 font-bold' : 'text-slate-700 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-slate-600" />
                <span>Purchase Orders & Sales</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('kategori')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'kategori' ? 'neu-pill-active text-slate-900 font-bold' : 'text-slate-700 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-slate-600" />
                <span>Supplier Management</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('kategori')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'kategori' ? 'neu-pill-active text-slate-900 font-bold' : 'text-slate-700 hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-600" />
                <span>Customer Database</span>
              </div>
            </button>
          </div>

          <hr className="border-t border-[#d1d5db]" />

          {/* Section 2: Audit & Reports */}
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 tracking-tight px-1 mb-1">Audit & Finance</p>

            <button
              onClick={() => setActiveTab(isAdmin ? 'stok-opname' : 'barang')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-black/5 ${
                activeTab === 'stok-opname' ? 'neu-pill-active text-slate-900 font-bold' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-slate-600" />
                <span>Low Stock Monitoring</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('kas-harian')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-black/5 ${
                activeTab === 'kas-harian' ? 'neu-pill-active text-slate-900 font-bold' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Columns className="w-4 h-4 text-slate-600" />
                <span>Expense Tracking</span>
              </div>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('laba-rugi')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-black/5 ${
                  activeTab === 'laba-rugi' ? 'neu-pill-active text-slate-900 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Archive className="w-4 h-4 text-slate-600" />
                  <span>Revenue Reports (P&L)</span>
                </div>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-black/5 ${
                  activeTab === 'users' ? 'neu-pill-active text-slate-900 font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>User Management</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
