import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useOrders, type Order } from "@/lib/orders-context";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/lib/cart-context";
import {
  ArrowLeft,
  Package,
  ChevronRight,
  Calendar,
  CreditCard,
  Banknote,
  MapPin,
  User,
  Phone,
  ShoppingBag,
  Eye,
  X,
} from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [{ title: "Quản lý đơn hàng — Maison de Silk" }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, isSessionChecked } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const navigate = useNavigate();
  const { totalCount, openCart } = useCart();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!isSessionChecked) return null;

  if (!user) {
    navigate({ to: "/login", search: { returnTo: "/orders" } });
    return null;
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatPrice = (n: number) =>
    n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const statusLabel = (s: Order["status"]) => {
    switch (s) {
      case "completed":
        return <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">✓ Đã hoàn thành</span>;
      case "pending":
        return <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">⏳ Đang xử lý</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">✗ Đã huỷ</span>;
    }
  };

  const paymentLabel = (m: Order["paymentMethod"]) =>
    m === "cod" ? (
      <span className="inline-flex items-center gap-1 text-xs"><Banknote className="size-3.5" /> COD</span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs"><CreditCard className="size-3.5" /> Chuyển khoản</span>
    );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" /> Trang chủ
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hidden sm:inline-block">
              Quản lý đơn hàng
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Giỏ hàng" onClick={openCart} className="relative cursor-pointer">
              <ShoppingBag />
              <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-foreground">
                {totalCount}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[1000px] px-5 py-10 md:px-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">Đơn hàng của bạn</p>
          <h1 className="font-display text-3xl sm:text-4xl">Quản lý đơn hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Package className="size-12 mx-auto text-muted-foreground/40 mb-4" />
            <h4 className="font-display text-xl text-foreground">Chưa có đơn hàng nào</h4>
            <p className="text-xs text-muted-foreground mt-2">
              Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm!
            </p>
            <Button variant="commerce" size="sm" asChild className="mt-6">
              <Link to="/products">Mua sắm ngay</Link>
            </Button>
          </div>
        ) : selectedOrder ? (
          /* ── Chi tiết đơn hàng ── */
          <div className="animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedOrder(null)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="size-4" /> Quay lại danh sách
            </button>

            <div className="border border-border bg-background p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Mã đơn hàng</p>
                  <p className="font-display text-lg font-semibold">{selectedOrder.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusLabel(selectedOrder.status)}
                  {selectedOrder.status !== "cancelled" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelOrder(selectedOrder.id)}
                      className="text-xs"
                    >
                      <X className="size-3.5 mr-1" /> Hủy đơn
                    </Button>
                  )}
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="space-y-4 mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sản phẩm đã mua</p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="w-20 h-24 shrink-0 overflow-hidden bg-secondary rounded-md">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold line-clamp-1">{item.name}</h5>
                      <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                        Phong cách: {item.tone} · Kích cỡ: {item.size}
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground">Số lượng: {item.quantity}</p>
                      <p className="text-sm font-semibold text-accent mt-1">{formatPrice(item.priceNumber * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tổng thanh toán</span>
                  <span className="font-display text-xl font-bold">{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Thông tin giao hàng */}
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Thông tin giao hàng</p>
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center gap-2"><User className="size-3.5 text-muted-foreground shrink-0" /> {selectedOrder.shipping.fullName}</div>
                  <div className="flex items-center gap-2"><Phone className="size-3.5 text-muted-foreground shrink-0" /> {selectedOrder.shipping.phone}</div>
                  <div className="flex items-center gap-2"><MapPin className="size-3.5 text-muted-foreground shrink-0" /> {selectedOrder.shipping.address}, {selectedOrder.shipping.province}</div>
                  <div className="flex items-center gap-2"><Calendar className="size-3.5 text-muted-foreground shrink-0" /> {formatDate(selectedOrder.date)}</div>
                  <div className="flex items-center gap-2">{paymentLabel(selectedOrder.paymentMethod)}</div>
                </div>
                {selectedOrder.shipping.notes && (
                  <p className="text-xs text-muted-foreground italic">Ghi chú: {selectedOrder.shipping.notes}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Danh sách đơn hàng ── */
          <div className="space-y-4">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left border border-border bg-background hover:bg-secondary/30 p-5 rounded-lg transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground shrink-0">
                      <Package className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{order.code}</p>
                        {statusLabel(order.status)}
                      </div>
                      <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                        {formatDate(order.date)} · {order.items.length} sản phẩm
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="w-8 h-10 rounded overflow-hidden bg-secondary shrink-0">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-[0.65rem] text-muted-foreground">+{order.items.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-sm font-bold">{formatPrice(order.totalAmount)}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      {paymentLabel(order.paymentMethod)}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground mt-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
