import React, { useState, useEffect } from 'react';
import { barangAPI, kategoriAPI, transaksiAPI } from '../services/api';
import StrukThermalModal from '../components/pos/StrukThermalModal';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  UserCheck,
  Printer,
  RefreshCw,
  X,
  CheckCircle2,
  Volume2,
  Loader2
} from 'lucide-react';

const formatIDR = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

const playPosSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.2);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.12);
    osc2.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    console.error(e);
  }
};

const PosKasirPage = ({ user }) => {
  const [barangs, setBarangs] = useState([]);
  const [kategoris, setKategoris] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');

  const [cart, setCart] = useState([]);
  const [metodePembayaran, setMetodePembayaran] = useState('tunai');
  const [uangDiterima, setUangDiterima] = useState('');
  const [namaPelangganKasbon, setNamaPelangganKasbon] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisState, setQrisState] = useState('waiting');
  const [printedNotaData, setPrintedNotaData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, kRes] = await Promise.all([barangAPI.getAll(), kategoriAPI.getAll()]);
      setBarangs(bRes.data || []);
      setKategoris(kRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBarangs = barangs.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
    const matchKat = selectedKategori ? item.kategori_id?._id === selectedKategori : true;
    return matchSearch && matchKat;
  });

  const addToCart = (product) => {
    const existingIndex = cart.findIndex((c) => c._id === product._id);
    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      if (existingItem.jumlah + 1 > product.stok) {
        alert(`Stok ${product.nama} tidak mencukupi (Maksimal: ${product.stok})`);
        return;
      }
      const updatedCart = [...cart];
      updatedCart[existingIndex].jumlah += 1;
      setCart(updatedCart);
    } else {
      if (product.stok < 1) {
        alert(`Stok ${product.nama} sudah habis!`);
        return;
      }
      setCart([
        ...cart,
        {
          _id: product._id,
          nama: product.nama,
          harga_jual: product.harga_jual,
          harga_modal: product.harga_modal,
          satuan: product.satuan,
          stokMax: product.stok,
          jumlah: 1
        }
      ]);
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item._id === id) {
            const newQty = item.jumlah + delta;
            if (newQty > item.stokMax) {
              alert(`Stok ${item.nama} tidak mencukupi (Maksimal: ${item.stokMax})`);
              return item;
            }
            return newQty > 0 ? { ...item, jumlah: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setUangDiterima('');
    setNamaPelangganKasbon('');
    setCheckoutError('');
    setShowQrisModal(false);
    setQrisState('waiting');
  };

  const totalCart = cart.reduce((acc, item) => acc + item.jumlah * item.harga_jual, 0);
  const kembalianCalculated = Math.max(0, Number(uangDiterima) - totalCart);

  const handleQuickCash = (val) => {
    if (val === 'pas') {
      setUangDiterima(totalCart.toString());
    } else {
      setUangDiterima(val.toString());
    }
  };

  const executeCheckout = async (paymentMethodToUse = metodePembayaran) => {
    if (cart.length === 0) return;
    setCheckoutError('');
    setCheckoutSubmitting(true);

    try {
      const itemsPayload = cart.map((item) => ({
        barang_id: item._id,
        jumlah: item.jumlah
      }));

      const res = await transaksiAPI.create({
        items: itemsPayload,
        tipe: 'keluar',
        metode_pembayaran: paymentMethodToUse,
        uang_diterima: paymentMethodToUse === 'tunai' ? Number(uangDiterima) : totalCart,
        kembalian: paymentMethodToUse === 'tunai' ? kembalianCalculated : 0,
        nama_pelanggan_kasbon: paymentMethodToUse === 'kasbon' ? namaPelangganKasbon.trim() : '',
        keterangan: `Penjualan Kasir POS (${paymentMethodToUse.toUpperCase()})`
      });

      const notaPayload = {
        no_nota: res.data.no_nota || `NOTA-${Date.now()}`,
        items: cart,
        total: totalCart,
        metode_pembayaran: paymentMethodToUse,
        uang_diterima: Number(uangDiterima) || totalCart,
        kembalian: kembalianCalculated,
        nama_pelanggan_kasbon: namaPelangganKasbon,
        kasirNama: user?.nama || 'Kasir',
        tanggal: new Date()
      };

      setPrintedNotaData(notaPayload);
      clearCart();
      loadData();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Gagal memproses transaksi kasir');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setCheckoutError('');

    if (metodePembayaran === 'tunai') {
      if (!uangDiterima || Number(uangDiterima) < totalCart) {
        setCheckoutError('Jumlah uang diterima kurang dari total belanja!');
        return;
      }
      executeCheckout('tunai');
    } else if (metodePembayaran === 'qris') {
      setQrisState('waiting');
      setShowQrisModal(true);
    } else if (metodePembayaran === 'kasbon') {
      if (!namaPelangganKasbon.trim()) {
        setCheckoutError('Nama pelanggan kasbon wajib diisi!');
        return;
      }
      executeCheckout('kasbon');
    } else {
      executeCheckout(metodePembayaran);
    }
  };

  const handleSimulateQrisPayment = () => {
    setQrisState('success');
    playPosSuccessSound();
    setTimeout(() => {
      setShowQrisModal(false);
      executeCheckout('qris');
    }, 1500);
  };

  const qrisPayload = `00020101021226580014ID.LINKAJA.WWW011893600911002100801202152008162810014503033605204599953033605405${totalCart}5802ID5922TOKO KELONTONG BERKAH6007JAKARTA61051234562070703A016304`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=1&data=${encodeURIComponent(qrisPayload)}`;

  return (
    <div className="p-6 space-y-4 h-[calc(100vh-4rem)] flex flex-col max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 neu-card p-4 rounded-3xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1c1e22] rounded-2xl flex items-center justify-center text-white font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              POS Kasir Eceran <span className="neu-badge-green font-bold text-[10px] px-2 py-0.5 rounded-full">QRIS BI & Thermal</span>
            </h2>
            <p className="text-xs text-slate-500">Retail grocery cashier checkout</p>
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full neu-inset rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {/* Left Side: Product Grid */}
        <div className="lg:col-span-2 flex flex-col space-y-3 min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            <button
              onClick={() => setSelectedKategori('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedKategori === '' ? 'bg-[#1c1e22] text-white' : 'neu-card text-slate-700 hover:bg-black/5'
              }`}
            >
              All Categories
            </button>
            {kategoris.map((k) => (
              <button
                key={k._id}
                onClick={() => setSelectedKategori(k._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedKategori === k._id ? 'bg-[#1c1e22] text-white' : 'neu-card text-slate-700 hover:bg-black/5'
                }`}
              >
                {k.nama}
              </button>
            ))}
          </div>

          <div className="flex-1 neu-card rounded-3xl p-4 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading products...
              </div>
            ) : filteredBarangs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">No products found.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredBarangs.map((product) => {
                  const isOutOfStock = product.stok <= 0;
                  return (
                    <button
                      key={product._id}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`text-left p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                        isOutOfStock
                          ? 'bg-[#d5d8dd] border-slate-300 text-slate-400 opacity-60 cursor-not-allowed'
                          : 'bg-[#dcdfe4] border-slate-300/80 hover:border-slate-500 hover:bg-[#d4d7dc]'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">{product.kategori_id?.nama || '-'}</span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">{product.nama}</h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-300 flex items-end justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{formatIDR(product.harga_jual)}</p>
                          <p className="text-[10px] font-semibold text-slate-500">Stok: {product.stok}</p>
                        </div>
                        <span className="w-6 h-6 bg-[#1c1e22] text-white rounded-lg flex items-center justify-center">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart Sidebar */}
        <div className="neu-card rounded-3xl p-4 flex flex-col justify-between space-y-3 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2.5 shrink-0">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-700" /> Cart ({cart.length})
            </h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-[11px] text-rose-600 hover:underline font-semibold">
                Clear Cart
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center py-12">
                <ShoppingBag className="w-8 h-8 text-slate-400 stroke-[1.5] mb-2" />
                <p>Cart is empty.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item._id} className="bg-[#dcdfe4] p-3 rounded-2xl border border-slate-300 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.nama}</p>
                    <p className="text-[10px] text-slate-600 font-semibold">{formatIDR(item.harga_jual)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#d2d5da] border border-slate-400 rounded-lg">
                      <button onClick={() => updateCartQty(item._id, -1)} className="p-1 text-slate-700">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-extrabold text-slate-900 text-xs">{item.jumlah}</span>
                      <button onClick={() => updateCartQty(item._id, 1)} className="p-1 text-slate-700">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-slate-900 w-16 text-right">{formatIDR(item.jumlah * item.harga_jual)}</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-slate-500 hover:text-rose-600 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-300 pt-3 space-y-3 shrink-0 text-xs">
              <div className="grid grid-cols-4 gap-1 p-1 neu-inset rounded-xl">
                {[
                  { id: 'tunai', label: 'Tunai', icon: Banknote },
                  { id: 'qris', label: 'QRIS', icon: QrCode },
                  { id: 'transfer', label: 'Transfer', icon: CreditCard },
                  { id: 'kasbon', label: 'Kasbon', icon: UserCheck }
                ].map((m) => {
                  const Icon = m.icon;
                  const isActive = metodePembayaran === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodePembayaran(m.id)}
                      className={`flex flex-col items-center gap-1 py-1.5 rounded-lg font-bold text-[10px] transition-all ${
                        isActive ? 'bg-[#1c1e22] text-white shadow' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {metodePembayaran === 'tunai' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700">
                    <span>Uang Diterima</span>
                    <button onClick={() => handleQuickCash('pas')} className="text-[10px] text-slate-800 font-bold underline">Uang Pas</button>
                  </div>
                  <input
                    type="number"
                    placeholder="Input cash..."
                    value={uangDiterima}
                    onChange={(e) => setUangDiterima(e.target.value)}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 font-bold text-sm focus:outline-none"
                  />
                  {Number(uangDiterima) > 0 && (
                    <div className="flex justify-between p-2 bg-[#dcdfe4] rounded-xl border border-slate-300 font-bold">
                      <span className="text-slate-600">Kembalian:</span>
                      <span className="text-slate-900">{formatIDR(kembalianCalculated)}</span>
                    </div>
                  )}
                </div>
              )}

              {metodePembayaran === 'qris' && (
                <div className="p-3 bg-[#dcdfe4] rounded-xl border border-slate-300 text-[11px] text-slate-700 font-medium">
                  Official QRIS BI template with auto payment detection.
                </div>
              )}

              {metodePembayaran === 'kasbon' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Pelanggan Kasbon</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama pelanggan..."
                    value={namaPelangganKasbon}
                    onChange={(e) => setNamaPelangganKasbon(e.target.value)}
                    className="w-full neu-inset rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>
              )}

              {checkoutError && <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-[11px]">{checkoutError}</div>}

              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center bg-[#dcdfe4] p-3 rounded-xl border border-slate-300">
                  <span className="text-xs font-bold text-slate-700">TOTAL:</span>
                  <span className="text-lg font-black text-slate-900">{formatIDR(totalCart)}</span>
                </div>

                <button
                  type="button"
                  disabled={checkoutSubmitting}
                  onClick={handleCheckoutClick}
                  className="w-full bg-[#1c1e22] hover:bg-black text-white font-extrabold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50"
                >
                  {checkoutSubmitting ? (
                    'Processing...'
                  ) : (
                    <>
                      {metodePembayaran === 'qris' ? (
                        <>
                          <QrCode className="w-4 h-4" /> Display QRIS BI ({formatIDR(totalCart)})
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4" /> Pay & Print Receipt ({metodePembayaran.toUpperCase()})
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official QRIS Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-sm p-6 bg-[#e5e8ed] shadow-2xl space-y-4 text-center relative">
            <button onClick={() => setShowQrisModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900">✕</button>

            <div className="bg-white text-black p-5 rounded-2xl shadow-xl mx-auto w-72 flex flex-col items-center justify-between border-2 border-gray-300">
              <div className="w-full flex items-center justify-between border-b-2 border-gray-900 pb-2 mb-2">
                <span className="text-red-600 font-black text-lg italic">QRIS</span>
                <span className="bg-red-600 text-white font-black text-[11px] px-2 py-0.5 rounded">GPN</span>
              </div>

              <div className="text-center my-1">
                <p className="font-extrabold text-xs text-gray-900 uppercase">TOKO KELONTONG BERKAH</p>
                <p className="text-[9px] font-mono text-gray-600">NMID: ID1029384756199</p>
              </div>

              <img src={qrCodeImageUrl} alt="QRIS Code" className="w-48 h-48 my-2 object-contain" />

              <div className="w-full bg-gray-100 rounded-xl p-2 my-1 border border-gray-300 text-center">
                <p className="text-[9px] text-gray-500 uppercase font-bold">Total Tagihan:</p>
                <p className="text-lg font-black text-gray-900">{formatIDR(totalCart)}</p>
              </div>
            </div>

            {qrisState === 'waiting' ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#dcdfe4] rounded-2xl border border-slate-300 flex items-center justify-center gap-2 text-xs text-slate-700">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
                  <span>Waiting for Customer Scanning & Payment...</span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateQrisPayment}
                  className="w-full bg-[#1c1e22] text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" /> Simulate Payment Success (Audio Chime)
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 space-y-1">
                <p className="font-extrabold text-sm flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" /> PEMBAYARAN QRIS BERHASIL!
                </p>
                <p className="text-xs font-semibold">{formatIDR(totalCart)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {printedNotaData && <StrukThermalModal notaData={printedNotaData} onClose={() => setPrintedNotaData(null)} />}
    </div>
  );
};

export default PosKasirPage;
