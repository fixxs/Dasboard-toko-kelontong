import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Users, Plus, Shield } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('kasir');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create({ nama, username, password, role });
      setShowModal(false);
      setNama('');
      setUsername('');
      setPassword('');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah user');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 neu-card p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System User Management</h1>
          <p className="text-xs text-slate-500 font-medium">Manage Admin and Kasir system user accounts and roles</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1c1e22] text-white hover:bg-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add User Account</span>
        </button>
      </div>

      <div className="neu-card rounded-3xl overflow-hidden p-2">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#d8dce2] uppercase font-bold text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-black/5 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{u.nama}</td>
                    <td className="p-3.5 font-mono text-slate-600">{u.username}</td>
                    <td className="p-3.5 font-bold uppercase text-[10px]">
                      <span className="neu-pill-active px-2.5 py-0.5 rounded-full text-slate-900">{u.role}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="neu-badge-green font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                        {u.status || 'aktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-md p-6 space-y-4 bg-[#e5e8ed]">
            <div className="flex justify-between items-center border-b border-slate-300 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add User Account</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                >
                  <option value="kasir">Kasir (Karyawan)</option>
                  <option value="admin">Admin (Pemilik Toko)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1c1e22] text-white rounded-xl font-bold">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
