/**
 * Script migrasi produk dari src/data/products.js ke Supabase
 */

import { createClient } from "@supabase/supabase-js";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.scripts" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_URL atau SUPABASE_SERVICE_KEY tidak ada di .env.scripts");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function loadProducts() {
  const productsPath = join(__dirname, "..", "src", "data", "products.js");
  const fileUrl = pathToFileURL(productsPath).href;
  const mod = await import(fileUrl);
  return mod.products;
}

async function migrate() {
  console.log("🚀 Mulai migrasi produk...\n");

  const { data: categories, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr) {
    console.error("❌ Gagal fetch categories:", catErr.message);
    process.exit(1);
  }

  const { data: brands, error: brandErr } = await supabase.from("brands").select("id, slug, name");
  if (brandErr) {
    console.error("❌ Gagal fetch brands:", brandErr.message);
    process.exit(1);
  }

  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
  const brandMap = Object.fromEntries(brands.map((b) => [b.name.toLowerCase(), b.id]));

  console.log(`📁 ${categories.length} kategori, ${brands.length} brand ditemukan\n`);

  const products = await loadProducts();
  console.log(`📦 ${products.length} produk akan dimigrasikan\n`);

  let successCount = 0;
  let variantCount = 0;
  let errorCount = 0;

  for (const p of products) {
    try {
      const categoryId = categoryMap[p.category];
      const brandId = brandMap[p.brand?.toLowerCase()];

      if (!categoryId) {
        console.log(`⚠️  Skip "${p.name}" — kategori "${p.category}" tidak ditemukan`);
        errorCount++;
        continue;
      }

      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .insert({
          slug: p.slug,
          name: p.name,
          brand_id: brandId || null,
          category_id: categoryId,
          description: p.description || null,
          condition: "baru",
          warranty: p.specs?.warranty || null,
          is_active: true,
          is_new: p.isNew || false,
          is_best_seller: p.isBestSeller || false,
        })
        .select("id")
        .single();

      if (prodErr) {
        if (prodErr.code === "23505") {
          console.log(`⏭️  "${p.name}" sudah ada (skip)`);
        } else {
          console.log(`❌ Gagal insert "${p.name}": ${prodErr.message}`);
          errorCount++;
        }
        continue;
      }

      const productId = prodData.id;

      await supabase.from("product_images").insert({
        product_id: productId,
        url: p.image,
        alt: p.name,
        sort_order: 0,
      });

      const storages = p.specs?.storage || [null];
      const colors = p.specs?.color || [null];
      const basePrice = p.price;
      const promoPrice = p.promoPrice;

      let variantIndex = 0;
      for (const storage of storages) {
        for (const color of colors) {
          const parts = [];
          if (storage) parts.push(storage.replace(/\s/g, ""));
          if (color) parts.push(color.replace(/\s/g, "").slice(0, 8));
          const skuSuffix = parts.join("-") || `V${variantIndex + 1}`;
          const variantName = [storage, color].filter(Boolean).join(" · ") || "Default";

          const { error: varErr } = await supabase.from("product_variants").insert({
            product_id: productId,
            sku: `${p.slug}-${skuSuffix}`.toUpperCase().slice(0, 50),
            name: variantName,
            price: basePrice,
            promo_price: promoPrice,
            stock: p.stock || 0,
            attributes: { storage, color },
            image_url: p.image,
          });

          if (varErr && varErr.code !== "23505") {
            console.log(`  ⚠️  Varian "${variantName}" gagal: ${varErr.message}`);
          } else if (!varErr) {
            variantCount++;
          }
          variantIndex++;
        }
      }

      if (p.specs) {
        const specRows = [];
        if (p.specs.warranty) {
          specRows.push({ product_id: productId, spec_key: "Garansi", spec_value: p.specs.warranty, sort_order: 1 });
        }
        if (p.specs.capacity) {
          specRows.push({ product_id: productId, spec_key: "Kapasitas", spec_value: p.specs.capacity, sort_order: 2 });
        }
        if (p.specs.length) {
          specRows.push({ product_id: productId, spec_key: "Panjang", spec_value: p.specs.length, sort_order: 3 });
        }
        if (specRows.length > 0) {
          await supabase.from("product_specs").insert(specRows);
        }
      }

      console.log(`✅ ${p.name} (${storages.length * colors.length} varian)`);
      successCount++;
    } catch (err) {
      console.log(`❌ Error pada "${p.name}": ${err.message}`);
      errorCount++;
    }
  }

  console.log("\n" + "═".repeat(50));
  console.log(`📊 HASIL MIGRASI:`);
  console.log(`   ✅ Produk berhasil: ${successCount}`);
  console.log(`   📦 Varian dibuat:   ${variantCount}`);
  console.log(`   ⚠️  Error/skip:      ${errorCount}`);
  console.log("═".repeat(50));
  console.log("\n🎉 Selesai!");
}

migrate().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
