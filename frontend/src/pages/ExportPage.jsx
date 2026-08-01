import React, { useState } from 'react';
import { exportAPI } from '../services/api';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';

const ExportPage = () => {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const response = await exportAPI.getExcel({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Toko_Kelontong_${startDate}_sd_${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh file Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setExportingPDF(true);
    try {
      const response = await exportAPI.getPDF({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Laba_Rugi_${startDate}_sd_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh file PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="neu-card p-6 rounded-3xl space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Export Center & Revenue Reports</h1>
        <p className="text-xs text-slate-500 font-medium">Download executive financial statements in Excel & PDF format</p>
      </div>

      <div className="neu-card rounded-3xl p-6 space-y-6 max-w-xl">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="neu-card-interactive p-5 rounded-2xl flex flex-col items-center gap-2 text-slate-800 text-xs font-bold"
          >
            <FileSpreadsheet className="w-8 h-8 text-emerald-700" />
            <span>{exportingExcel ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="neu-card-interactive p-5 rounded-2xl flex flex-col items-center gap-2 text-slate-800 text-xs font-bold"
          >
            <FileText className="w-8 h-8 text-rose-700" />
            <span>{exportingPDF ? 'Exporting...' : 'Export PDF (.pdf)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
