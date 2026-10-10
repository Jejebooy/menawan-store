import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, MessageCircle, ShieldCheck, Truck, ChevronLeft, AlertCircle } from "lucide-react";
import { storeInfo } from "../data/store";
import { formatRupiah } from "../utils/format";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { fetchPublicProductBySlug } from "../services/productService";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [variant, setVariant] = useState({});
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchPublicProductBySlug(slug)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message || "Produk tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat produk...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-3" />
        <h1 className="text-2xl font-bold mb-2">Produk tidak ditemukan</h1>
        <p className="text-gray-500 mb-6">{error || "Produk tidak tersedia."}</p>
        <Link to="/katalog" className="btn-accent">
          ← Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const hasPromo = product.promoPrice && product.promoPrice < product.price;
  const specs = product.specs || {};

  // Cari varian yang cocok dengan pilihan user
  const matchedVariant = product.variants?.find((v) => {
    const attrs = v.attributes || {};
    const storageMatch = !specs.storage || attrs.storage === variant.Penyimpanan;
    const colorMatch = !specs.color || attrs.color === variant.Warna;
    return storageMatch && colorMatch;
  });

  const activePrice = matchedVariant ? Number(matchedVariant.promo_price || matchedVariant.price) : product.promoPrice || product.price;

  const activeStock = matchedVariant ? matchedVariant.stock : product.stock;

  const missingVariant = (specs.storage && !variant.Penyimpanan) || (specs.color && !variant.Warna);

  const handleAddToCart = () => {
    if (missingVariant || !matchedVariant) return;

    addItem({
      id: product.id,
      variant_id: matchedVariant.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: matchedVariant.price,
      promoPrice: matchedVariant.promo_price,
      variant,
      quantity: 1,
      stock: matchedVariant.stock,
    });
    navigate("/keranjang");
  };

  const waMessage = encodeURIComponent(
    `Halo Menawan Store, saya ingin bertanya tentang:\n\n` +
      `Produk: ${product.name}\n` +
      (Object.entries(variant)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") || "") +
      `\n\nMohon info ketersediaan dan harga terbaru.`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-gray-900">
          Beranda
        </Link>
        <span>/</span>
        <Link to="/katalog" className="hover:text-gray-900">
          Katalog
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <Link to="/katalog" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft size={16} /> Kembali
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-gray-300">No image</div>}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            {product.condition === "bekas" && <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Bekas</span>}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatRupiah(activePrice)}</span>
            {matchedVariant?.promo_price && matchedVariant.promo_price < matchedVariant.price && <span className="text-gray-400 line-through">{formatRupiah(matchedVariant.price)}</span>}
          </div>

          {specs.storage && (
            <div>
              <p className="text-sm font-medium mb-2">Penyimpanan</p>
              <div className="flex gap-2 flex-wrap">
                {specs.storage.map((s) => (
                  <button
                    key={s}
                    onClick={() => setVariant({ ...variant, Penyimpanan: s })}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${variant.Penyimpanan === s ? "border-accent-600 text-accent-600 bg-accent-50" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {specs.color && (
            <div>
              <p className="text-sm font-medium mb-2">Warna</p>
              <div className="flex gap-2 flex-wrap">
                {specs.color.map((c) => (
                  <button
                    key={c}
                    onClick={() => setVariant({ ...variant, Warna: c })}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${variant.Warna === c ? "border-accent-600 text-accent-600 bg-accent-50" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Stok tersedia: <span className={`font-medium ${activeStock === 0 ? "text-red-600" : "text-gray-900"}`}>{activeStock}</span>
          </p>

          {missingVariant && <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">Pilih varian terlebih dahulu.</p>}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={missingVariant || !matchedVariant || activeStock === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                missingVariant || !matchedVariant || activeStock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-accent-600 text-white hover:bg-accent-700"
              }`}
            >
              <ShoppingCart size={18} />
              {activeStock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
            </button>
            <a
              href={`https://wa.me/${storeInfo.waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 transition font-medium"
            >
              <MessageCircle size={18} /> Pesan via WhatsApp
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck size={18} className="shrink-0" />
              <span>{specs.warranty || "Garansi: data perlu dilengkapi"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck size={18} className="shrink-0" /> Kirim dari toko
            </div>
          </div>

          {product.description && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium mb-2">Deskripsi</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
