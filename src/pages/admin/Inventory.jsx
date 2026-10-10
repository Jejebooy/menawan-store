import { useEffect, useState } from "react";
import {
  Boxes, Search, Filter, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown, Edit3, Package,
} from "lucide-react";
import {
  fetchInventory,
  fetchInventorySummary,
} from "../../services/inventoryService";
import { formatRupiah } from "../../utils/format";
import StockAdjustModal from "../../components/admin/StockAdjustModal";

const FILTERS = [
  { value: "", label: "Semua Varian" },
  { value: "low", label: "Stok Menipis (< 5)" },
  { value: "out", label: "Stok Habis" },
];

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [inv, sum] = await Promise.all([
        fetchInventory({ search: search || undefined, filter: filter || undefined }),
        fetchInventorySummary(),
      ]);
      setItems(inv.items);
      setSummary(sum);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat inventaris");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  function handleAdjust(variant) {
    setSelectedVariant(variant);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedVariant(null);
  }

  function handleSaved() {
    loadData();
  }

  function getStockBadge(stock) {
    if (stock === 0) return { label: "Habis", color: "bg-red-100 text-red-700" };
    if (stock < 5) return { label: "Menipis", color: "bg-amber-100 text-amber-700" };
    if (stock < 20) return { label: "Sedang", color: "bg-blue-100 text-blue-700" };
    return { label: "Aman", color: "bg-green-100 text-green-700" };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Inventaris</h1>
        <p className="text-sm text-gray-500">
          Kelola stok semua varian produk toko.
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={Boxes}
            label="Total SKU"
            value={summary.totalSku}
            color="blue"
          />
          <SummaryCard
            icon={Package}
            label="Total Unit"
            value={summary.totalStock}
            color="purple"
          />
          <SummaryCard
            icon={TrendingUp}
            label="Nilai Inventaris"
            value={formatRupiah(summary.totalValue)}
            color="green"
            small
          />
          <SummaryCard
            icon={AlertTriangle}
            label="Stok Menipis + Habis"
            value={`${summary.lowStock} + ${summary.outOfStock}`}
            color="red"
            sub="menipis + habis"
          />
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari SKU atau nama varian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 text-sm bg-white min-w-[200px]"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={loadData}
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
            Memuat inventaris...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <Boxes size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold mb-1">
              {search || filter ? "Tidak ada varian ditemukan" : "Belum ada varian"}
            </h3>
            <p className="text-sm text-gray-500">
              {search || filter
                ? "Coba ubah filter."
                : "Tambahkan produk dulu di halaman Produk."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Produk / Varian</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Harga</th>
                  <th className="px-4 py-3 text-center">Stok</th>
                  <th className="px-4 py-3 text-right">Nilai</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((v) => {
                  const badge = getStockBadge(v.stock);
                  return (
                    <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {v.image_url ? (
                            <img
                              src={v.image_url}
                              alt={v.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 grid place-items-center shrink-0">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{v.product?.name || "—"}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{v.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{v.sku}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium">
                          {formatRupiah(v.promo_price || v.price)}
                        </span>
                        {v.promo_price && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatRupiah(v.price)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                            {v.stock}
                          </span>
                          <span className="text-[10px] text-gray-500">{badge.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {formatRupiah(v.value)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleAdjust(v)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-accent-50 hover:border-accent-300 hover:text-accent-700 transition"
                        >
                          <Edit3 size={12} /> Sesuaikan
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <StockAdjustModal
        open={modalOpen}
        onClose={handleModalClose}
        variant={selectedVariant}
        onSaved={handleSaved}
      />
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, sub, small }) {
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