import { MapPin, Phone, Clock, Camera, ThumbsUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-white text-gray-900 rounded-lg grid place-items-center text-sm">
              M
            </span>
            Menawan Store
          </h3>
          <p className="text-sm leading-relaxed">
            Toko gadget & aksesori terpercaya. Menyediakan smartphone, tablet, dan aksesori original dengan garansi resmi.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Kontak</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2 items-start">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>Alamat toko belum diisi</span>
            </li>
            <li className="flex gap-2 items-start">
              <Phone size={16} className="mt-0.5 shrink-0" />
              <span>WhatsApp belum diisi</span>
            </li>
            <li className="flex gap-2 items-start">
              <Clock size={16} className="mt-0.5 shrink-0" />
              <span>Jam operasional belum diisi</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Kategori</h4>
          <ul className="space-y-2 text-sm">
            <li>Smartphone Android</li>
            <li>Apple iPhone</li>
            <li>Apple iPad</li>
            <li>Aksesori</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Ikuti Kami</h4>
          <div className="flex gap-3">
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              aria-label="Instagram"
            >
              <Camera size={18} />
            </a>
            <a
              href="#"
              className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              aria-label="Facebook"
            >
              <ThumbsUp size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Menawan Store. All rights reserved.
      </div>
    </footer>
  );
}