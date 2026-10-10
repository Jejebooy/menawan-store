import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import Modal from "../ui/Modal";
import ImageUploader from "./ImageUploader";
import VariantEditor from "./VariantEditor";
import { createProduct, updateProduct, fetchProductForEdit, fetchCategoriesAndBrands } from "../../services/productService";

const emptyForm = {
  name: "",
  slug: "",
  brand_id: "",
  category_id: "",
  description: "",
  condition: "baru",
  warranty: "",
  is_active: true,
  is_new: false,
  is_best_seller: false,
};

export default function ProductFormModal({ open, onClose, productId, onSaved }) {
  const isEdit = !!productId;

  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load categories & brands saat modal dibuka
  useEffect(() => {
    if (!open) return;
    fetchCategoriesAndBrands()
      .then(({ categories, brands }) => {
        setCategories(categories);
        setBrands(brands);
      })
      .catch((err) => setError("Gagal memuat kategori/brand: " + err.message));
  }, [open]);

  // Load produk untuk edit
  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setForm(emptyForm);
      setImages([]);
      setVariants([]);
      setError("");
      return;
    }

    setLoading(true);
    fetchProductForEdit(productId)
      .then((data) => {
        setForm({
          name: data.name || "",
          slug: data.slug || "",
          brand_id: data.brand_id || "",
          category_id: data.category_id || "",
          description: data.description || "",
          condition: data.condition || "baru",
          warranty: data.warranty || "",
          is_active: data.is_active ?? true,
          is_new: data.is_new ?? false,
          is_best_seller: data.is_best_seller ?? false,
        });
        setImages(
          (data.images || []).map((img, i) => ({
            url: img.url,
            sort_order: img.sort_order ?? i,
          }))
        );
        setVariants(
          (data.variants || []).map((v) => ({
            id: v.id,
            sku: v.sku || "",
            name: v.name || "",
            price: v.price || 0,
            promo_price: v.promo_price || null,
            stock: v.stock || 0,
            attributes: v.attributes || {},
          }))
        );
      })
      .catch((err) => setError("Gagal memuat produk: " + err.message))
      .finally(() => setLoading(false));
  }, [open, productId, isEdit]);

  // Auto-generate slug dari nama
  const handleNameChange = (name) => {
    setForm((f) => ({
      ...f,
      name,
      slug: isEdit ? f.slug : slugify(name),
    }));
  };

  const slugify = (str) =>
    String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const validate = () => {
    if (!form.name.trim()) return "Nama produk wajib diisi";
    if (!form.slug.trim()) return "Slug wajib diisi";
    if (!form.category_id) return "Pilih kategori";
    if (variants.length === 0) return "Minimal 1 varian";
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name?.trim()) return `Varian #${i + 1}: nama wajib diisi`;
      if (!v.price || v.price <= 0) return `Varian #${i + 1}: harga harus > 0`;
      if (v.stock < 0) return `Varian #${i + 1}: stok tidak boleh negatif`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    try {
      const productPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        brand_id: form.brand_id || null,
        category_id: form.category_id,
        description: form.description.trim() || null,
        condition: form.condition,
        warranty: form.warranty.trim() || null,
        is_active: form.is_active,
        is_new: form.is_new,
        is_best_seller: form.is_best_seller,
      };

      if (isEdit) {
        await updateProduct({
          id: productId,
          product: productPayload,
          variants,
          images,
        });
      } else {
        await createProduct({
          product: productPayload,
          variants,
          images,
        });
      }

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      if (err.code === "23505") {
        setError("Slug atau SKU sudah dipakai. Coba yang lain.");
      } else {
        setError(err.message || "Gagal menyimpan produk");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Produk" : "Tambah Produk Baru"} size="lg">
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="mx-auto text-accent-600 animate-spin mb-3" />
          <p className="text-sm text-gray-500">Memuat produk...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* GAMBAR */}
          <ImageUploader images={images} onChange={setImages} maxImages={5} />

          {/* INFO DASAR */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Informasi Dasar</h3>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: iPhone 15 Pro Max"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="iphone-15-pro-max"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-accent-500"
              />
              <p className="text-xs text-gray-500 mt-1">Digunakan di URL: /produk/{form.slug || "..."}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Merek</label>
                <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white">
                  <option value="">-- Pilih Merek --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white">
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Kondisi</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white">
                  <option value="baru">Baru</option>
                  <option value="bekas">Bekas</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Garansi</label>
                <input
                  type="text"
                  value={form.warranty}
                  onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                  placeholder="Contoh: 1 Tahun Resmi"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Deskripsi produk, isi paket, dll."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
              />
            </div>
          </div>

          {/* STATUS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Status & Label</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300" />
                Aktif (tampil di katalog)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} className="rounded border-gray-300" />
                Tandai sebagai "Baru"
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.is_best_seller} onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })} className="rounded border-gray-300" />
                Tandai sebagai "Terlaris"
              </label>
            </div>
          </div>

          {/* VARIAN */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
              Varian & Harga <span className="text-red-500">*</span>
            </h3>
            <VariantEditor variants={variants} onChange={setVariants} productSlug={form.slug} />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn-accent flex items-center gap-2 disabled:opacity-60">
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} /> {isEdit ? "Update Produk" : "Simpan Produk"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
