import TransaksiBarang from '../models/TransaksiBarang.js';
import Barang from '../models/Barang.js';

export const getTransaksi = async (req, res) => {
  try {
    const { tipe, kategori, startDate, endDate } = req.query;
    let filter = {};

    if (tipe) filter.tipe = tipe;

    if (startDate || endDate) {
      filter.tanggal = {};
      if (startDate) filter.tanggal.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.tanggal.$lte = end;
      }
    }

    let query = TransaksiBarang.find(filter)
      .populate({
        path: 'barang_id',
        populate: { path: 'kategori_id', select: 'nama' }
      })
      .populate('kasir_id', 'nama username role')
      .sort({ tanggal: -1 });

    let data = await query;

    if (kategori) {
      data = data.filter(
        (t) => t.barang_id && t.barang_id.kategori_id && t.barang_id.kategori_id._id.toString() === kategori
      );
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaksi = async (req, res) => {
  try {
    const {
      barang_id,
      items, // For multi-item cart checkout
      tipe,
      jumlah,
      keterangan,
      tanggal,
      metode_pembayaran,
      uang_diterima,
      kembalian,
      nama_pelanggan_kasbon
    } = req.body;

    // Batch Multi-Item POS Checkout
    if (items && Array.isArray(items) && items.length > 0) {
      const notaNo = `NOTA-${Date.now()}`;
      const createdTxList = [];

      for (const item of items) {
        const barang = await Barang.findById(item.barang_id);
        if (!barang) {
          return res.status(404).json({ message: `Barang dengan ID ${item.barang_id} tidak ditemukan` });
        }

        if (tipe === 'keluar' && barang.stok < item.jumlah) {
          return res.status(400).json({ message: `Stok ${barang.nama} tidak mencukupi (Sisa: ${barang.stok})` });
        }

        const harga_saat_transaksi = tipe === 'keluar' ? barang.harga_jual : barang.harga_modal;
        const harga_modal_saat_transaksi = barang.harga_modal;
        const total = item.jumlah * harga_saat_transaksi;

        const tx = await TransaksiBarang.create({
          barang_id: item.barang_id,
          tipe: tipe || 'keluar',
          jumlah: Number(item.jumlah),
          harga_saat_transaksi,
          harga_modal_saat_transaksi,
          total,
          metode_pembayaran: metode_pembayaran || 'tunai',
          uang_diterima: Number(uang_diterima) || 0,
          kembalian: Number(kembalian) || 0,
          nama_pelanggan_kasbon: nama_pelanggan_kasbon || '',
          kasir_id: req.user ? req.user._id : null,
          no_nota: notaNo,
          keterangan: keterangan || 'Transaksi POS Kasir',
          tanggal: tanggal ? new Date(tanggal) : new Date()
        });

        // Update item stock
        if (tipe === 'masuk') {
          barang.stok += Number(item.jumlah);
        } else {
          barang.stok -= Number(item.jumlah);
        }
        await barang.save();

        createdTxList.push(tx);
      }

      return res.status(201).json({
        message: 'Transaksi POS Kasir berhasil disimpan',
        no_nota: notaNo,
        total_items: createdTxList.length,
        transaksi: createdTxList
      });
    }

    // Single item fallback
    if (!barang_id || !tipe || !jumlah || jumlah <= 0) {
      return res.status(400).json({ message: 'Barang, tipe (masuk/keluar), dan jumlah valid wajib diisi' });
    }

    const barang = await Barang.findById(barang_id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    if (tipe === 'keluar' && barang.stok < jumlah) {
      return res.status(400).json({ message: `Stok tidak mencukupi. Stok saat ini: ${barang.stok} ${barang.satuan}` });
    }

    const harga_saat_transaksi = tipe === 'keluar' ? barang.harga_jual : barang.harga_modal;
    const harga_modal_saat_transaksi = barang.harga_modal;
    const total = jumlah * harga_saat_transaksi;

    const transaksi = await TransaksiBarang.create({
      barang_id,
      tipe,
      jumlah: Number(jumlah),
      harga_saat_transaksi,
      harga_modal_saat_transaksi,
      total,
      metode_pembayaran: metode_pembayaran || 'tunai',
      uang_diterima: Number(uang_diterima) || 0,
      kembalian: Number(kembalian) || 0,
      nama_pelanggan_kasbon: nama_pelanggan_kasbon || '',
      kasir_id: req.user ? req.user._id : null,
      no_nota: `NOTA-${Date.now()}`,
      keterangan: keterangan || (tipe === 'keluar' ? 'Penjualan Kasir' : 'Pembelian Stok'),
      tanggal: tanggal ? new Date(tanggal) : new Date()
    });

    if (tipe === 'masuk') {
      barang.stok += Number(jumlah);
    } else {
      barang.stok -= Number(jumlah);
    }
    await barang.save();

    const populatedTx = await TransaksiBarang.findById(transaksi._id).populate({
      path: 'barang_id',
      populate: { path: 'kategori_id', select: 'nama' }
    });

    res.status(201).json(populatedTx);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaksi = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await TransaksiBarang.findById(id);
    if (!tx) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

    const barang = await Barang.findById(tx.barang_id);
    if (barang) {
      if (tx.tipe === 'masuk') {
        barang.stok = Math.max(0, barang.stok - tx.jumlah);
      } else {
        barang.stok += tx.jumlah;
      }
      await barang.save();
    }

    await TransaksiBarang.findByIdAndDelete(id);
    res.json({ message: 'Transaksi berhasil dihapus dan stok dikembalikan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
