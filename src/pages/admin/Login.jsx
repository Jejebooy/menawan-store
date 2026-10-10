import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/admin/dashboard";

  // Redirect kalau sudah login & admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      // useEffect akan redirect setelah profile ter-fetch
    } catch (err) {
      console.error("Login error:", err);
      if (err.message?.includes("Invalid login")) {
        setError("Email atau password salah.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Email belum diverifikasi. Hubungi admin.");
      } else {
        setError(err.message || "Gagal login. Coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-accent-700 text-white p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="w-9 h-9 bg-white text-gray-900 rounded-lg grid place-items-center">M</span>
          Menawan Store
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            Dashboard Admin
            <br />
            Menawan Store
          </h1>
          <p className="text-gray-300 max-w-md">
            Kelola produk, pesanan, inventaris, dan laporan toko dalam satu tempat.
          </p>
        </div>

        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Menawan Store. All rights reserved.
        </p>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-lg grid place-items-center">M</span>
              Menawan Store
            </Link>
          </div>

          <h2 className="text-2xl font-bold mb-1">Masuk Admin</h2>
          <p className="text-sm text-gray-500 mb-6">
            Gunakan email & password admin untuk melanjutkan.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@menawanstore.id"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white py-2.5 rounded-lg font-medium hover:bg-accent-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Masuk
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            Belum punya akun? Hubungi administrator.
          </p>

          <p className="text-xs text-center text-gray-400 mt-3">
            <Link to="/" className="hover:text-gray-900">← Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}