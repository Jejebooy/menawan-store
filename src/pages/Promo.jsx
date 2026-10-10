import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Percent, ArrowRight } from "lucide-react";
import { fetchPublicProducts } from "../services/productService";
import ProductGrid from "../components/product/ProductGrid";

export default function Promo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProducts({ limit: 200 })
      .then((data) => {
        // Filter hanya yang punya promo
        setProducts(data.filter((p) => p.promoPrice));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 grid place-items-center">
            <Percent size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Promo Spesial</h1>
            <p className="text-sm text-gray-500">Produk dengan harga spesial, terbatas!</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat promo...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-gray-200 rounded-xl">
          <Percent size={48} className="mx-auto text-gray-300 mb-3" />
          <h2 className="font-semibold mb-1">Belum ada promo saat ini</h2>
          <p className="text-sm text-gray-500 mb-4">Cek lagi nanti atau lihat semua produk kami.</p>
          <Link to="/katalog" className="btn-accent inline-flex items-center gap-2">
            Lihat Katalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{products.length} produk sedang promo</p>
          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}
