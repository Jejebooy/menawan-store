import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatRupiah } from "../utils/format";
import { createOrder } from "../services/orderService";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    shipping: "regular",
    payment: "transfer",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Keranjang kosong</h1>
        <p className="text-gray-500 mb-6">Tambahkan produk terlebih dahulu.</p>
        <Link to="/katalog" className="btn-accent inline-block">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Nama wajib diisi";
    if (!form.phone.trim()) err.phone = "Nomor telepon wajib diisi";
    else if (!/^[0-9+\-\s]{8,}$/.test(form.phone)) err.phone = "Nomor telepon tidak valid";
    if (!form.address.trim()) err.address = "Alamat wajib diisi";
    if (form.address.trim().length < 10) err.address = "Alamat minimal 10 karakter";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Save order ke Supabase
      const { orderId } = await createOrder({
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim(),
        },
        shipping: form.shipping,
        payment: form.payment,
        items: items.map((i) => ({
          variant_id: i.variant_id || null,
          name: i.name,
          variantName: Object.entries(i.variant || {})
            .map(([k, v]) => `${k}: ${v}`)
            .join(", "),
          sku: i.sku || null,
          price: i.price,
          promoPrice: i.promoPrice,
          quantity: i.quantity,
          image: i.image,
          variant: i.variant,
        })),
        subtotal,
      });

      // 2. Clear cart
      clear();

      // 3. Redirect ke order success
      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || "Gagal membuat pesanan. Coba lagi.");
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 max-w-3xl">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* DATA PELANGGAN */}
          <section className="card p-5 space-y-4">
            <h2 className="font-bold">Data Pelanggan</h2>

            <div>
              <label className="text-sm font-medium mb-1 block">Nama Lengkap *</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.name ? "border-red-400" : "border-gray-200 focus:border-accent-500"}`}
                placeholder="Contoh: Budi Santoso"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Nomor Telepon / WhatsApp *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none ${errors.phone ? "border-red-400" : "border-gray-200 focus:border-accent-500"}`}
                placeholder="Contoh: 08123456789"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Alamat Lengkap *</label>
              <textarea
                value={form.address}
                onChange={set("address")}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none ${errors.address ? "border-red-400" : "border-gray-200 focus:border-accent-500"}`}
                placeholder="Jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Catatan (opsional)</label>
              <textarea
                value={form.note}
                onChange={set("note")}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-500 resize-none"
                placeholder="Contoh: Kirim setelah jam 5 sore"
              />
            </div>
          </section>

          {/* PENGIRIMAN */}
          <section className="card p-5 space-y-3">
            <h2 className="font-bold">Metode Pengiriman</h2>
            {[
              { value: "regular", label: "Reguler (2-4 hari)" },
              { value: "same_day", label: "Same-Day (dalam kota)" },
              { value: "pickup", label: "Ambil di Toko (Gratis)" },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${form.shipping === opt.value ? "border-accent-500 bg-accent-50" : "border-gray-200"}`}>
                <input type="radio" name="shipping" value={opt.value} checked={form.shipping === opt.value} onChange={set("shipping")} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
            <p className="text-xs text-gray-500">* Biaya ongkir akan dikonfirmasi admin via WhatsApp.</p>
          </section>

          {/* PEMBAYARAN */}
          <section className="card p-5 space-y-3">
            <h2 className="font-bold">Metode Pembayaran</h2>
            {[
              { value: "transfer", label: "Transfer Bank Manual" },
              { value: "ewallet", label: "E-Wallet (DANA/OVO/GoPay)" },
              { value: "cod", label: "Bayar di Tempat (COD)" },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${form.payment === opt.value ? "border-accent-500 bg-accent-50" : "border-gray-200"}`}>
                <input type="radio" name="payment" value={opt.value} checked={form.payment === opt.value} onChange={set("payment")} />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
            <p className="text-xs text-gray-500">* Detail pembayaran akan diinfokan admin setelah pesanan diverifikasi.</p>
          </section>
        </div>

        {/* RINGKASAN */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold">Ringkasan Pesanan</h2>

            <div className="space-y-3 max-h-64 overflow-auto pr-1">
              {items.map((item, idx) => {
                const price = item.promoPrice || item.price;
                return (
                  <div key={idx} className="flex gap-2 text-sm">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 font-medium text-xs">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.quantity} × {formatRupiah(price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkir</span>
                <span className="text-xs text-gray-400">Dikonfirmasi admin</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-accent-600 text-lg">{formatRupiah(subtotal)}</span>
            </div>

            <button type="submit" disabled={submitting} className="btn-accent w-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                "Buat Pesanan"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">Pesanan Anda akan dikonfirmasi admin via WhatsApp</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
