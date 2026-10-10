import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, makeKey } from "../context/CartContext";
import { formatRupiah } from "../utils/format";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal, totalItems } = useCart();

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Keranjang masih kosong</h1>
        <p className="text-gray-500 mb-6">Yuk mulai belanja gadget & aksesori favoritmu.</p>
        <Link to="/katalog" className="btn-accent inline-block">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">
        Keranjang Belanja <span className="text-gray-400 font-normal text-base">({totalItems} item)</span>
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* LIST ITEM */}
        <div className="space-y-3">
          {items.map((item) => {
            const key = makeKey(item);
            const price = item.promoPrice || item.price;
            return (
              <div key={key} className="card p-3 flex gap-3">
                <Link to={`/produk/${item.slug}`} className="shrink-0">
                  <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg bg-gray-100" />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <Link to={`/produk/${item.slug}`} className="text-sm font-medium line-clamp-2 hover:text-accent-600">
                        {item.name}
                      </Link>
                    </div>
                    <button onClick={() => removeItem(key)} className="p-1.5 text-gray-400 hover:text-red-500 shrink-0" aria-label="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {Object.keys(item.variant || {}).length > 0 && (
                    <p className="text-xs text-gray-500">
                      {Object.entries(item.variant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                      <button onClick={() => updateQty(key, item.quantity - 1, item.stock)} className="p-1.5 hover:bg-gray-50 disabled:opacity-40" disabled={item.quantity <= 1} aria-label="Kurangi">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(key, item.quantity + 1, item.stock)} className="p-1.5 hover:bg-gray-50 disabled:opacity-40" disabled={item.quantity >= item.stock} aria-label="Tambah">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatRupiah(price * item.quantity)}</p>
                      {item.quantity > 1 && <p className="text-xs text-gray-500">@ {formatRupiah(price)}</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold text-lg">Ringkasan</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkir</span>
                <span className="text-gray-400 text-xs">Dihitung saat checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-bold">Total Sementara</span>
              <span className="font-bold text-accent-600 text-lg">{formatRupiah(subtotal)}</span>
            </div>

            <Link to="/checkout" className="btn-accent w-full flex items-center justify-center gap-2">
              Checkout <ArrowRight size={16} />
            </Link>

            <Link to="/katalog" className="block text-center text-sm text-gray-500 hover:text-gray-900">
              Lanjut belanja
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
