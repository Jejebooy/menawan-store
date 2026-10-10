import { Plus, Trash2, X } from "lucide-react";
import { formatRupiah } from "../../utils/format";

export default function VariantEditor({ variants = [], onChange, productSlug = "" }) {
  const addVariant = () => {
    const newVariant = {
      id: `temp-${Date.now()}`,
      sku: "",
      name: "",
      price: 0,
      promo_price: null,
      stock: 0,
      attributes: {},
      image_url: null,
    };
    onChange([...variants, newVariant]);
  };

  const updateVariant = (index, field, value) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };

    // Auto-generate SKU kalau kosong
    if (field === "name" && !next[index].sku && productSlug) {
      const cleanName = String(value)
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toUpperCase();
      next[index].sku = `${productSlug}-${cleanName}`.slice(0, 50);
    }

    onChange(next);
  };

  const removeVariant = (index) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Varian ({variants.length})</label>
        <button type="button" onClick={addVariant} className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1 font-medium">
          <Plus size={14} /> Tambah Varian
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">Belum ada varian. Klik "Tambah Varian" untuk mulai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={v.id || i} className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500">Varian #{i + 1}</span>
                <button type="button" onClick={() => removeVariant(i)} className="p-1 text-red-500 hover:bg-red-50 rounded" aria-label="Hapus varian">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Varian *</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    placeholder="Contoh: 256GB · Titanium Black"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">SKU</label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value.toUpperCase())}
                    placeholder="Auto-generate"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-accent-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Harga *</label>
                  <input
                    type="number"
                    value={v.price || ""}
                    onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white"
                  />
                  {v.price > 0 && <p className="text-[10px] text-gray-500 mt-0.5">{formatRupiah(v.price)}</p>}
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Harga Promo</label>
                  <input
                    type="number"
                    value={v.promo_price || ""}
                    onChange={(e) => updateVariant(i, "promo_price", e.target.value ? Number(e.target.value) : null)}
                    placeholder="Kosongkan kalau tidak ada promo"
                    min="0"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Stok *</label>
                  <input
                    type="number"
                    value={v.stock || 0}
                    onChange={(e) => updateVariant(i, "stock", Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
