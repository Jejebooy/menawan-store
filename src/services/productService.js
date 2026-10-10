import { supabase } from "../lib/supabase";

/* =====================================================
   FUNGSI ADMIN — Manage Produk
   ===================================================== */

/**
 * Fetch semua produk untuk halaman admin
 */
export async function fetchProducts({ search, categoryId, limit = 50, offset = 0 } = {}) {
  let query = supabase.from("products").select(
    `
      id, slug, name, is_active, is_new, is_best_seller, condition, created_at,
      brand:brands ( id, name ),
      category:categories ( id, name, slug ),
      variants:product_variants ( id, price, promo_price, stock ),
      images:product_images ( url, sort_order )
    `,
    { count: "exact" }
  );

  if (search) query = query.ilike("name", `%${search}%`);
  if (categoryId) query = query.eq("category_id", categoryId);

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data || []).map((p) => {
    const prices = (p.variants || []).map((v) => Number(v.promo_price || v.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    const sortedImages = [...(p.images || [])].sort((a, b) => a.sort_order - b.sort_order);
    return {
      ...p,
      minPrice,
      maxPrice,
      totalStock,
      variantCount: p.variants?.length || 0,
      image: sortedImages[0]?.url || null,
    };
  });

  return { items, total: count || 0 };
}

/**
 * Fetch kategori & brand untuk dropdown
 */
export async function fetchCategoriesAndBrands() {
  const [catRes, brandRes] = await Promise.all([supabase.from("categories").select("id, name, slug").order("sort_order"), supabase.from("brands").select("id, name").order("name")]);
  if (catRes.error) throw catRes.error;
  if (brandRes.error) throw brandRes.error;
  return { categories: catRes.data || [], brands: brandRes.data || [] };
}

/**
 * Toggle status aktif produk (soft delete)
 */
export async function toggleProductActive(id, isActive) {
  const { error } = await supabase.from("products").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

/**
 * Hapus produk permanen (cascade ke varian, gambar, specs)
 */
export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Create produk baru + varian + gambar
 */
export async function createProduct({ product, variants, images }) {
  const { data: prodData, error: prodErr } = await supabase.from("products").insert(product).select("id").single();
  if (prodErr) throw prodErr;

  const productId = prodData.id;

  if (images?.length) {
    const imageRows = images.map((img, i) => ({
      product_id: productId,
      url: img.url,
      alt: product.name,
      sort_order: img.sort_order ?? i,
    }));
    const { error: imgErr } = await supabase.from("product_images").insert(imageRows);
    if (imgErr) console.error("Images insert error:", imgErr);
  }

  if (variants?.length) {
    const variantRows = variants.map((v) => ({
      product_id: productId,
      sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: v.name,
      price: Number(v.price),
      promo_price: v.promo_price ? Number(v.promo_price) : null,
      stock: Number(v.stock),
      attributes: v.attributes || {},
      image_url: images?.[0]?.url || null,
    }));
    const { error: varErr } = await supabase.from("product_variants").insert(variantRows);
    if (varErr) throw varErr;
  }

  return productId;
}

/**
 * Update produk existing + replace varian & gambar
 */
export async function updateProduct({ id, product, variants, images }) {
  const { error: prodErr } = await supabase
    .from("products")
    .update({ ...product, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (prodErr) throw prodErr;

  await supabase.from("product_images").delete().eq("product_id", id);
  if (images?.length) {
    const imageRows = images.map((img, i) => ({
      product_id: id,
      url: img.url,
      alt: product.name,
      sort_order: img.sort_order ?? i,
    }));
    await supabase.from("product_images").insert(imageRows);
  }

  await supabase.from("product_variants").delete().eq("product_id", id);
  if (variants?.length) {
    const variantRows = variants.map((v) => ({
      product_id: id,
      sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: v.name,
      price: Number(v.price),
      promo_price: v.promo_price ? Number(v.promo_price) : null,
      stock: Number(v.stock),
      attributes: v.attributes || {},
      image_url: images?.[0]?.url || null,
    }));
    const { error: varErr } = await supabase.from("product_variants").insert(variantRows);
    if (varErr) throw varErr;
  }
}

/**
 * Fetch 1 produk lengkap untuk form edit
 */
export async function fetchProductForEdit(id) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      images:product_images ( url, sort_order ),
      variants:product_variants ( id, sku, name, price, promo_price, stock, attributes )
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;

  if (data.images) {
    data.images.sort((a, b) => a.sort_order - b.sort_order);
  }
  return data;
}

/* =====================================================
   FUNGSI PUBLIK — Untuk Halaman Customer
   ===================================================== */

/**
 * Fetch produk publik (hanya yang is_active = true)
 */
export async function fetchPublicProducts({ search, categorySlug, limit = 100 } = {}) {
  let query = supabase
    .from("products")
    .select(
      `
      id, slug, name, is_new, is_best_seller, created_at,
      brand:brands ( id, name ),
      category:categories ( id, name, slug ),
      variants:product_variants ( id, price, promo_price, stock, attributes ),
      images:product_images ( url, sort_order )
    `
    )
    .eq("is_active", true);

  if (search) query = query.ilike("name", `%${search}%`);

  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", categorySlug).single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  query = query.order("created_at", { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((p) => transformPublicProduct(p));
}

/**
 * Fetch 1 produk publik by slug
 */
export async function fetchPublicProductBySlug(slug) {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, name, description, condition, warranty, is_new, is_best_seller,
      brand:brands ( id, name ),
      category:categories ( id, name, slug ),
      variants:product_variants ( id, sku, name, price, promo_price, stock, attributes, image_url ),
      images:product_images ( url, sort_order, alt ),
      specs:product_specs ( spec_key, spec_value, sort_order )
    `
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw error;
  return transformPublicProductDetail(data);
}

/**
 * Transform row → format UI
 */
function transformPublicProduct(p) {
  const variants = (p.variants || []).filter((v) => (v.stock || 0) >= 0);
  const prices = variants.map((v) => Number(v.promo_price || v.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const hasPromo = variants.some((v) => v.promo_price && v.promo_price < v.price);
  const sortedImages = [...(p.images || [])].sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name || "—",
    brandId: p.brand?.id,
    category: p.category?.slug,
    categoryName: p.category?.name,
    price: maxPrice,
    promoPrice: hasPromo ? minPrice : null,
    minPrice,
    maxPrice,
    image: sortedImages[0]?.url || null,
    images: sortedImages.map((i) => i.url),
    stock: totalStock,
    isNew: p.is_new,
    isBestSeller: p.is_best_seller,
    variants,
    createdAt: p.created_at,
  };
}

function transformPublicProductDetail(p) {
  const base = transformPublicProduct(p);

  const storages = new Set();
  const colors = new Set();
  (p.variants || []).forEach((v) => {
    const attrs = v.attributes || {};
    if (attrs.storage) storages.add(attrs.storage);
    if (attrs.color) colors.add(attrs.color);
  });

  return {
    ...base,
    description: p.description,
    condition: p.condition,
    warranty: p.warranty,
    specs: {
      storage: storages.size > 0 ? Array.from(storages) : null,
      color: colors.size > 0 ? Array.from(colors) : null,
      warranty: p.warranty,
    },
    allSpecs: (p.specs || []).sort((a, b) => a.sort_order - b.sort_order),
  };
}
