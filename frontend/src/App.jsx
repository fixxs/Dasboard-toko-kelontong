import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import DashboardPage from './pages/DashboardPage';
import BarangPage from './pages/BarangPage';
import TransaksiPage from './pages/TransaksiPage';
import KasHarianPage from './pages/KasHarianPage';
import LabaRugiPage from './pages/LabaRugiPage';
import StokOpnamePage from './pages/StokOpnamePage';
import ExportPage from './pages/ExportPage';
import KategoriSupplierPage from './pages/KategoriSupplierPage';
import UserManagementPage from './pages/UserManagementPage';
import PosKasirPage from './pages/PosKasirPage';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'kasir') {
        setActiveTab('pos');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'kasir') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dcdfe4] flex items-center justify-center text-slate-700 text-xs font-semibold">
        Initializing Store System...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#dcdfe4] text-[#1c1e22] flex overflow-hidden">
      {/* Dual Sidebar Component */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      {/* Main Content Layout Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'pos' && <PosKasirPage user={user} />}
          {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'barang' && <BarangPage />}
          {activeTab === 'transaksi' && <TransaksiPage userRole={user.role} />}
          {activeTab === 'kas-harian' && <KasHarianPage />}
          {activeTab === 'laba-rugi' && <LabaRugiPage />}
          {activeTab === 'stok-opname' && <StokOpnamePage />}
          {activeTab === 'export' && <ExportPage />}
          {activeTab === 'kategori' && <KategoriSupplierPage />}
          {activeTab === 'users' && <UserManagementPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
