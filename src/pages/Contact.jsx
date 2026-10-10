import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Mail, MessageCircle, Camera, ThumbsUp, Store, Send } from "lucide-react";
import { fetchSettings } from "../services/settingsService";

const DEFAULT_SETTINGS = {
  store_name: "Menawan Store",
  store_description: "Toko gadget & aksesori terpercaya.",
  store_whatsapp: "6282245160037",
  store_email: "",
  store_address: "Alamat toko belum diisi",
  store_hours: "Jam operasional belum diisi",
  store_instagram: "",
  store_facebook: "",
};

export default function Contact() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", message: "" });

  useEffect(() => {
    fetchSettings()
      .then((data) => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch((err) => console.warn("Settings fetch:", err))
      .finally(() => setLoading(false));
  }, []);

  const waNumber = settings.store_whatsapp || "6282245160037";
  const waDisplay = waNumber.startsWith("62") ? "0" + waNumber.slice(2) : waNumber;

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      alert("Isi nama dan pesan dulu ya");
      return;
    }

    const text = encodeURIComponent(`Halo ${settings.store_name}, saya ${form.name}.\n\n${form.message}`);
    window.open(`https://wa.me/${waNumber}?text=${text}`, "_blank");
    setForm({ name: "", message: "" });
  }

  const instagramUrl = settings.store_instagram ? (settings.store_instagram.startsWith("http") ? settings.store_instagram : `https://instagram.com/${settings.store_instagram.replace("@", "")}`) : "#";

  const facebookUrl = settings.store_facebook ? (settings.store_facebook.startsWith("http") ? settings.store_facebook : `https://facebook.com/${settings.store_facebook}`) : "#";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-14 h-14 rounded-2xl bg-accent-50 text-accent-600 grid place-items-center mx-auto mb-3">
          <Store size={28} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Hubungi {settings.store_name}</h1>
        <p className="text-gray-500">{settings.store_description || "Ada pertanyaan atau butuh bantuan? Kami siap membantu Anda."}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* INFO KONTAK */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="font-bold">Informasi Kontak</h2>

            {/* WhatsApp */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 grid place-items-center shrink-0">
                <MessageCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">WhatsApp</p>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-green-600 break-all">
                  {waDisplay}
                </a>
              </div>
            </div>

            {/* Email */}
            {settings.store_email && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 grid place-items-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <a href={`mailto:${settings.store_email}`} className="font-medium hover:text-blue-600 break-all">
                    {settings.store_email}
                  </a>
                </div>
              </div>
            )}

            {/* Alamat */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 grid place-items-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Alamat</p>
                <p className="font-medium">{settings.store_address}</p>
              </div>
            </div>

            {/* Jam */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 grid place-items-center shrink-0">
                <Clock size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Jam Operasional</p>
                <p className="font-medium">{settings.store_hours}</p>
              </div>
            </div>
          </div>

          {/* MEDSOS */}
          {(settings.store_instagram || settings.store_facebook) && (
            <div className="card p-5 space-y-3">
              <h2 className="font-bold">Ikuti Kami</h2>
              <div className="flex gap-3">
                {settings.store_instagram && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-accent-300 hover:bg-accent-50 transition text-sm">
                    <Camera size={16} /> Instagram
                  </a>
                )}
                {settings.store_facebook && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-accent-300 hover:bg-accent-50 transition text-sm">
                    <ThumbsUp size={16} /> Facebook
                  </a>
                )}
              </div>
            </div>
          )}

          {/* QUICK WA */}
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo ${settings.store_name}, saya ingin bertanya.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium"
          >
            <MessageCircle size={18} /> Chat Langsung via WhatsApp
          </a>
        </div>

        {/* FORM PESAN */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold">Kirim Pesan</h2>
          <p className="text-sm text-gray-500">Isi form di bawah, lalu klik kirim. Pesan akan diteruskan ke WhatsApp kami.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama Anda *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Pesan *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder="Tulis pertanyaan atau pesan Anda di sini..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500 resize-none"
                required
              />
            </div>

            <button type="submit" className="btn-accent w-full flex items-center justify-center gap-2">
              <Send size={16} /> Kirim via WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center">Pesan akan membuka WhatsApp dengan teks yang sudah terisi otomatis.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
