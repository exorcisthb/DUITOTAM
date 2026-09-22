import React, { createContext, useContext, useState, useCallback } from "react";

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  image: string;
  tone: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "cod" | "bank_transfer";
  status: "pending" | "completed" | "cancelled";
  shipping: {
    fullName: string;
    phone: string;
    address: string;
    province: string;
    notes: string;
  };
}

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "date" | "status">) => Order;
  cancelOrder: (orderId: string) => void;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

const STORAGE_KEY = "maison_orders";

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const addOrder = useCallback((data: Omit<Order, "id" | "date" | "status">) => {
    const newOrder: Order = {
      ...data,
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      status: "completed",
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    saveOrders(updated);
    return newOrder;
  }, [orders]);

  const cancelOrder = useCallback((orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status: "cancelled" as const } : o
    );
    setOrders(updated);
    saveOrders(updated);
  }, [orders]);

  return (
    <OrdersContext.Provider value={{ orders, addOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
