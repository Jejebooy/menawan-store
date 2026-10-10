import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Package, MapPin, Phone, User, FileText,
  MessageCircle, RefreshCw, AlertCircle, Clock,
} from "lucide-react";
import {
  fetchOrderDetail,
  updateOrderStatus,
  STATUS_CONFIG,
} from "../../services/orderService";
import { formatRupiah } from "../../utils/format";
import { storeInfo } from "../../data/store";

const statusFlow = [
  "menunggu_konfirmasi",
  "menunggu_pembayaran",
  "dibayar",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
  "dikembalikan",
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  async function loadOrder() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOrderDetail(id);
      setOrder(data);
      setNewStatus(data.status);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdateStatus() {
    if (newStatus === order.status) {
      alert("Status tidak berubah");
      return;
    }
    if (!confirm(`Ubah status jadi "${STATUS_CONFIG[newStatus]?.label}"?`)) return;

    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, note);
      setNote("");
      await loadOrder();
    } catch (err) {
      alert("Gagal update status: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-red-300 mb-3" />
        <h2 className="font-semibold mb-1">Pesanan tidak ditemukan</h2>
        <p className="text-sm text-gray-500 mb-4">{error || "Data tidak tersedia."}</p>
        <Link to="/admin/pesanan" className="btn-accent inline-block">
          Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  const s = STATUS_CONFIG[order.status] || { label: order.status, color: "bg-gray-100" };
  const date = new Date(order.created_at).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const waMessage = encodeURIComponent(
    `Halo ${order.customer_name}, ini dari Menawan Store.\n\n` +
      `Kami ingin konfirmasi pesanan Anda:\n` +
      `*No. Pesanan:* ${order.order_number}\n` +
      `*Total:* ${formatRupiah(order.total)}\n\n` +
      `Terima kasih!`
  );
  const waUrl = `https://wa.me/${order.customer_phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${waMessage}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/admin/pesanan"
            className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-2"
          >
            <ChevronLeft size={14} /> Semua Pesanan
          </Link>
          <h1 className="text-2xl font-bold font-mono">{order.order_number}</h1>
          <p className="text-sm text-gray-500">Dibuat: {date}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${s.color}`}>
            {s.label}
          </span>
          <button
            onClick={loadOrder}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          {/* ITEMS */}
          <div className="card p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Package size={18} /> Item Pesanan ({order.order_items?.length || 0})
            </h2>
            <div className="space-y-3">
              {(order.order_items || []).map((item) => (
                <div key={item.id} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 grid place-items-center shrink-0">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-xs text-gray-500">{item.variant_name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <div className="text-right font-medium">
                    {formatRupiah(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkir</span>
                <span>{formatRupiah(order.shipping_cost || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span className="text-accent-600">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="card p-5 space-y-4">
            <h2 className="font-bold flex items-center gap-2">
              <User size={18} /> Data Pelanggan
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Nama</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                  <Phone size={12} /> Telepon
                </p>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                  <MapPin size={12} /> Alamat
                </p>
                <p className="font-medium">{order.customer_address}</p>
              </div>
              {order.customer_note && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <FileText size={12} /> Catatan
                  </p>
                  <p className="italic text-gray-700">{order.customer_note}</p>
                </div>
              )}
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium text-sm"
            >
              <MessageCircle size={16} /> Chat via WhatsApp
            </a>
          </div>

          {/* HISTORY */}
          {order.order_status_history?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Clock size={18} /> Riwayat Status
              </h2>
              <div className="space-y-3">
                {order.order_status_history.map((h) => {
                  const hs = STATUS_CONFIG[h.status] || { label: h.status, color: "bg-gray-100" };
                  const hd = new Date(h.created_at).toLocaleString("id-ID", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  });
                  return (
                    <div key={h.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${hs.color}`}>
                          {hs.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{hd}</p>
                        {h.note && <p className="text-xs text-gray-600 mt-0.5">{h.note}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — UPDATE STATUS */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold">Ubah Status Pesanan</h2>

            <div>
              <label className="text-sm font-medium mb-1 block">Status Baru</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white"
              >
                {statusFlow.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s]?.label || s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Catatan (opsional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Contoh: Paket sudah diserahkan ke kurir JNE"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
              />
            </div>

            <button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === order.status}
              className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            {order.payment_method && (
              <div className="pt-3 border-t border-gray-100 text-sm">
                <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
                <p className="font-medium capitalize">{order.payment_method}</p>
              </div>
            )}

            {order.shipping_method && (
              <div className="pt-3 border-t border-gray-100 text-sm">
                <p className="text-xs text-gray-500 mb-1">Metode Pengiriman</p>
                <p className="font-medium capitalize">{order.shipping_method}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}