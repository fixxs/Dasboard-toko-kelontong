import React from 'react';
import { Clock, LogOut, Shield } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  return (
    <header className="px-6 py-3 border-b border-[#d1d5db] bg-[#e5e8ed] flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 shadow-sm flex items-center justify-center">
            <span className="text-[9px] font-black text-cyan-400 italic">JB</span>
          </div>
          <span className="text-xs font-black text-slate-900 tracking-tight">jb with fixs</span>
        </div>
        <span className="text-slate-400 text-xs">•</span>
        <span className="text-xs text-slate-500 font-medium">Grocery Store Management System</span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 bg-[#dcdfe4] px-3 py-1 rounded-xl border border-[#c9ccd1] font-mono text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
        </div>

        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <Shield className="w-3.5 h-3.5 text-slate-600" />
          <span className="capitalize">{user?.role || 'Admin'}</span>
        </div>

        <button
          onClick={onLogout}
          title="Logout"
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-[#dcdfe4] rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
