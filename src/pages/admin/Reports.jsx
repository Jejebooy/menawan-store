import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, TrendingUp, ShoppingCart, Clock, Download, RefreshCw, Package, DollarSign, AlertTriangle } from "lucide-react";
import { getDateRange, fetchSalesSummary, fetchDailySales, fetchTopProducts, fetchOrdersInRange, exportOrdersToCSV } from "../../services/reportService";
import { formatRupiah } from "../../utils/format";
import { STATUS_CONFIG } from "../../services/orderService";

const PERIODS = [
  { value: "today", label: "Hari Ini" },
  { value: "7days", label: "7 Hari Terakhir" },
  { value: "30days", label: "30 Hari Terakhir" },
  { value: "month", label: "Bulan Ini" },
  { value: "year", label: "Tahun Ini" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "menunggu_konfirmasi", label: "Menunggu Konfirmasi" },
  { value: "menunggu_pembayaran", label: "Menunggu Pembayaran" },
  { value: "dibayar", label: "Dibayar" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

export default function Reports() {
  const [period, setPeriod] = useState("30days");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const range = getDateRange(period);
      const [sum, dailySales, top, orderList] = await Promise.all([fetchSalesSummary(range), fetchDailySales(range), fetchTopProducts(range), fetchOrdersInRange({ ...range, status: statusFilter || undefined })]);

      setSummary(sum);
      setDaily(dailySales);
      setTopProducts(top);
      setOrders(orderList.items);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, statusFilter]);

  function handleExport() {
    if (orders.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportOrdersToCSV(orders, `laporan-penjualan-${date}.csv`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="text-sm text-gray-500">Analisa penjualan & performa toko.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white">
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <button onClick={loadData} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="Refresh">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleExport} className="btn-accent flex items-center gap-2">
            <Download size={16} /> Ekspor CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat laporan...</p>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard icon={DollarSign} label="Total Penjualan" value={formatRupiah(summary?.totalRevenue || 0)} color="green" small />
            <SummaryCard icon={ShoppingCart} label="Total Pesanan" value={summary?.totalOrders || 0} sub={`${summary?.completedCount || 0} selesai`} color="blue" />
            <SummaryCard icon={TrendingUp} label="Rata-rata Order" value={formatRupiah(summary?.avgOrder || 0)} color="purple" small />
            <SummaryCard icon={Clock} label="Pending + Batal" value={`${summary?.pending || 0} + ${summary?.cancelled || 0}`} sub="pending + batal" color="red" />
          </div>

          {/* GRAFIK PENJUALAN HARIAN */}
          <div className="card p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} /> Penjualan Harian
            </h2>
            <DailyChart data={daily} />
          </div>

          {/* TOP PRODUK */}
          <div className="card p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Produk Terlaris
            </h2>
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">Belum ada penjualan produk di periode ini.</div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, idx) => (
                  <div key={`${p.product_name}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="w-6 h-6 rounded-full bg-accent-50 text-accent-600 grid place-items-center text-xs font-bold shrink-0">{idx + 1}</span>
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.product_name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 grid place-items-center shrink-0">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{p.product_name}</p>
                      {p.variant_name && <p className="text-xs text-gray-500 line-clamp-1">{p.variant_name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{p.quantity} terjual</p>
                      <p className="text-xs text-gray-500">{formatRupiah(p.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TABEL ORDER */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
              <h2 className="font-bold">Daftar Pesanan ({orders.length})</h2>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white">
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Belum ada pesanan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                      <th className="px-4 py-3">No. Pesanan</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3">Pembayaran</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const s = STATUS_CONFIG[o.status] || { label: o.status, color: "bg-gray-100" };
                      const date = new Date(o.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });
                      return (
                        <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                          <td className="px-4 py-3 text-gray-600">{date}</td>
                          <td className="px-4 py-3">{o.customer_name}</td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{o.payment_method || "-"}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatRupiah(o.total)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.color}`}>{s.label}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link to={`/admin/pesanan/${o.id}`} className="text-accent-600 hover:underline text-xs font-medium">
                              Detail
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
        </>
      )}
    </div>
  );
}

/**
 * Kartu summary reusable
 */
function SummaryCard({ icon: Icon, label, value, sub, color, small }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg grid place-items-center mb-2 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-bold mt-0.5 ${small ? "text-base" : "text-xl"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

/**
 * Chart bar sederhana — dengan tinggi eksplisit supaya bar SELALU terlihat
 */
function DailyChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="py-12 text-center text-gray-400 text-sm">Belum ada data penjualan di periode ini.</div>;
  }

  const maxTotal = Math.max(...data.map((d) => d.total || 0), 1);

  return (
    <div className="space-y-3">
      {/* Chart area */}
      <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ height: "260px" }}>
        {data.map((d) => {
          const heightPercent = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
          const date = new Date(d.date);
          const label = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          });

          return (
            <div key={d.date} className="flex flex-col items-center justify-end gap-1 shrink-0 group relative h-full" style={{ minWidth: "48px" }}>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                {label}: {formatRupiah(d.total)} · {d.count} order
              </div>

              {/* Value on top of bar */}
              <div className="text-[10px] text-gray-600 font-medium whitespace-nowrap">{formatRupiah(d.total)}</div>

              {/* Bar */}
              <div
                className="w-8 bg-accent-500 rounded-t hover:bg-accent-600 transition cursor-pointer"
                style={{
                  height: `${Math.max(heightPercent, 8)}%`,
                  minHeight: "24px",
                }}
                title={`${label}: ${formatRupiah(d.total)} (${d.count} order)`}
              />

              {/* Date label */}
              <span className="text-[10px] text-gray-500 whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 text-center">Hover bar untuk detail · Total {data.length} hari dengan penjualan</div>
    </div>
  );
}
