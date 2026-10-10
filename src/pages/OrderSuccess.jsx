import { useParams, Link } from "react-router-dom";
import { CheckCircle2, MessageCircle, Copy, Package, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchOrderDetail } from "../services/orderService";
import { storeInfo } from "../data/store";
import { formatRupiah } from "../utils/format";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchOrderDetail(id)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || "Pesanan tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [id]);

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
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <AlertCircle size={56} className="text-red-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">Pesanan tidak ditemukan</h1>
        <p className="text-gray-500 mb-6">{error || "Nomor pesanan tidak valid."}</p>
        <Link to="/katalog" className="btn-accent inline-block">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const items = order.order_items || [];

  const waLines = [
    `Halo Menawan Store, saya baru saja membuat pesanan:`,
    ``,
    `*Nomor Pesanan:* ${order.order_number}`,
    `*Nama:* ${order.customer_name}`,
    `*Telepon:* ${order.customer_phone}`,
    `*Alamat:* ${order.customer_address}`,
    order.customer_note ? `*Catatan:* ${order.customer_note}` : null,
    ``,
    `*Produk:*`,
    ...items.map((i) => `- ${i.product_name}${i.variant_name ? ` (${i.variant_name})` : ""} × ${i.quantity}`),
    ``,
    `*Subtotal:* ${formatRupiah(order.subtotal)}`,
    `*Pengiriman:* ${order.shipping_method}`,
    `*Pembayaran:* ${order.payment_method}`,
    ``,
    `Mohon konfirmasi ketersediaan stok dan total akhir. Terima kasih!`,
  ].filter(Boolean);

  const waMessage = encodeURIComponent(waLines.join("\n"));
  const waUrl = `https://wa.me/${storeInfo.waNumber}?text=${waMessage}`;

  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <CheckCircle2 size={56} className="text-green-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-1">Pesanan Berhasil Dibuat!</h1>
        <p className="text-gray-500 text-sm">Silakan lanjutkan konfirmasi ke WhatsApp agar pesanan diproses.</p>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Nomor Pesanan</p>
            <p className="font-mono font-bold text-lg">{order.order_number}</p>
          </div>
          <button onClick={copyOrderNumber} className="p-2 rounded-lg hover:bg-white text-gray-600 flex items-center gap-1 text-sm">
            <Copy size={16} />
            {copied ? "Tersalin!" : "Salin"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Nama</p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Telepon</p>
            <p className="font-medium">{order.customer_phone}</p>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-gray-500 text-xs">Alamat</p>
          <p className="font-medium">{order.customer_address}</p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Package size={16} /> Item Pesanan
          </p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.product_name} className="w-14 h-14 rounded object-cover bg-gray-100 shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded bg-gray-100 grid place-items-center shrink-0">
                    <Package size={18} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2 font-medium">{item.product_name}</p>
                  {item.variant_name && <p className="text-xs text-gray-500">{item.variant_name}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {item.quantity} × {formatRupiah(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between">
          <span className="font-bold">Total Sementara</span>
          <span className="font-bold text-accent-600 text-lg">{formatRupiah(order.subtotal)}</span>
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium">
          <MessageCircle size={18} /> Konfirmasi via WhatsApp
        </a>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Link to="/katalog" className="text-center px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium">
            Lanjut Belanja
          </Link>
          <Link to="/" className="text-center px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium">
            Ke Beranda
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center pt-2">
          Status pesanan: <span className="font-medium text-amber-600">Menunggu Konfirmasi</span>
        </p>
      </div>
    </div>
  );
}
