import { useState } from "react";
import { AlertCircle, Loader2, Plus, Minus, Save } from "lucide-react";
import Modal from "../ui/Modal";
import { adjustStock } from "../../services/inventoryService";

const REASONS_IN = [
  { value: "restock", label: "Restock dari supplier" },
  { value: "retur", label: "Retur dari pelanggan" },
  { value: "koreksi", label: "Koreksi stok (masuk)" },
];

const REASONS_OUT = [
  { value: "rusak", label: "Barang rusak" },
  { value: "hilang", label: "Barang hilang" },
  { value: "koreksi_keluar", label: "Koreksi stok (keluar)" },
  { value: "sample", label: "Sample / demo" },
];

export default function StockAdjustModal({ open, onClose, variant, onSaved }) {
  const [direction, setDirection] = useState("in"); // "in" atau "out"
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reasons = direction === "in" ? REASONS_IN : REASONS_OUT;

  function resetForm() {
    setDirection("in");
    setAmount("");
    setReason("");
    setNote("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Jumlah harus lebih dari 0");
      return;
    }
    if (!reason) {
      setError("Pilih alasan");
      return;
    }

    const change = direction === "in" ? numAmount : -numAmount;

    setSubmitting(true);
    try {
      await adjustStock({
        variantId: variant.id,
        change,
        reason,
        note,
      });
      resetForm();
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Gagal menyesuaikan stok");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    resetForm();
    onClose?.();
  }

  if (!variant) return null;

  const currentStock = variant.stock || 0;
  const numAmount = Number(amount) || 0;
  const previewStock =
    direction === "in" ? currentStock + numAmount : currentStock - numAmount;
  const previewInvalid = previewStock < 0;

  return (
    <Modal open={open} onClose={handleClose} title="Penyesuaian Stok" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* INFO VARIAN */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <p className="text-xs text-gray-500">SKU</p>
          <p className="font-mono font-medium mb-2">{variant.sku}</p>
          <p className="text-xs text-gray-500">Varian</p>
          <p className="font-medium line-clamp-2">{variant.name}</p>
          <p className="text-xs text-gray-500 mt-2">Stok Saat Ini</p>
          <p className="font-bold text-lg">{currentStock}</p>
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {/* DIRECTION */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tipe Penyesuaian</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setDirection("in");
                setReason("");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition ${
                direction === "in"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Plus size={16} /> Tambah Stok
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection("out");
                setReason("");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition ${
                direction === "out"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Minus size={16} /> Kurangi Stok
            </button>
          </div>
        </div>

        {/* AMOUNT */}
        <div>
          <label className="text-sm font-medium mb-1 block">Jumlah *</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
          />
          {numAmount > 0 && (
            <p className={`text-xs mt-1 ${previewInvalid ? "text-red-600" : "text-gray-500"}`}>
              Stok setelah: <span className="font-medium">{previewStock}</span>
              {previewInvalid && " (invalid — tidak boleh negatif)"}
            </p>
          )}
        </div>

        {/* REASON */}
        <div>
          <label className="text-sm font-medium mb-1 block">Alasan *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 bg-white"
          >
            <option value="">-- Pilih Alasan --</option>
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* NOTE */}
        <div>
          <label className="text-sm font-medium mb-1 block">Catatan (opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Contoh: No. PO-2024-001 dari supplier ABC"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || previewInvalid}
            className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save size={14} /> Simpan
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}