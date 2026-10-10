import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { formatRupiah } from "../../utils/format";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStock: 0,
    pendingOrders: 0,
    todayOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        // Total pesanan
        const { count: totalOrders } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Total revenue (hanya order yang status != dibatalkan)
        const { data: revenueData } = await supabase
          .from("orders")
          .select("total")
          .neq("status", "dibatalkan");
        const totalRevenue = (revenueData || []).reduce(
          (sum, o) => sum + Number(o.total || 0),
          0
        );

        // Total produk aktif
        const { count: totalProducts } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Stok menipis (< 5)
        const { count: lowStock } = await supabase
          .from("product_variants")
          .select("*", { count: "exact", head: true })
          .lt("stock", 5);

        // Pesanan pending
        const { count: pendingOrders } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "menunggu_konfirmasi");

        // Pesanan hari ini
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: todayOrders } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", todayStart.toISOString());

        setStats({
          totalOrders: totalOrders || 0,
          totalRevenue: totalRevenue || 0,
          totalProducts: totalProducts || 0,
          lowStock: lowStock || 0,
          pendingOrders: pendingOrders || 0,
          todayOrders: todayOrders || 0,
        });

        // Recent orders
        const { data: recent } = await supabase
          .from("orders")
          .select("id, order_number, customer_name, total, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        setRecentOrders(recent || []);
      } catch (err) {
        console.error("loadStats error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statusLabels = {
    menunggu_konfirmasi: { label: "Menunggu", color: "bg-amber-100 text-amber-700" },
    menunggu_pembayaran: { label: "Belum Bayar", color: "bg-orange-100 text-orange-700" },
    dibayar: { label: "Dibayar", color: "bg-blue-100 text-blue-700" },
    diproses: { label: "Diproses", color: "bg-purple-100 text-purple-700" },
    dikirim: { label: "Dikirim", color: "bg-indigo-100 text-indigo-700" },
    selesai: { label: "Selesai", color: "bg-green-100 text-green-700" },
    dibatalkan: { label: "Batal", color: "bg-red-100 text-red-700" },
    dikembalikan: { label: "Dikembalikan", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Halo, {profile?.full_name || "Admin"} 👋</h1>
        <p className="text-sm text-gray-500">Berikut ringkasan toko hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          label="Total Pesanan"
          value={stats.totalOrders}
          sub={`${stats.todayOrders} hari ini`}
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="Total Penjualan"
          value={formatRupiah(stats.totalRevenue)}
          sub="Dari order valid"
          color="green"
          loading={loading}
        />
        <StatCard
          icon={Package}
          label="Produk Aktif"
          value={stats.totalProducts}
          sub="Di katalog"
          color="purple"
          loading={loading}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stok Menipis"
          value={stats.lowStock}
          sub="< 5 unit"
          color="red"
          loading={loading}
          href="/admin/inventaris"
        />
      </div>

      {/* Pending Alert */}
      {stats.pendingOrders > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">
                {stats.pendingOrders} pesanan menunggu konfirmasi
              </p>
              <p className="text-xs text-amber-700">Segera proses agar pelanggan tidak menunggu.</p>
            </div>
          </div>
          <Link to="/admin/pesanan" className="btn-accent whitespace-nowrap">
            Lihat <ArrowRight size={14} className="inline" />
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Pesanan Terbaru</h2>
          <Link to="/admin/pesanan" className="text-sm text-accent-600 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Memuat...</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingCart size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Belum ada pesanan.</p>
            <p className="text-xs text-gray-400 mt-1">
              Pesanan dari pelanggan akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase">
                  <th className="pb-2 pr-3">No. Pesanan</th>
                  <th className="pb-2 pr-3">Pelanggan</th>
                  <th className="pb-2 pr-3">Total</th>
                  <th className="pb-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const s = statusLabels[o.status] || { label: o.status, color: "bg-gray-100" };
                  return (
                    <tr key={o.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pr-3 font-mono text-xs">{o.order_number}</td>
                      <td className="py-2.5 pr-3">{o.customer_name}</td>
                      <td className="py-2.5 pr-3 font-medium">{formatRupiah(o.total)}</td>
                      <td className="py-2.5 pr-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink
          to="/admin/produk"
          icon={Package}
          title="Kelola Produk"
          desc="Tambah, edit, arsipkan produk & varian"
        />
        <QuickLink
          to="/admin/inventaris"
          icon={TrendingUp}
          title="Cek Inventaris"
          desc="Lihat stok, riwayat, dan peringatan"
        />
        <QuickLink
          to="/admin/laporan"
          icon={DollarSign}
          title="Lihat Laporan"
          desc="Penjualan, produk terlaris, ekspor CSV"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, loading, href }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };

  const content = (
    <div className="card p-4">
      <div className={`w-10 h-10 rounded-lg grid place-items-center mb-3 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold mt-0.5">
        {loading ? <span className="text-gray-300">...</span> : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}

function QuickLink({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="card p-4 flex items-start gap-3 hover:border-accent-500">
      <div className="w-10 h-10 rounded-lg bg-accent-50 text-accent-600 grid place-items-center shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}