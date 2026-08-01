import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { User, KeyRound, AlertCircle, ArrowRight, Shield, ShoppingBag } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login({ username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAccount = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#dcdfe4] flex items-center justify-center p-4">
      <div className="w-full max-w-md neu-card rounded-3xl p-8 space-y-6 bg-[#e5e8ed] shadow-2xl border border-white/80">
        {/* JB Brand Logo Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-teal-400 p-1 shadow-xl shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#121417] rounded-full flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20"></div>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-tighter italic">
                JB
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">jb with fixs</h2>
            <p className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest mt-0.5">Speed • Security • Trust</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">Owner: Fikri Rusdinerza</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 border border-rose-300 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username System
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username admin / kasir"
                className="w-full neu-inset rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full neu-inset rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1c1e22] hover:bg-black text-white font-extrabold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Store System'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="p-4 neu-inset rounded-2xl space-y-2 text-xs">
          <p className="font-extrabold text-slate-700 text-center text-[11px] uppercase tracking-wider">
            Quick Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillAccount('admin', 'admin123')}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-[#dcdfe4] hover:bg-[#d0d3d8] text-slate-900 rounded-xl font-bold transition-all border border-slate-300"
            >
              <Shield className="w-3.5 h-3.5" /> Fikri Rusdinerza (Owner)
            </button>

            <button
              type="button"
              onClick={() => handleFillAccount('kasir', 'kasir123')}
              className="flex items-center justify-center gap-1.5 p-2.5 bg-[#dcdfe4] hover:bg-[#d0d3d8] text-slate-900 rounded-xl font-bold transition-all border border-slate-300"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Kasir POS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
