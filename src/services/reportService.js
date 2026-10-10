import { supabase } from "../lib/supabase";

/**
 * Helper: hitung rentang tanggal dari periode
 */
export function getDateRange(period) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "today":
      // start = today 00:00
      break;
    case "7days":
      start.setDate(start.getDate() - 6);
      break;
    case "30days":
      start.setDate(start.getDate() - 29);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      // default 30 days
      start.setDate(start.getDate() - 29);
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Ringkasan penjualan
 */
export async function fetchSalesSummary({ start, end }) {
  const { data, error } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .gte("created_at", start)
    .lte("created_at", end);
  if (error) throw error;

  const orders = data || [];
  const validOrders = orders.filter((o) => o.status !== "dibatalkan");
  const completedOrders = orders.filter((o) =>
    ["dibayar", "diproses", "dikirim", "selesai"].includes(o.status)
  );

  const totalRevenue = validOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const totalOrders = orders.length;
  const completedCount = completedOrders.length;
  const avgOrder = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  const pending = orders.filter((o) =>
    ["menunggu_konfirmasi", "menunggu_pembayaran"].includes(o.status)
  ).length;

  const cancelled = orders.filter((o) => o.status === "dibatalkan").length;

  return {
    totalRevenue,
    totalOrders,
    completedCount,
    avgOrder,
    pending,
    cancelled,
  };
}

/**
 * Data penjualan harian untuk grafik
 */
export async function fetchDailySales({ start, end }) {
  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at, status")
    .gte("created_at", start)
    .lte("created_at", end)
    .neq("status", "dibatalkan");
  if (error) throw error;

  const byDate = {};
  (data || []).forEach((o) => {
    const date = o.created_at.slice(0, 10); // YYYY-MM-DD
    if (!byDate[date]) byDate[date] = { date, total: 0, count: 0 };
    byDate[date].total += Number(o.total || 0);
    byDate[date].count += 1;
  });

  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Produk terlaris
 */
export async function fetchTopProducts({ start, end, limit = 10 }) {
  const { data: orders, error: orderErr } = await supabase
    .from("orders")
    .select("id")
    .gte("created_at", start)
    .lte("created_at", end)
    .neq("status", "dibatalkan");
  if (orderErr) throw orderErr;

  const orderIds = (orders || []).map((o) => o.id);
  if (orderIds.length === 0) return [];

  const { data: items, error: itemErr } = await supabase
    .from("order_items")
    .select("product_name, variant_name, price, quantity, image_url")
    .in("order_id", orderIds);
  if (itemErr) throw itemErr;

  // Group by product_name + variant_name
  const grouped = {};
  (items || []).forEach((it) => {
    const key = `${it.product_name}::${it.variant_name || ""}`;
    if (!grouped[key]) {
      grouped[key] = {
        product_name: it.product_name,
        variant_name: it.variant_name,
        image_url: it.image_url,
        quantity: 0,
        revenue: 0,
      };
    }
    grouped[key].quantity += it.quantity;
    grouped[key].revenue += Number(it.price) * it.quantity;
  });

  return Object.values(grouped)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

/**
 * Daftar order untuk tabel
 */
export async function fetchOrdersInRange({ start, end, status, limit = 100 }) {
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, total, status, created_at, payment_method",
      { count: "exact" }
    )
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: data || [], total: count || 0 };
}

/**
 * Ekspor data ke CSV (download langsung)
 */
export function exportOrdersToCSV(orders, filename = "laporan-penjualan.csv") {
  const headers = [
    "No. Pesanan",
    "Tanggal",
    "Pelanggan",
    "Metode Pembayaran",
    "Status",
    "Total",
  ];
  const rows = orders.map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleString("id-ID"),
    o.customer_name,
    o.payment_method || "-",
    o.status,
    o.total,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}