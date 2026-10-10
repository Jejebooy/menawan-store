import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const menus = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/produk", label: "Produk", icon: Package },
  { to: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { to: "/admin/inventaris", label: "Inventaris", icon: Boxes },
  { to: "/admin/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Yakin ingin logout?")) return;
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 text-gray-300 fixed h-full">
        <div className="p-5 border-b border-gray-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-white text-lg">
            <span className="w-8 h-8 bg-white text-gray-900 rounded-lg grid place-items-center">M</span>
            Menawan Admin
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-auto">
          {menus.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-accent-600 text-white"
                    : "hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm hover:text-white">
            <Store size={18} /> Lihat Toko
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:text-white text-red-400"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 lg:ml-60">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{profile?.full_name || "Admin"}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
              <div className="w-9 h-9 bg-accent-600 text-white rounded-full grid place-items-center font-semibold">
                {(profile?.full_name || "A")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <aside className="w-64 h-full bg-gray-900 text-gray-300 p-3" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 mb-2 border-b border-gray-800">
                <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-white">
                  <span className="w-7 h-7 bg-white text-gray-900 rounded-lg grid place-items-center text-sm">M</span>
                  Menawan Admin
                </Link>
              </div>
              <nav className="space-y-1">
                {menus.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                        isActive ? "bg-accent-600 text-white" : "hover:bg-gray-800"
                      }`
                    }
                  >
                    <Icon size={18} /> {label}
                  </NavLink>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}