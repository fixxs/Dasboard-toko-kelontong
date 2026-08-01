import { exportToExcel } from '../utils/generateExcel.js';
import { exportToPDF } from '../utils/generatePDF.js';
import TransaksiBarang from '../models/TransaksiBarang.js';
import Barang from '../models/Barang.js';
import StokOpname from '../models/StokOpname.js';
import KasHarian from '../models/KasHarian.js';
import BiayaOperasional from '../models/BiayaOperasional.js';

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
};

export const exportReport = async (req, res) => {
  try {
    const { format = 'excel', reportType = 'laba_rugi', startDate, endDate } = req.query;

    let start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const periodeStr = `${start.toLocaleDateString('id-ID')} s/d ${end.toLocaleDateString('id-ID')}`;

    if (reportType === 'laba_rugi') {
      const salesTx = await TransaksiBarang.find({
        tipe: 'keluar',
        tanggal: { $gte: start, $lte: end }
      }).populate({ path: 'barang_id', populate: { path: 'kategori_id' } });

      const totalPendapatan = salesTx.reduce((acc, curr) => acc + curr.total, 0);
      const totalHPP = salesTx.reduce((acc, curr) => {
        const hpp = (curr.harga_modal_saat_transaksi || curr.barang_id?.harga_modal || 0) * curr.jumlah;
        return acc + hpp;
      }, 0);
      const labaKotor = totalPendapatan - totalHPP;

      const opExpenses = await BiayaOperasional.find({ tanggal: { $gte: start, $lte: end } });
      const totalBiaya = opExpenses.reduce((acc, curr) => acc + curr.jumlah, 0);
      const labaBersih = labaKotor - totalBiaya;

      const title = `Laporan Laba Rugi Toko Kelontong (${periodeStr})`;

      if (format === 'pdf') {
        const headers = ['Komponen Laporan', 'Jumlah (IDR)'];
        const rows = [
          ['Total Pendapatan (Penjualan)', formatRupiah(totalPendapatan)],
          ['Total HPP (Harga Pokok Penjualan)', formatRupiah(totalHPP)],
          ['Laba Kotor', formatRupiah(labaKotor)],
          ['Total Biaya Operasional', formatRupiah(totalBiaya)],
          ['LABA BERSIH', formatRupiah(labaBersih)]
        ];
        const pdfBuffer = await exportToPDF({ title, subtitle: `Periode: ${periodeStr}`, headers, rows });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Laporan_Laba_Rugi_${Date.now()}.pdf"`);
        return res.send(pdfBuffer);
      } else {
        const columns = [
          { header: 'Komponen', key: 'komponen' },
          { header: 'Nilai (IDR)', key: 'nilai' }
        ];
        const data = [
          { komponen: 'Total Pendapatan (Penjualan)', nilai: formatRupiah(totalPendapatan) },
          { komponen: 'Total HPP (Harga Pokok Penjualan)', nilai: formatRupiah(totalHPP) },
          { komponen: 'Laba Kotor', nilai: formatRupiah(labaKotor) },
          { komponen: 'Total Biaya Operasional', nilai: formatRupiah(totalBiaya) },
          { komponen: 'LABA BERSIH', nilai: formatRupiah(labaBersih) }
        ];
        const excelBuffer = await exportToExcel({ title, columns, data });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Laporan_Laba_Rugi_${Date.now()}.xlsx"`);
        return res.send(excelBuffer);
      }
    }

    if (reportType === 'transaksi') {
      const txs = await TransaksiBarang.find({
        tanggal: { $gte: start, $lte: end }
      })
        .populate({ path: 'barang_id', populate: { path: 'kategori_id' } })
        .sort({ tanggal: -1 });

      const title = `Laporan Riwayat Transaksi Barang (${periodeStr})`;

      if (format === 'pdf') {
        const headers = ['Tanggal', 'Barang', 'Kategori', 'Tipe', 'Qty', 'Harga @', 'Total'];
        const rows = txs.map((t) => [
          new Date(t.tanggal).toLocaleDateString('id-ID'),
          t.barang_id?.nama || 'Barang Dihapus',
          t.barang_id?.kategori_id?.nama || '-',
          t.tipe.toUpperCase(),
          `${t.jumlah} ${t.barang_id?.satuan || ''}`,
          formatRupiah(t.harga_saat_transaksi),
          formatRupiah(t.total)
        ]);
        const pdfBuffer = await exportToPDF({ title, subtitle: `Periode: ${periodeStr}`, headers, rows });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Laporan_Transaksi_${Date.now()}.pdf"`);
        return res.send(pdfBuffer);
      } else {
        const columns = [
          { header: 'Tanggal', key: 'tanggalFormatted' },
          { header: 'Nama Barang', key: 'barangNama' },
          { header: 'Kategori', key: 'kategori' },
          { header: 'Tipe', key: 'tipe' },
          { header: 'Jumlah', key: 'jumlah' },
          { header: 'Harga Saat Transaksi', key: 'hargaFormatted' },
          { header: 'Total (IDR)', key: 'totalFormatted' }
        ];
        const data = txs.map((t) => ({
          tanggalFormatted: new Date(t.tanggal).toLocaleDateString('id-ID'),
          barangNama: t.barang_id?.nama || 'Dihapus',
          kategori: t.barang_id?.kategori_id?.nama || '-',
          tipe: t.tipe.toUpperCase(),
          jumlah: `${t.jumlah} ${t.barang_id?.satuan || ''}`,
          hargaFormatted: formatRupiah(t.harga_saat_transaksi),
          totalFormatted: formatRupiah(t.total)
        }));
        const excelBuffer = await exportToExcel({ title, columns, data });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Laporan_Transaksi_${Date.now()}.xlsx"`);
        return res.send(excelBuffer);
      }
    }

    if (reportType === 'stok_opname') {
      const opnames = await StokOpname.find({
        tanggal: { $gte: start, $lte: end }
      })
        .populate({ path: 'barang_id', populate: { path: 'kategori_id' } })
        .sort({ tanggal: -1 });

      const title = `Laporan Stok Opname (${periodeStr})`;

      if (format === 'pdf') {
        const headers = ['Tanggal', 'Barang', 'Stok Sistem', 'Stok Fisik', 'Selisih', 'Alasan'];
        const rows = opnames.map((o) => [
          new Date(o.tanggal).toLocaleDateString('id-ID'),
          o.barang_id?.nama || 'Dihapus',
          o.stok_sistem,
          o.stok_fisik,
          o.selisih > 0 ? `+${o.selisih}` : `${o.selisih}`,
          o.alasan || '-'
        ]);
        const pdfBuffer = await exportToPDF({ title, subtitle: `Periode: ${periodeStr}`, headers, rows });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Stok_Opname_${Date.now()}.pdf"`);
        return res.send(pdfBuffer);
      } else {
        const columns = [
          { header: 'Tanggal', key: 'tgl' },
          { header: 'Nama Barang', key: 'nama' },
          { header: 'Stok Sistem', key: 'sistem' },
          { header: 'Stok Fisik', key: 'fisik' },
          { header: 'Selisih', key: 'selisih' },
          { header: 'Alasan Catatan', key: 'alasan' }
        ];
        const data = opnames.map((o) => ({
          tgl: new Date(o.tanggal).toLocaleDateString('id-ID'),
          nama: o.barang_id?.nama || '-',
          sistem: o.stok_sistem,
          fisik: o.stok_fisik,
          selisih: o.selisih > 0 ? `+${o.selisih}` : o.selisih,
          alasan: o.alasan || '-'
        }));
        const excelBuffer = await exportToExcel({ title, columns, data });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Stok_Opname_${Date.now()}.xlsx"`);
        return res.send(excelBuffer);
      }
    }

    if (reportType === 'barang') {
      const items = await Barang.find().populate('kategori_id').populate('supplier_id').sort({ nama: 1 });
      const title = `Katalog Data Barang Toko Kelontong`;

      if (format === 'pdf') {
        const headers = ['Nama Barang', 'Kategori', 'Satuan', 'Harga Modal', 'Harga Jual', 'Stok', 'Min. Stok'];
        const rows = items.map((i) => [
          i.nama,
          i.kategori_id?.nama || '-',
          i.satuan,
          formatRupiah(i.harga_modal),
          formatRupiah(i.harga_jual),
          i.stok,
          i.stok_minimum
        ]);
        const pdfBuffer = await exportToPDF({ title, subtitle: `Total Jenis Barang: ${items.length}`, headers, rows });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Data_Barang_${Date.now()}.pdf"`);
        return res.send(pdfBuffer);
      } else {
        const columns = [
          { header: 'Nama Barang', key: 'nama' },
          { header: 'Kategori', key: 'kategori' },
          { header: 'Satuan', key: 'satuan' },
          { header: 'Harga Modal', key: 'modal' },
          { header: 'Harga Jual', key: 'jual' },
          { header: 'Stok Saat Ini', key: 'stok' },
          { header: 'Stok Minimum', key: 'minStok' }
        ];
        const data = items.map((i) => ({
          nama: i.nama,
          kategori: i.kategori_id?.nama || '-',
          satuan: i.satuan,
          modal: formatRupiah(i.harga_modal),
          jual: formatRupiah(i.harga_jual),
          stok: i.stok,
          minStok: i.stok_minimum
        }));
        const excelBuffer = await exportToExcel({ title, columns, data });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Data_Barang_${Date.now()}.xlsx"`);
        return res.send(excelBuffer);
      }
    }

    res.status(400).json({ message: 'Jenis laporan tidak valid' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
