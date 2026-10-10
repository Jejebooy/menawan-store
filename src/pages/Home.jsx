import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Headphones, BadgeCheck } from "lucide-react";
import { fetchPublicProducts } from "../services/productService";
import { fetchSettings } from "../services/settingsService";
import { categories } from "../data/categories";
import ProductGrid from "../components/product/ProductGrid";
import CategoryCard from "../components/product/CategoryCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    store_hero_image: "",
    store_hero_headline: "Gadget Terbaru, Harga Terbaik.",
    store_hero_subheadline: "Smartphone, iPhone, iPad, dan aksesori original dengan garansi resmi.",
  });

  useEffect(() => {
    fetchPublicProducts({ limit: 50 })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Home fetch error:", err))
      .finally(() => setLoading(false));

    fetchSettings()
      .then((data) => {
        setSettings((prev) => ({
          store_hero_image: data.store_hero_image || "",
          store_hero_headline: data.store_hero_headline || prev.store_hero_headline,
          store_hero_subheadline: data.store_hero_subheadline || prev.store_hero_subheadline,
        }));
      })
      .catch((err) => console.warn("Settings fetch error:", err));
  }, []);

  const newProducts = products.filter((p) => p.isNew).slice(0, 8);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 8);
  const promos = products.filter((p) => p.promoPrice).slice(0, 4);

  const displayNew = newProducts.length > 0 ? newProducts : products.slice(0, 8);
  const displayBest = bestSellers.length > 0 ? bestSellers : products.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-14">
      {/* HERO */}
      <section className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-accent-700 text-white overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6 items-center p-8 md:p-14">
          <div className="space-y-4">
            <span className="inline-block text-xs bg-white/10 px-3 py-1 rounded-full">Promo Gadget Bulan Ini</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{settings.store_hero_headline}</h1>
            <p className="text-gray-300 max-w-md">{settings.store_hero_subheadline}</p>
            <div className="flex gap-3 pt-2 flex-wrap">
              <Link to="/katalog" className="btn-accent">
                Belanja Sekarang
              </Link>
              <Link to="/promo" className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition font-medium">
                Lihat Promo
              </Link>
            </div>
          </div>

          {/* HERO IMAGE */}
          {settings.store_hero_image ? (
            <img src={settings.store_hero_image} alt="Promo banner" className="hidden md:block aspect-video object-cover rounded-xl border border-white/10" />
          ) : (
            <div className="hidden md:flex aspect-video bg-white/5 rounded-xl border border-white/10 items-center justify-center text-center px-6">
              <p className="text-sm text-gray-400">
                Belum ada gambar hero.
                <br />
                Upload di <span className="font-mono text-white">/admin/pengaturan</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* KATEGORI */}
      <section>
        <h2 className="text-xl font-bold mb-4">Kategori Produk</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* PRODUK TERBARU */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produk Terbaru</h2>
          <Link to="/katalog" className="text-sm text-accent-600 font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>
        {loading ? <ProductGridSkeleton /> : <ProductGrid products={displayNew} emptyMessage="Belum ada produk." />}
      </section>

      {/* PROMO */}
      {promos.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Promo Pilihan</h2>
            <Link to="/katalog" className="text-sm text-accent-600 font-medium hover:underline">
              Lihat semua →
            </Link>
          </div>
          <ProductGrid products={promos} />
        </section>
      )}

      {/* TERLARIS */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Produk Terlaris</h2>
          <Link to="/katalog" className="text-sm text-accent-600 font-medium hover:underline">
            Lihat semua →
          </Link>
        </div>
        {loading ? <ProductGridSkeleton /> : <ProductGrid products={displayBest} emptyMessage="Belum ada produk." />}
      </section>

      {/* KEUNGGULAN */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BadgeCheck, title: "Produk Original", desc: "Garansi resmi distributor" },
          { icon: Truck, title: "Pengiriman Cepat", desc: "Same-day & reguler" },
          { icon: ShieldCheck, title: "Pembayaran Aman", desc: "Transfer & e-wallet" },
          { icon: Headphones, title: "CS Responsif", desc: "Via WhatsApp" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-4">
            <Icon className="text-accent-600 mb-2" size={24} />
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
