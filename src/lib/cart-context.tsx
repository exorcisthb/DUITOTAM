import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { type ProductData, PRODUCTS_DATA, toSlug } from "@/data/products";

export interface CartItem {
  id: string; // unique item id: e.g. `${slug}-${size}`
  productId: string;
  slug: string;
  name: string;
  price: string;
  priceNumber: number;
  image: string;
  tone: string;
  size: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: { name: string; price?: string; priceNumber?: number; image: string; tone?: string; id?: string; slug?: string; stock?: number }, size?: string, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSize: (itemId: string, newSize: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  notice: string;
  setNotice: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "maison_de_silk_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      localStorage.removeItem("maison_de_silk_cart_v1");
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notice, setNotice] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  // Notice auto-dismiss
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.priceNumber * item.quantity, 0);
  }, [items]);

  const addToCart = (
    product: { name: string; price?: string; priceNumber?: number; image: string; tone?: string; id?: string; slug?: string; stock?: number },
    size: string = "M",
    quantity: number = 1
  ) => {
    const slug = product.slug || product.id || toSlug(product.name);
    const itemId = `${slug}-${size}`;

    // Extract priceNumber if not given
    const priceNum =
      product.priceNumber ||
      parseInt((product.price || "0").replace(/[^0-9]/g, ""), 10) ||
      1000000;

    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === itemId);
      if (existing) {
        return prevItems.map((i) =>
          i.id === itemId
            ? { ...i, quantity: Math.min(i.stock, i.quantity + quantity) }
            : i
        );
      }
      return [
        {
          id: itemId,
          productId: slug,
          slug: slug,
          name: product.name,
          price: product.price || `${priceNum.toLocaleString("vi-VN")}₫`,
          priceNumber: priceNum,
          image: product.image,
          tone: product.tone || "Nguyên bản",
          size,
          quantity,
          stock: product.stock || 20,
        },
        ...prevItems,
      ];
    });

    setNotice(`Đã thêm ${quantity}x ${product.name} (Size ${size}) vào giỏ hàng!`);
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    // Số lượng tối thiểu luôn là 1. Chỉ xóa sản phẩm khi bấm nút thùng rác (removeFromCart).
    const safeQty = Math.max(1, newQty);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.min(item.stock, safeQty) } : item
      )
    );
  };

  const updateSize = (itemId: string, newSize: string) => {
    setItems((prev) => {
      const current = prev.find((i) => i.id === itemId);
      if (!current || current.size === newSize) return prev;

      const newId = `${current.slug}-${newSize}`;
      const existingWithNewSize = prev.find((i) => i.id === newId);

      if (existingWithNewSize) {
        // Merge quantities
        return prev
          .filter((i) => i.id !== itemId)
          .map((i) =>
            i.id === newId
              ? { ...i, quantity: Math.min(i.stock, i.quantity + current.quantity) }
              : i
          );
      } else {
        // Change size and ID
        return prev.map((i) =>
          i.id === itemId ? { ...i, id: newId, size: newSize } : i
        );
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setNotice("Đã xóa sản phẩm khỏi giỏ hàng.");
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        totalAmount,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        updateSize,
        removeFromCart,
        clearCart,
        notice,
        setNotice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
