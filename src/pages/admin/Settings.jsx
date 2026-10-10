import { useEffect, useRef, useState } from "react";
import { Save, Loader2, AlertCircle, CheckCircle2, Store, MessageCircle, MapPin, Camera, ThumbsUp, DollarSign, Upload, X, Image as ImageIcon } from "lucide-react";
import { fetchSettings, updateSettings } from "../../services/settingsService";
import { uploadStoreAsset, deleteFile } from "../../services/storageService";

const DEFAULT_FORM = {
  store_name: "Menawan Store",
  store_description: "",
  store_whatsapp: "",
  store_email: "",
  store_address: "",
  store_hours: "",
  store_instagram: "",
  store_facebook: "",
  shipping_regular_cost: "0",
  shipping_same_day_cost: "0",
  store_hero_image: "",
  store_hero_headline: "Gadget Terbaru, Harga Terbaik.",
  store_hero_subheadline: "Smartphone, iPhone, iPad, dan aksesori original dengan garansi resmi.",
};

export default function Settings() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const heroInputRef = useRef(null);

  useEffect(() => {
    fetchSettings()
      .then((data) => setForm({ ...DEFAULT_FORM, ...data }))
      .catch((err) => setError(err.message || "Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateSettings(form);
      setSuccess("Pengaturan berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  async function handleHeroUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      if (form.store_hero_image) {
        await deleteFile(form.store_hero_image, "store-assets");
      }
      const url = await uploadStoreAsset(file, "hero");
      setForm((prev) => ({ ...prev, store_hero_image: url }));
    } catch (err) {
      setError("Gagal upload: " + err.message);
    } finally {
      setUploading(false);
      if (heroInputRef.current) heroInputRef.current.value = "";
    }
  }

  async function handleHeroRemove() {
    if (!form.store_hero_image) return;
    if (!confirm("Hapus gambar hero?")) return;
    await deleteFile(form.store_hero_image, "store-assets");
    setForm((prev) => ({ ...prev, store_hero_image: "" }));
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-sm text-gray-500">Kelola informasi toko yang tampil di website.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* HERO SECTION */}
        <section className="card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 border-b border-gray-100 pb-3">
            <ImageIcon size={18} /> Banner Hero (Homepage)
          </h2>

          {form.store_hero_image ? (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video max-w-md group">
              <img src={form.store_hero_image} alt="Hero" className="w-full h-full object-cover" />
              <button type="button" onClick={handleHeroRemove} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition" title="Hapus gambar">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => !uploading && heroInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition aspect-video max-w-md grid place-items-center ${
                uploading ? "border-accent-300 bg-accent-50" : "border-gray-200 hover:border-accent-400 hover:bg-gray-50"
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={28} className="mx-auto text-accent-600 mb-2 animate-spin" />
                  <p className="text-sm text-accent-700">Mengupload...</p>
                </>
              ) : (
                <>
                  <Upload size={28} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Upload gambar hero</p>
                  <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, WEBP max 5 MB · 16:9</p>
                </>
              )}
            </div>
          )}

          <input ref={heroInputRef} type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />

          {form.store_hero_image && (
            <button type="button" onClick={() => heroInputRef.current?.click()} disabled={uploading} className="text-sm text-accent-600 hover:underline flex items-center gap-1 disabled:opacity-50">
              <Upload size={14} /> Ganti gambar
            </button>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">Headline Hero</label>
            <input
              type="text"
              value={form.store_hero_headline}
              onChange={set("store_hero_headline")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
              placeholder="Gadget Terbaru, Harga Terbaik."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Sub-headline Hero</label>
            <textarea
              value={form.store_hero_subheadline}
              onChange={set("store_hero_subheadline")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
              placeholder="Smartphone, iPhone, iPad..."
            />
          </div>
        </section>

        {/* PROFIL TOKO */}
        <section className="card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store size={18} /> Profil Toko
          </h2>
          <div>
            <label className="text-sm font-medium mb-1 block">Nama Toko *</label>
            <input type="text" value={form.store_name} onChange={set("store_name")} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Deskripsi Singkat</label>
            <textarea
              value={form.store_description}
              onChange={set("store_description")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
              placeholder="Contoh: Toko gadget & aksesori terpercaya"
            />
          </div>
        </section>

        {/* KONTAK */}
        <section className="card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 border-b border-gray-100 pb-3">
            <MessageCircle size={18} /> Kontak & WhatsApp
          </h2>
          <div>
            <label className="text-sm font-medium mb-1 block">Nomor WhatsApp *</label>
            <input
              type="text"
              value={form.store_whatsapp}
              onChange={set("store_whatsapp")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 font-mono"
              placeholder="6282245160037"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 62 + nomor tanpa 0. Contoh: 6282245160037</p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email Kontak</label>
            <input type="email" value={form.store_email} onChange={set("store_email")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500" placeholder="cs@menawanstore.id" />
          </div>
        </section>

        {/* LOKASI */}
        <section className="card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 border-b border-gray-100 pb-3">
            <MapPin size={18} /> Lokasi & Jam Operasional
          </h2>
          <div>
            <label className="text-sm font-medium mb-1 block">Alamat Toko</label>
            <textarea
              value={form.store_address}
              onChange={set("store_address")}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
              placeholder="Jl. Contoh No. 123, Jakarta"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Jam Operasional</label>
            <input
              type="text"
              value={form.store_hours}
              onChange={set("store_hours")}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
              placeholder="Senin - Sabtu: 09.00 - 21.00"
            />
          </div>
        </section>

        {/* MEDSOS */}
        <section className="card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 border-b border-gray-100 pb-3">
            <Camera size={18} /> Media Sosial
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                <Camera size={14} /> Instagram
              </label>
              <input type="text" value={form.store_instagram} onChange={set("store_instagram")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500" placeholder="@menawanstore" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                <ThumbsUp size={14} /> Facebook
              </label>
              <input type="text" value={form.store_facebook} onChange={set("store_facebook")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500" placeholder="MenawanStore.id" />
            </div>
          </div>
        </section>

        {/* ONGKIR */}
        <section className="card p-5 space-y-4">
          <h2 className="font-bold flex items-center gap-2 border-b border-gray-100 pb-3">
            <DollarSign size={18} /> Ongkos Kirim Default
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Reguler (Rp)</label>
              <input type="number" value={form.shipping_regular_cost} onChange={set("shipping_regular_cost")} min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Same-Day (Rp)</label>
              <input type="number" value={form.shipping_same_day_cost} onChange={set("shipping_same_day_cost")} min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500" />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-accent flex items-center gap-2 disabled:opacity-60">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} /> Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
