import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPublicProducts } from "../services/productService";
import { categories } from "../data/categories";
import ProductGrid from "../components/product/ProductGrid";
import SearchBar from "../components/common/SearchBar";

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Fetch semua produk aktif dari DB sekali
  useEffect(() => {
    setLoading(true);
    fetchPublicProducts({ limit: 200 })
      .then((data) => setAllProducts(data))
      .catch((err) => setError(err.message || "Gagal memuat produk"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setQuery(params.get("q") || "");
    setCategory(params.get("category") || "");
  }, [params]);

  const brands = useMemo(() => [...new Set(allProducts.map((p) => p.brand).filter(Boolean))], [allProducts]);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.brand || "").toLowerCase().includes(q));
    }
    if (category) list = list.filter((p) => p.category === category);
    if (brand) list = list.filter((p) => p.brand === brand);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.minPrice - a.minPrice);
        break;
      default:
      // newest — sudah by created_at desc dari DB
    }
    return list;
  }, [allProducts, query, category, brand, sort, inStockOnly]);

  const updateCategory = (val) => {
    setCategory(val);
    const next = new URLSearchParams(params);
    if (val) next.set("category", val);
    else next.delete("category");
    setParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Katalog Produk</h1>

      <div className="mb-6">
        <SearchBar onSearch={(v) => setQuery(v)} defaultValue={query} />
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-5">
          <div>
            <h3 className="font-semibold mb-2 text-sm">Kategori</h3>
            <div className="space-y-1 text-sm">
              <button onClick={() => updateCategory("")} className={`block w-full text-left py-1 transition ${!category ? "text-accent-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                Semua
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => updateCategory(c.slug)} className={`block w-full text-left py-1 transition ${category === c.slug ? "text-accent-600 font-medium" : "text-gray-600 hover:text-gray-900"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">Merek</h3>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-accent-500">
              <option value="">Semua Merek</option>
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-sm">Urutkan</h3>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-accent-500">
              <option value="newest">Terbaru</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="rounded border-gray-300" />
            Hanya yang tersedia
          </label>
        </aside>

        <div>
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Memuat produk...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-600 text-sm">{error}</div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">{filtered.length} produk ditemukan</p>
              <ProductGrid products={filtered} emptyMessage="Produk tidak ditemukan. Coba ubah filter atau kata kunci." />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
