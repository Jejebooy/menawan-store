import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Search, Filter, RefreshCw, AlertTriangle, ArrowRight,
} from "lucide-react";
import { fetchOrders, STATUS_CONFIG } from "../../services/orderService";
import { formatRupiah } from "../../utils/format";

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
  { value: "dibayar", label: "Dibayar" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const { items, total } = await fetchOrders({
        search: search || undefined,
        status: status || undefined,
      });
      setOrders(items);
      setTotal(total);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadOrders, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pesanan</h1>
        <p className="text-sm text-gray-500">
          {total > 0 ? `${total} pesanan di database` : "Kelola pesanan pelanggan."}
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nomor pesanan / nama / telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 text-sm bg-white min-w-[200px]"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
          title="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat pesanan...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold mb-1">
              {search || status ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
            </h3>
            <p className="text-sm text-gray-500">
              {search || status
                ? "Coba ubah filter."
                : "Pesanan dari pelanggan akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">No. Pesanan</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3 text-center">Item</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const s = STATUS_CONFIG[o.status] || {
                    label: o.status,
                    color: "bg-gray-100 text-gray-700",
                  };
                  const date = new Date(o.created_at).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  return (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-mono font-medium">{o.order_number}</p>
                        <p className="text-xs text-gray-500">{date}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.customer_name}</p>
                        <p className="text-xs text-gray-500">{o.customer_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {o.itemCount} item
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatRupiah(o.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/pesanan/${o.id}`}
                          className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 text-xs font-medium"
                        >
                          Detail <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}