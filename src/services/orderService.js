import { supabase } from "../lib/supabase";

/**
 * Fetch daftar pesanan dengan filter
 */
export async function fetchOrders({ search, status, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from("orders")
    .select(
      `
      id, order_number, customer_name, customer_phone,
      subtotal, total, status, created_at,
      order_items ( id )
    `,
      { count: "exact" }
    );

  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data || []).map((o) => ({
    ...o,
    itemCount: o.order_items?.length || 0,
  }));

  return { items, total: count || 0 };
}

/**
 * Fetch detail 1 pesanan lengkap
 */
export async function fetchOrderDetail(id) {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items ( * ),
      payments ( * ),
      shipments ( * ),
      order_status_history ( id, status, note, created_at )
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;

  if (data.order_status_history) {
    data.order_status_history.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  return data;
}

/**
 * Update status pesanan + log history
 */
export async function updateOrderStatus(orderId, newStatus, note = "") {
  const { error: updateErr } = await supabase
    .from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (updateErr) throw updateErr;

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: newStatus,
    note: note || `Status diubah ke ${newStatus}`,
  });
}

/**
 * Statistik dashboard ringkas
 */
export async function fetchOrderStats() {
  const [totalRes, revenueRes, pendingRes] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "dibatalkan"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "menunggu_konfirmasi"),
  ]);

  const totalRevenue = (revenueRes.data || []).reduce(
    (sum, o) => sum + Number(o.total || 0),
    0
  );

  return {
    totalOrders: totalRes.count || 0,
    totalRevenue,
    pendingOrders: pendingRes.count || 0,
  };
}

/**
 * Label & warna status — reusable
 */
export const STATUS_CONFIG = {
  menunggu_konfirmasi: { label: "Menunggu Konfirmasi", color: "bg-amber-100 text-amber-700" },
  menunggu_pembayaran: { label: "Menunggu Pembayaran", color: "bg-orange-100 text-orange-700" },
  dibayar: { label: "Dibayar", color: "bg-blue-100 text-blue-700" },
  diproses: { label: "Diproses", color: "bg-purple-100 text-purple-700" },
  dikirim: { label: "Dikirim", color: "bg-indigo-100 text-indigo-700" },
  selesai: { label: "Selesai", color: "bg-green-100 text-green-700" },
  dibatalkan: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
  dikembalikan: { label: "Dikembalikan", color: "bg-gray-100 text-gray-700" },
};

/**
 * Create order baru dari checkout pelanggan
 */
export async function createOrder({ customer, shipping, payment, items, subtotal }) {
  // 1. Generate order number unik: MWS-YYMMDD-XXXX
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const orderNumber = `MWS-${yy}${mm}${dd}-${rand}`;

  // 2. Insert ke tabel orders
  const { data: orderData, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_note: customer.note || null,
      subtotal: Number(subtotal),
      shipping_cost: 0,
      total: Number(subtotal),
      shipping_method: shipping,
      payment_method: payment,
      status: "menunggu_konfirmasi",
    })
    .select("id")
    .single();

  if (orderErr) throw orderErr;
  const orderId = orderData.id;

  // 3. Insert order_items
  if (items?.length) {
    const itemRows = items.map((item) => ({
      order_id: orderId,
      variant_id: item.variant_id || null,
      product_name: item.name || item.product_name,
      variant_name: item.variantName || item.variant_name || null,
      sku: item.sku || null,
      price: Number(item.promoPrice || item.price),
      quantity: Number(item.quantity),
      image_url: item.image || item.image_url || null,
      attributes: item.variant || item.attributes || {},
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemRows);
    if (itemsErr) console.error("Items insert error:", itemsErr);
  }

  // 4. Log status history awal
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "menunggu_konfirmasi",
    note: "Pesanan dibuat oleh pelanggan",
  });

  return { orderId, orderNumber };
}