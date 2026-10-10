import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="text-gray-500 mb-4">
            Akun Anda tidak memiliki akses ke dashboard admin.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Login sebagai: <span className="font-mono">{user.email}</span> (role: {profile?.role || "unknown"})
          </p>
          <a href="/" className="btn-accent inline-block">Kembali ke Beranda</a>
        </div>
      </div>
    );
  }

  return children;
}