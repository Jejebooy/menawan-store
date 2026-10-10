import { Link } from "react-router-dom";
import { formatRupiah } from "../../utils/format";

export default function ProductCard({ product }) {
  const hasPromo = product.promoPrice && product.promoPrice < product.price;

  return (
    <Link
      to={`/produk/${product.slug}`}
      className="card group overflow-hidden flex flex-col"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-300 text-xs">
            No image
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded">
              Baru
            </span>
          )}
          {hasPromo && (
            <span className="bg-red-500 text-white text-[10px] font-medium px-2 py-1 rounded">
              Promo
            </span>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 grid place-items-center text-white text-sm font-semibold">
            Stok Habis
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-accent-600 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="font-bold text-gray-900 text-sm">
            {formatRupiah(hasPromo ? product.promoPrice : product.price)}
          </span>
          {hasPromo && (
            <span className="text-xs text-gray-400 line-through">
              {formatRupiah(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}