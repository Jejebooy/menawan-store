import { createContext, useContext, useEffect, useReducer } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "menawan_cart_v1";

// Cart item shape:
// { id, slug, name, brand, image, price, promoPrice, variant, quantity, stock }

function init() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { item } = action;
      const key = makeKey(item);
      const existing = state.find((i) => makeKey(i) === key);
      if (existing) {
        const newQty = Math.min(existing.quantity + item.quantity, item.stock || 99);
        return state.map((i) => (makeKey(i) === key ? { ...i, quantity: newQty } : i));
      }
      return [...state, item];
    }
    case "UPDATE_QTY": {
      const { key, quantity, stock } = action;
      return state.map((i) => (makeKey(i) === key ? { ...i, quantity: Math.max(1, Math.min(quantity, stock || 99)) } : i));
    }
    case "REMOVE":
      return state.filter((i) => makeKey(i) !== action.key);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

// Kunci unik: gabungan slug + varian (Penyimpanan & Warna)
export function makeKey(item) {
  const v = item.variant || {};
  return `${item.slug}::${v.Penyimpanan || ""}::${v.Warna || ""}`;
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item) => dispatch({ type: "ADD", item });
  const updateQty = (key, quantity, stock) => dispatch({ type: "UPDATE_QTY", key, quantity, stock });
  const removeItem = (key) => dispatch({ type: "REMOVE", key });
  const clear = () => dispatch({ type: "CLEAR" });

  const subtotal = items.reduce((sum, i) => sum + (i.promoPrice || i.price) * i.quantity, 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clear,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
