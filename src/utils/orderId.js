// Format: MWS-YYMMDD-XXXX (contoh: MWS-261010-A3F9)
export function generateOrderId() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `MWS-${yy}${mm}${dd}-${rand}`;
  }
  
  const ORDERS_KEY = "menawan_orders_v1";
  
  export function saveOrder(order) {
    const raw = localStorage.getItem(ORDERS_KEY);
    const orders = raw ? JSON.parse(raw) : [];
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
  
  export function getOrder(orderId) {
    const raw = localStorage.getItem(ORDERS_KEY);
    const orders = raw ? JSON.parse(raw) : [];
    return orders.find((o) => o.id === orderId) || null;
  }