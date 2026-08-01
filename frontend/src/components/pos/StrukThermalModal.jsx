import React, { useEffect, useState } from 'react';
import { Printer, X, CheckCircle2, RefreshCw } from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const StrukThermalModal = ({ notaData, onClose, autoPrint = true }) => {
  const [printingStatus, setPrintingStatus] = useState('mencetak'); // 'mencetak', 'selesai'

  useEffect(() => {
    if (notaData && autoPrint) {
      // Auto trigger print dialog (Alfamart / POS Auto-Print)
      const timer = setTimeout(() => {
        try {
          window.print();
          setPrintingStatus('selesai');
        } catch (e) {
          console.error(e);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [notaData, autoPrint]);

  if (!notaData) return null;

  const handleManualPrint = () => {
    window.print();
  };

  const { no_nota, items, total, metode_pembayaran, uang_diterima, kembalian, nama_pelanggan_kasbon, kasirNama, tanggal } = notaData;

  const formattedDate = new Date(tanggal || Date.now()).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-extrabold text-white">Pembayaran Berhasil!</h3>
              <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Printer className="w-3 h-3 animate-pulse" /> Auto-Printing Struk Thermal...
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div id="printable-struk" className="bg-white text-black p-4 rounded-xl font-mono text-[11px] leading-tight space-y-2 shadow-inner border border-gray-200">
          {/* Receipt Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-gray-400 pb-2">
            <p className="font-bold text-sm uppercase tracking-wider">TOKO KELONTONG BERKAH</p>
            <p className="text-[10px] text-gray-600">Jl. Raya Utama No. 45, Jakarta</p>
            <p className="text-[10px] text-gray-600">Telp: 0812-9988-7766</p>
          </div>

          {/* Receipt Meta */}
          <div className="space-y-0.5 border-b border-dashed border-gray-400 pb-2 text-[10px]">
            <div className="flex justify-between">
              <span>No Nota:</span>
              <span className="font-bold">{no_nota}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{kasirNama || 'Admin'}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="font-bold uppercase">{metode_pembayaran}</span>
            </div>
            {metode_pembayaran === 'kasbon' && nama_pelanggan_kasbon && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>Pelanggan Kasbon:</span>
                <span>{nama_pelanggan_kasbon}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-1 py-1 border-b border-dashed border-gray-400">
            {items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <p className="font-bold">{item.nama}</p>
                <div className="flex justify-between text-gray-700">
                  <span>
                    {item.jumlah} x {formatIDR(item.harga_jual)}
                  </span>
                  <span className="font-semibold">{formatIDR(item.jumlah * item.harga_jual)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total & Payment Summary */}
          <div className="space-y-1 pt-1 font-bold">
            <div className="flex justify-between text-xs">
              <span>TOTAL BELANJA:</span>
              <span>{formatIDR(total)}</span>
            </div>

            {metode_pembayaran === 'tunai' && (
              <>
                <div className="flex justify-between text-[10px] font-normal text-gray-700">
                  <span>Uang Diterima:</span>
                  <span>{formatIDR(uang_diterima)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-normal text-gray-700">
                  <span>Kembalian:</span>
                  <span>{formatIDR(kembalian)}</span>
                </div>
              </>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="text-center pt-3 border-t border-dashed border-gray-400 text-[9px] text-gray-600 space-y-0.5">
            <p className="font-semibold">Terima Kasih Atas Kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat ditukar</p>
          </div>
        </div>

        {/* Print & Action Buttons */}
        <div className="flex items-center gap-2 pt-1 no-print">
          <button
            onClick={handleManualPrint}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-xs transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" /> Cetak Ulang Struk
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/20 text-xs"
          >
            Selesai / Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrukThermalModal;
