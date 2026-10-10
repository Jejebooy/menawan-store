import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold mb-3 text-gray-900">404</h1>
      <p className="text-gray-500 mb-6">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Link to="/" className="btn-accent">
        Kembali ke Beranda
      </Link>
    </div>
  );
}