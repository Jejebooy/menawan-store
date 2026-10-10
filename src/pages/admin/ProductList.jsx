import { useEffect, useState } from "react";
import { Package, Search, Filter, Plus, RefreshCw, Edit3, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { fetchProducts, fetchCategoriesAndBrands, toggleProductActive, deleteProduct } from "../../services/productService";
import { formatRupiah } from "../../utils/format";
import ProductFormModal from "../../components/admin/ProductFormModal";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const { items, total } = await fetchProducts({
        search: search || undefined,
        categoryId: categoryId || undefined,
      });
      setProducts(items);
      setTotal(total);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategoriesAndBrands()
      .then(({ categories }) => setCategories(categories))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId]);

  function handleAddNew() {
    setEditingId(null);
    setModalOpen(true);
  }

  function handleEdit(p) {
    setEditingId(p.id);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingId(null);
  }

  function handleSaved() {
    loadProducts();
  }

  async function handleToggleActive(p) {
    if (!confirm(`${p.is_active ? "Nonaktifkan" : "Aktifkan"} produk "${p.name}"?`)) return;
    try {
      await toggleProductActive(p.id, !p.is_active);
      loadProducts();
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Hapus permanen "${p.name}"?\nTindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteProduct(p.id);
      loadProducts();
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produk</h1>
          <p className="text-sm text-gray-500">{total > 0 ? `${total} produk di database` : "Kelola katalog produk."}</p>
        </div>
        <button onClick={handleAddNew} className="btn-accent flex items-center gap-2">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 text-sm" />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 text-sm bg-white min-w-[180px]">
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button onClick={loadProducts} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" title="Refresh">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Memuat produk...
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold mb-1">{search || categoryId ? "Produk tidak ditemukan" : "Belum ada produk"}</h3>
            <p className="text-sm text-gray-500 mb-4">{search || categoryId ? "Coba ubah filter." : "Mulai tambahkan produk pertama Anda."}</p>
            {!search && !categoryId && (
              <button onClick={handleAddNew} className="btn-accent inline-flex items-center gap-2">
                <Plus size={16} /> Tambah Produk
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right">Harga</th>
                  <th className="px-4 py-3 text-center">Stok</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 grid place-items-center shrink-0">
                            <Package size={18} className="text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">
                            {p.brand?.name || "—"} · {p.variantCount} varian
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {p.minPrice === p.maxPrice ? (
                        <span className="font-medium">{formatRupiah(p.minPrice)}</span>
                      ) : (
                        <span className="text-xs">
                          {formatRupiah(p.minPrice)} — {formatRupiah(p.maxPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.totalStock === 0 ? "bg-red-100 text-red-700" : p.totalStock < 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{p.totalStock}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.is_active ? "Aktif" : "Arsip"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleActive(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title={p.is_active ? "Nonaktifkan" : "Aktifkan"}>
                          {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Edit">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Hapus">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <ProductFormModal open={modalOpen} onClose={handleModalClose} productId={editingId} onSaved={handleSaved} />
    </div>
  );
}
