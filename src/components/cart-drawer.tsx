import React, { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart-context";
import { Link, useNavigate } from "@tanstack/react-router";

const AVAILABLE_SIZES = ["S", "M", "L", "XL"];

export function CartDrawer() {
  const {
    items,
    totalCount,
    totalAmount,
    isCartOpen,
    closeCart,
    updateQuantity,
    updateSize,
    removeFromCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [checkoutNotice, setCheckoutNotice] = useState("");

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const handleCheckout = () => {
    closeCart();
    navigate({ to: "/checkout" });
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container: 1/5th screen on desktop (lg:w-[20vw] min-w-[340px] max-w-[480px]) */}
      <aside
        role="dialog"
        aria-label="Giỏ hàng"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-border bg-background shadow-2xl transition-transform duration-300 animate-in slide-in-from-right sm:w-[380px] lg:w-[20vw] lg:min-w-[340px] lg:max-w-[460px]"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5 bg-secondary/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              Giỏ Hàng
            </h2>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.68rem] font-bold text-accent">
              {totalCount}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Đóng giỏ hàng"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Free Shipping Progress Banner */}
        <div className="border-b border-border/70 bg-accent/5 px-5 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
          <Truck className="size-3.5 text-accent shrink-0" />
          <span className="text-[0.72rem] leading-tight">
            Đơn hàng đủ điều kiện <strong className="text-foreground">Miễn phí vận chuyển</strong> toàn quốc.
          </span>
        </div>

        {/* Cart Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <div className="grid size-16 place-items-center rounded-full bg-secondary/80 text-muted-foreground/60 mb-4">
                <ShoppingBag className="size-7" />
              </div>
              <p className="font-display text-lg text-foreground">Giỏ hàng của bạn đang trống</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Khám phá các thiết kế đũi tơ tằm thủ công tinh tế của Maison de Silk.
              </p>
              <Link
                to="/products"
                onClick={closeCart}
                className="mt-6 inline-flex items-center gap-2 border border-foreground bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-background hover:bg-foreground/90 transition-all"
              >
                Khám phá ngay <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 first:pt-1 last:pb-1 flex gap-3.5 group">
                {/* Product Thumbnail */}
                <Link
                  to="/product/$id"
                  params={{ id: item.slug }}
                  onClick={closeCart}
                  className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-secondary border border-border/70"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Info & Modifiers */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        to="/product/$id"
                        params={{ id: item.slug }}
                        onClick={closeCart}
                        className="font-medium text-xs sm:text-sm text-foreground hover:text-accent transition-colors leading-tight line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground/60 hover:text-destructive transition-colors p-0.5 shrink-0"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                      <span>{item.tone}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">{item.price}</span>
                    </div>

                    {/* Thay đổi size trực tiếp tại giỏ hàng */}
                    <div className="mt-2.5 flex items-center gap-1.5">
                      <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                        Size:
                      </span>
                      <div className="inline-flex gap-1">
                        {AVAILABLE_SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateSize(item.id, s)}
                            className={`grid h-5 w-6 place-items-center text-[0.65rem] font-bold uppercase transition-colors ${
                              item.size === s
                                ? "border border-foreground bg-foreground text-background"
                                : "border border-border/80 bg-background text-foreground hover:border-foreground/60"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Modifier and Line Price */}
                  <div className="mt-3 flex items-center justify-between pt-1">
                    {/* Quantity counter: [-] [qty] [+] */}
                    <div className="inline-flex items-center border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={`px-2 py-1 transition-colors ${
                          item.quantity <= 1
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "text-muted-foreground hover:text-foreground cursor-pointer"
                        }`}
                        aria-label="Giảm"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className={`px-2 py-1 transition-colors ${
                          item.quantity >= item.stock
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "text-muted-foreground hover:text-foreground cursor-pointer"
                        }`}
                        aria-label="Tăng"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Subtotal for this item */}
                    <span className="text-xs font-semibold text-foreground">
                      {(item.priceNumber * item.quantity).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Subtotal & MUA NGAY CTA */}
        {items.length > 0 && (
          <div className="shrink-0 border-t border-border bg-background p-5 shadow-lg">
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Số lượng sản phẩm:</span>
                <span className="font-semibold text-foreground">{totalCount}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-accent">Miễn phí (Toàn quốc)</span>
              </div>
              <div className="border-t border-border/70 pt-2 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                  Tổng thanh toán:
                </span>
                <span className="font-sans text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums">
                  {totalAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>

            {/* MUA NGAY Button */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 bg-foreground py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:bg-foreground/90 transition-all active:scale-98 shadow-md"
            >
              <span>MUA NGAY</span>
              <ArrowRight className="size-4" />
            </button>

            {/* Guarantees note */}
            <p className="mt-3 text-center text-[0.65rem] text-muted-foreground flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3 text-accent" />
              Cam kết 100% đũi tơ tằm nguyên bản • Đổi trả 7 ngày
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
