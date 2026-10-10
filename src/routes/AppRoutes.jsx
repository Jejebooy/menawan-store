import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Catalog from "../pages/Catalog";
import Promo from "../pages/Promo";
import Contact from "../pages/Contact";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import NotFound from "../pages/NotFound";

// Admin
import Login from "../pages/admin/Login";
import Dashboard from "../pages/admin/Dashboard";
import ProductList from "../pages/admin/ProductList";
import OrderList from "../pages/admin/OrderList";
import OrderDetail from "../pages/admin/OrderDetail";
import Inventory from "../pages/admin/Inventory";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";
import AdminLayout from "../components/admin/AdminLayout";
import ProtectedRoute from "../components/admin/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/katalog" element={<Catalog />} />
        <Route path="/promo" element={<Promo />} />
        <Route path="/kontak" element={<Contact />} />
        <Route path="/produk/:slug" element={<ProductDetail />} />
        <Route path="/keranjang" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:id" element={<OrderSuccess />} />
      </Route>

      {/* Admin Login */}
      <Route path="/admin/login" element={<Login />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="produk" element={<ProductList />} />
        <Route path="pesanan" element={<OrderList />} />
        <Route path="pesanan/:id" element={<OrderDetail />} />
        <Route path="inventaris" element={<Inventory />} />
        <Route path="laporan" element={<Reports />} />
        <Route path="pengaturan" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
