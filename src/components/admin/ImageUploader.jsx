import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadProductImage, deleteProductImage } from "../../services/storageService";

export default function ImageUploader({ images = [], onChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maksimal ${maxImages} gambar`);
      return;
    }

    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        uploaded.push({ url, sort_order: images.length + uploaded.length });
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (index) => {
    const img = images[index];
    if (!confirm("Hapus gambar ini?")) return;
    await deleteProductImage(img.url);
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maksimal ${maxImages} gambar`);
      return;
    }

    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        uploaded.push({ url, sort_order: images.length + uploaded.length });
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">Gambar Produk</label>

      {error && <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>}

      {/* Preview list */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img src={img.url} alt={`Gambar ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-accent-600 text-white px-1.5 py-0.5 rounded">Utama</span>}
              <button type="button" onClick={() => handleRemove(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition" aria-label="Hapus">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      {images.length < maxImages && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${uploading ? "border-accent-300 bg-accent-50 cursor-wait" : "border-gray-200 hover:border-accent-400 hover:bg-gray-50"}`}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="mx-auto text-accent-600 mb-2 animate-spin" />
              <p className="text-sm text-accent-700">Mengupload...</p>
            </>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Klik atau drop gambar di sini</p>
              <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, WEBP max 5 MB · Max {maxImages} gambar</p>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

      <p className="text-xs text-gray-500 flex items-center gap-1">
        <ImageIcon size={12} /> Gambar pertama otomatis jadi gambar utama
      </p>
    </div>
  );
}
