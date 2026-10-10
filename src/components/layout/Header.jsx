import { Link, NavLink } from "react-router-dom";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";

const navItems = [
  { to: "/", label: "Beranda" },
  { to: "/katalog?category=android", label: "Smartphone" },
  { to: "/katalog?category=iphone", label: "iPhone" },
  { to: "/katalog?category=ipad", label: "iPad" },
  { to: "/katalog?category=aksesori", label: "Aksesori" },
  { to: "/promo", label: "Promo" },
  { to: "/kontak", label: "Kontak" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <span className="w-8 h-8 bg-gray-900 text-white rounded-lg grid place-items-center">M</span>
          <span className="hidden sm:inline">Menawan Store</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "text-gray-900" : "hover:text-gray-900")}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/katalog" className="p-2 rounded-lg hover:bg-gray-100" aria-label="Cari produk">
            <Search size={20} />
          </Link>
          <Link to="/keranjang" className="p-2 rounded-lg hover:bg-gray-100 relative" aria-label="Keranjang">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-accent-600 text-white text-[10px] font-bold w-4 h-4 rounded-full grid place-items-center">{totalItems > 99 ? "99+" : totalItems}</span>}
          </Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
