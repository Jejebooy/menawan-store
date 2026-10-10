import { supabase } from "../lib/supabase";

/**
 * Fetch semua varian dengan info produk + brand
 */
export async function fetchInventory({ search, filter } = {}) {
  let query = supabase
    .from("product_variants")
    .select(
      `
      id, sku, name, price, promo_price, stock, attributes, image_url, updated_at,
      product:products (
        id, name, slug, is_active,
        brand:brands ( id, name ),
        category:categories ( id, name )
      )
    `,
      { count: "exact" }
    );

  if (search) {
    query = query.or(`sku.ilike.%${search}%,name.ilike.%${search}%`);
  }

  if (filter === "low") query = query.lt("stock", 5).gt("stock", 0);
  if (filter === "out") query = query.eq("stock", 0);

  query = query.order("stock", { ascending: true }).limit(200);

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data || []).map((v) => ({
    ...v,
    value: Number(v.promo_price || v.price) * (v.stock || 0),
  }));

  return { items, total: count || 0 };
}

/**
 * Ringkasan inventaris
 */
export async function fetchInventorySummary() {
  const { data, error } = await supabase
    .from("product_variants")
    .select("stock, price, promo_price");
  if (error) throw error;

  const variants = data || [];
  const totalSku = variants.length;
  const totalStock = variants.reduce((s, v) => s + (v.stock || 0), 0);
  const totalValue = variants.reduce(
    (s, v) => s + Number(v.promo_price || v.price) * (v.stock || 0),
    0
  );
  const lowStock = variants.filter((v) => v.stock > 0 && v.stock < 5).length;
  const outOfStock = variants.filter((v) => v.stock === 0).length;

  return { totalSku, totalStock, totalValue, lowStock, outOfStock };
}

/**
 * Adjust stok varian + log ke stock_movements
 */
export async function adjustStock({ variantId, change, reason, note = "" }) {
  // 1. Fetch stok saat ini
  const { data: variant, error: fetchErr } = await supabase
    .from("product_variants")
    .select("stock, sku")
    .eq("id", variantId)
    .single();
  if (fetchErr) throw fetchErr;

  const currentStock = variant.stock || 0;
  const newStock = currentStock + change;

  if (newStock < 0) {
    throw new Error(
      `Stok tidak boleh negatif. Stok saat ini: ${currentStock}, perubahan: ${change}`
    );
  }

  // 2. Update stok
  const { error: updateErr } = await supabase
    .from("product_variants")
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq("id", variantId);
  if (updateErr) throw updateErr;

  // 3. Log ke stock_movements
  await supabase.from("stock_movements").insert({
    variant_id: variantId,
    change: change,
    reason: reason,
    note: note || null,
  });

  return { oldStock: currentStock, newStock };
}

/**
 * Fetch riwayat pergerakan stok untuk varian tertentu
 */
export async function fetchStockHistory(variantId, limit = 20) {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("id, change, reason, note, created_at")
    .eq("variant_id", variantId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}