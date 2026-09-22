import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  Package,
  Clock,
  X,
  AlertCircle,
  ShoppingBag,
  Star,
  Send,
  MessageSquarePlus,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useOrders } from "@/lib/orders-context";
import { PRODUCTS_DATA, getProductById } from "@/data/products";
import { useReviews } from "@/lib/reviews-context";
import type { ReviewItem } from "@/data/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Thanh toán đơn hàng — Maison de Silk" },
      { name: "description", content: "Thanh toán an toàn cho đơn hàng thời trang đũi tơ tằm Maison de Silk." },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "cod" | "bank_transfer";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: Modal viết đánh giá cho 1 sản phẩm
// ─────────────────────────────────────────────────────────────────────────────
interface ReviewModalProps {
  productId: string;
  productName: string;
  productImage: string;
  variation: string;
  onClose: () => void;
  onSubmit: (review: ReviewItem) => void;
  alreadyReviewed: boolean;
}

function ReviewModal({
  productId,
  productName,
  productImage,
  variation,
  onClose,
  onSubmit,
  alreadyReviewed,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(alreadyReviewed);
  const [error, setError] = useState("");

  const ratingLabels = ["", "Tệ", "Không hài lòng", "Bình thường", "Hài lòng", "Tuyệt vời!"];

  const handleSubmit = () => {
    if (comment.trim().length < 10) {
      setError("Vui lòng nhập ít nhất 10 ký tự để gửi đánh giá.");
      return;
    }
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const review: ReviewItem = {
      id: `user-rev-${Date.now()}`,
      userName: "Khách hàng đã mua***",
      rating,
      date: dateStr,
      variation,
      comment: comment.trim(),
      helpfulCount: 0,
    };
    onSubmit(review);
    setSubmitted(true);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-background border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <img
              src={productImage}
              alt={productName}
              className="size-10 rounded-xl object-cover border border-border"
            />
            <div>
              <p className="text-xs font-semibold text-foreground leading-tight line-clamp-1">{productName}</p>
              <p className="text-[0.68rem] text-muted-foreground">{variation}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:bg-border hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-accent/15 border-2 border-accent/30 mb-4">
                <CheckCircle2 className="size-8 text-accent" />
              </div>
              <h3 className="font-display text-lg text-foreground">Cảm ơn bạn đã đánh giá!</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Đánh giá của bạn sẽ giúp những khách hàng khác lựa chọn tốt hơn.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-full bg-foreground px-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-display text-base text-foreground font-semibold mb-4 text-center">
                Đánh giá sản phẩm
              </h3>

              {/* Star Rating */}
              <div className="flex flex-col items-center gap-2 mb-5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`${star} sao`}
                    >
                      <Star
                        className={`size-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-border"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-accent">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nhận xét của bạn *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Chia sẻ cảm nhận của bạn về chất lượng vải, đường may, kiểu dáng... (ít nhất 10 ký tự)"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-xs outline-none focus:border-foreground transition-colors resize-none leading-relaxed"
                />
                {error && (
                  <p className="flex items-center gap-1.5 text-[0.7rem] text-destructive">
                    <AlertCircle className="size-3" />
                    {error}
                  </p>
                )}
                <p className="text-[0.68rem] text-muted-foreground text-right">{comment.length} ký tự</p>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-4 w-full rounded-2xl bg-foreground py-3 px-6 text-xs font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="size-4" />
                Gửi Đánh Giá
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CheckoutPage
// ─────────────────────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalCount, totalAmount, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { addReview, hasReviewed, addPendingReview } = useReviews();

  // If cart is empty, use the first item as demo fallback so the page always renders nicely
  const displayItems =
    items.length > 0
      ? items
      : [
          {
            id: "fallback-item",
            name: PRODUCTS_DATA[0]!.name,
            price: PRODUCTS_DATA[0]!.price,
            priceNumber: 3890000,
            image: PRODUCTS_DATA[0]!.image,
            size: "M",
            quantity: 1,
            tone: PRODUCTS_DATA[0]!.tone,
            slug: PRODUCTS_DATA[0]!.slug,
          },
        ];

  const currentTotalAmount = items.length > 0 ? totalAmount : 3890000;
  const currentTotalCount = items.length > 0 ? totalCount : 1;

  // Snapshot items at time of purchase (for review section)
  const [purchasedItems, setPurchasedItems] = useState<typeof displayItems>([]);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("Hà Nội");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [formError, setFormError] = useState("");

  // Modal / Success States
  const [showVnPayModal, setShowVnPayModal] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [completedMethod, setCompletedMethod] = useState<PaymentMethod>("cod");
  const [orderCode, setOrderCode] = useState(() => `MDS-${Math.floor(100000 + Math.random() * 900000)}`);
  const [hasCopiedSTK, setHasCopiedSTK] = useState(false);
  const [hasCopiedContent, setHasCopiedContent] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 mins

  // Review modal state
  const [activeReviewProductId, setActiveReviewProductId] = useState<string | null>(null);

  // Countdown timer for VNPay modal
  useEffect(() => {
    if (!showVnPayModal || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showVnPayModal, countdown]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string, type: "stk" | "content") => {
    navigator.clipboard.writeText(text);
    if (type === "stk") {
      setHasCopiedSTK(true);
      setTimeout(() => setHasCopiedSTK(false), 2000);
    } else {
      setHasCopiedContent(true);
      setTimeout(() => setHasCopiedContent(false), 2000);
    }
  };

  // Submit checkout
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.");
      return;
    }

    // Snapshot purchased items before clearing cart
    const snapshot = [...displayItems];

    if (paymentMethod === "cod") {
      setPurchasedItems(snapshot);
      addOrder({
        code: orderCode,
        items: snapshot.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          priceNumber: item.priceNumber,
          image: item.image,
          tone: item.tone,
          size: item.size,
          quantity: item.quantity,
        })),
        totalAmount: currentTotalAmount,
        paymentMethod: "cod",
        shipping: { fullName, phone, address, province, notes },
      });
      // Đánh dấu các sản phẩm chờ đánh giá
      snapshot.forEach((item) => {
        const pid = item.slug ?? item.id;
        addPendingReview(pid);
      });
      setCompletedMethod("cod");
      setIsOrderComplete(true);
      clearCart();
    } else {
      // Tài khoản thì mở popup VNPAY QR
      setPurchasedItems(snapshot);
      setCountdown(900);
      setShowVnPayModal(true);
    }
  };

  const handleVnPayDone = () => {
    setShowVnPayModal(false);
    // Đánh dấu các sản phẩm chờ đánh giá
    purchasedItems.forEach((item) => {
      const pid = item.slug ?? item.id;
      addPendingReview(pid);
    });
    // Nếu chưa snapshot (trường hợp không qua COD branch)
    if (purchasedItems.length === 0) {
      const snapshot = [...displayItems];
      setPurchasedItems(snapshot);
      snapshot.forEach((item) => {
        addPendingReview(item.slug ?? item.id);
      });
    }
    addOrder({
      code: orderCode,
      items: purchasedItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        priceNumber: item.priceNumber,
        image: item.image,
        tone: item.tone,
        size: item.size,
        quantity: item.quantity,
      })),
      totalAmount: currentTotalAmount,
      paymentMethod: "bank_transfer",
      shipping: { fullName, phone, address, province, notes },
    });
    setCompletedMethod("bank_transfer");
    setIsOrderComplete(true);
    clearCart();
  };

  // QR Code URL via VietQR
  const qrUrl = `https://img.vietqr.io/image/MB-190368888888-compact2.png?amount=${currentTotalAmount}&addInfo=${encodeURIComponent(
    `${orderCode} TT`
  )}&accountName=MAISON%20DE%20SILK`;

  // Màn hình hoàn tất đơn hàng
  if (isOrderComplete) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Card */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-accent/15 text-accent mb-6 border-2 border-accent/30">
              <CheckCircle2 className="size-10 text-accent" />
            </div>

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Đặt Hàng Thành Công
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-normal text-foreground">
              Cảm ơn quý khách đã tin chọn
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Đơn hàng của quý khách đã được ghi nhận vào hệ thống Maison de Silk.
            </p>

            <div className="mt-6 rounded-2xl bg-secondary/40 border border-border/80 p-5 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-foreground">{orderCode}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span className="font-semibold text-foreground">
                  {completedMethod === "cod" ? "Tiền mặt khi nhận hàng (COD)" : "Chuyển khoản VNPAY-QR"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Tổng thanh toán:</span>
                <span className="font-sans text-sm font-bold text-accent">
                  {currentTotalAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2.5">
                <span className="text-muted-foreground">Người nhận:</span>
                <span className="font-medium text-foreground">{fullName} ({phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Địa chỉ giao:</span>
                <span className="font-medium text-foreground text-right max-w-[240px] truncate">
                  {address}, {province}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Truck className="size-4 text-accent" />
              <span>Thời gian giao hàng dự kiến: <strong>2 - 3 ngày làm việc</strong></span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/"
                className="flex-1 rounded-full bg-foreground py-3 px-6 text-xs font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-all text-center"
              >
                Về Trang Chủ
              </Link>
              <Link
                to="/products"
                className="flex-1 rounded-full border border-border bg-background py-3 px-6 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary transition-all text-center"
              >
                Xem Thêm Sản Phẩm
              </Link>
            </div>
          </div>

          {/* ─── SECTION ĐÁNH GIÁ SẢN PHẨM ─── */}
          {purchasedItems.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              {/* Section Header */}
              <div className="flex items-center gap-3 pb-5 border-b border-border">
                <div className="grid size-10 place-items-center rounded-2xl bg-accent/15 text-accent border border-accent/20">
                  <MessageSquarePlus className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg text-foreground font-semibold">
                    Đánh Giá Sản Phẩm
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Chia sẻ cảm nhận của bạn để giúp đỡ khách hàng khác
                  </p>
                </div>
              </div>

              {/* Product Review List */}
              <div className="mt-5 space-y-4">
                {purchasedItems.map((item) => {
                  const productId = item.slug ?? item.id;
                  const reviewed = hasReviewed(productId);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        reviewed
                          ? "border-accent/30 bg-accent/5"
                          : "border-border bg-secondary/20 hover:bg-secondary/40"
                      }`}
                    >
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-14 rounded-xl object-cover border border-border shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-foreground truncate">{item.name}</p>
                        <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                          Size: <span className="font-bold text-foreground">{item.size}</span>
                          {item.tone ? ` • ${item.tone}` : ""}
                        </p>
                        {reviewed && (
                          <div className="mt-1 flex items-center gap-1 text-[0.68rem] text-accent font-medium">
                            <Check className="size-3" />
                            Đã đánh giá
                          </div>
                        )}
                        {!reviewed && (
                          <div className="mt-1 flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="size-3 text-border" />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => setActiveReviewProductId(productId)}
                        disabled={reviewed}
                        className={`shrink-0 rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide transition-all cursor-pointer ${
                          reviewed
                            ? "bg-secondary border border-border text-muted-foreground cursor-default"
                            : "bg-foreground text-background hover:bg-foreground/90 shadow-sm active:scale-95"
                        }`}
                      >
                        {reviewed ? "Đã gửi" : "Viết đánh giá"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-center text-[0.68rem] text-muted-foreground">
                <ShieldCheck className="size-3 inline mr-1 text-accent" />
                Đánh giá sẽ hiển thị ngay trên trang sản phẩm sau khi gửi
              </p>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {activeReviewProductId && (() => {
          const item = purchasedItems.find((i) => (i.slug ?? i.id) === activeReviewProductId);
          if (!item) return null;
          const product = getProductById(activeReviewProductId);
          return (
            <ReviewModal
              productId={activeReviewProductId}
              productName={item.name}
              productImage={item.image}
              variation={`Màu: ${item.tone ?? "Nguyên bản"}, Size: ${item.size}`}
              onClose={() => setActiveReviewProductId(null)}
              onSubmit={(review) => {
                addReview(activeReviewProductId, review);
                setActiveReviewProductId(null);
              }}
              alreadyReviewed={hasReviewed(activeReviewProductId)}
            />
          );
        })()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Quay lại cửa hàng</span>
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Maison de Silk" className="h-9 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
            <ShieldCheck className="size-4 text-accent" />
            <span className="hidden sm:inline">Bảo mật SSL 256-bit</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Thanh toán</span>
          <h1 className="font-display text-2xl sm:text-3xl font-normal text-foreground mt-1">
            Xác nhận đơn hàng &amp; Phương thức thanh toán
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Customer info & Payment options (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Thông tin giao hàng */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <span className="grid size-6 place-items-center rounded-full bg-foreground text-background text-xs font-bold">
                  1
                </span>
                <h2 className="font-display text-base font-semibold text-foreground">
                  Thông tin giao hàng
                </h2>
              </div>

              {formError && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Họ và tên người nhận *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Thị Mai"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Tỉnh / Thành phố *</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 outline-none focus:border-foreground transition-colors"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Hội An">Quảng Nam (Hội An)</option>
                    <option value="Khác">Tỉnh thành khác</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-medium text-foreground">Địa chỉ nhận hàng chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 outline-none focus:border-foreground transition-colors"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-medium text-muted-foreground">Ghi chú cho xưởng / đơn vị vận chuyển (tùy chọn)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                    className="w-full rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 outline-none focus:border-foreground transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. Phương thức thanh toán */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                <span className="grid size-6 place-items-center rounded-full bg-foreground text-background text-xs font-bold">
                  2
                </span>
                <h2 className="font-display text-base font-semibold text-foreground">
                  Chọn phương thức thanh toán
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {/* Lựa chọn 1: Tiền mặt khi nhận hàng (COD) */}
                <label
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-foreground bg-secondary/40 shadow-xs"
                      : "border-border hover:border-foreground/40 bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 size-4 accent-foreground"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="size-4 text-accent" />
                      <span className="font-semibold text-sm text-foreground">
                        Thanh toán tiền mặt khi nhận hàng (COD)
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Quý khách thanh toán tiền mặt trực tiếp cho bưu tá khi nhận kiện hàng. Kiểm tra hàng thoải mái trước khi thanh toán.
                    </p>
                  </div>
                </label>

                {/* Lựa chọn 2: Chuyển khoản / VNPAY QR */}
                <label
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-foreground bg-secondary/40 shadow-xs ring-1 ring-foreground/20"
                      : "border-border hover:border-foreground/40 bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={() => setPaymentMethod("bank_transfer")}
                    className="mt-1 size-4 accent-foreground"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-bold text-xs bg-red-600 text-white px-1.5 py-0.5 rounded">
                        VN<span className="text-blue-200">PAY</span>
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        Tài khoản / Quét mã VNPAY QR
                      </span>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-bold text-accent">
                        Khuyên dùng
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Hiện popup có mã VNPAY QR để quét bằng app Ngân hàng hoặc VNPAY. Tự động hiển thị đúng số tiền cần thanh toán.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Nút đặt hàng / thanh toán */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-2xl bg-foreground py-4 px-8 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-background hover:bg-foreground/90 transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {paymentMethod === "cod" ? (
                  <>
                    <Banknote className="size-4" />
                    <span>Xác Nhận Đặt Hàng (Tiền Mặt)</span>
                  </>
                ) : (
                  <>
                    <QrCode className="size-4" />
                    <span>Mở VNPAY QR Quét Thanh Toán</span>
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-[0.7rem] text-muted-foreground">
                Bằng việc xác nhận, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Maison de Silk.
              </p>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm sticky top-24">
              <h3 className="font-display text-base font-semibold text-foreground pb-3 border-b border-border flex items-center justify-between">
                <span>Đơn hàng của bạn</span>
                <span className="text-xs font-normal text-muted-foreground">
                  ({currentTotalCount} sản phẩm)
                </span>
              </h3>

              {/* Items List */}
              <div className="divide-y divide-border/60 max-h-[320px] overflow-y-auto pr-1 my-3">
                {displayItems.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="py-3 flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-14 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-foreground truncate">{item.name}</p>
                      <p className="text-[0.68rem] text-muted-foreground mt-0.5">
                        Size: <span className="font-bold text-foreground">{item.size}</span>
                        {item.tone ? ` • ${item.tone}` : ""}
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0 font-sans tabular-nums">
                      {(item.priceNumber * item.quantity).toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính:</span>
                  <span className="font-sans font-medium text-foreground tabular-nums">
                    {currentTotalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-accent">Miễn phí (Toàn quốc)</span>
                </div>
                <div className="border-t border-border/80 pt-3 flex items-baseline justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Tổng thanh toán:
                  </span>
                  <span className="font-sans text-xl font-bold tracking-tight text-accent tabular-nums">
                    {currentTotalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="mt-5 pt-4 border-t border-border/60 space-y-2 text-[0.72rem] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-accent shrink-0" />
                  <span>Cam kết 100% đũi tơ tằm nguyên bản thủ công</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-accent shrink-0" />
                  <span>Miễn phí giao hàng hỏa tốc 2-3 ngày toàn quốc</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* POPUP NHỎ VNPAY QR MODAL */}
      {showVnPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-background border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-red-600 via-rose-600 to-blue-700 px-6 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="bg-white px-2 py-0.5 rounded font-black text-xs text-red-600 tracking-wider">
                  VN<span className="text-blue-700">PAY</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">Cổng Thanh Toán VNPAY-QR</h3>
                  <p className="text-[0.65rem] text-white/80 leading-none mt-0.5">
                    Hỗ trợ quét qua tất cả ứng dụng Ngân hàng &amp; Ví
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVnPayModal(false)}
                className="grid size-7 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-center">
              {/* Số tiền to, rõ nét */}
              <div className="rounded-2xl bg-secondary/40 border border-border p-3.5 mb-4">
                <span className="text-[0.68rem] uppercase tracking-wider text-muted-foreground block">
                  Số tiền cần thanh toán
                </span>
                <span className="font-sans text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                  {currentTotalAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* Khung quét mã QR */}
              <div className="relative mx-auto w-56 p-2 rounded-2xl bg-white border-2 border-red-500/30 shadow-inner flex flex-col items-center justify-center">
                <img
                  src={qrUrl}
                  alt="Mã VNPAY QR"
                  className="w-52 h-auto object-contain rounded-xl"
                  onError={(e) => {
                    // Fallback to generic VietQR if error
                    (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                      `STK: 190368888888 | MBBANK | SO TIEN: ${currentTotalAmount} | MA DON: ${orderCode}`
                    )}`;
                  }}
                />
                <div className="mt-1 flex items-center gap-1 text-[0.65rem] text-muted-foreground font-medium">
                  <QrCode className="size-3 text-red-600" />
                  <span>Quét QR tự động điền số tiền</span>
                </div>
              </div>

              {/* Thông tin chuyển khoản chi tiết */}
              <div className="mt-4 rounded-xl bg-secondary/30 border border-border/80 p-3 text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-[0.7rem]">Ngân hàng:</span>
                  <span className="font-bold text-foreground">MBBank (Quân Đội)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-[0.7rem]">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-foreground">190368888888</span>
                    <button
                      type="button"
                      onClick={() => handleCopy("190368888888", "stk")}
                      className="text-accent hover:text-foreground text-[0.65rem] flex items-center gap-0.5 cursor-pointer"
                    >
                      {hasCopiedSTK ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                      <span>{hasCopiedSTK ? "Đã chép" : "Chép"}</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-[0.7rem]">Chủ tài khoản:</span>
                  <span className="font-semibold text-foreground">MAISON DE SILK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-[0.7rem]">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-accent">{orderCode} TT</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${orderCode} TT`, "content")}
                      className="text-accent hover:text-foreground text-[0.65rem] flex items-center gap-0.5 cursor-pointer"
                    >
                      {hasCopiedContent ? <Check className="size-3 text-green-600" /> : <Copy className="size-3" />}
                      <span>{hasCopiedContent ? "Đã chép" : "Chép"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5 text-accent animate-pulse" />
                <span>Mã giao dịch hết hạn sau:</span>
                <strong className="font-mono text-foreground">{formatTime(countdown)}</strong>
              </div>

              {/* Modal Buttons */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handleVnPayDone}
                  className="w-full rounded-full bg-gradient-to-r from-red-600 to-blue-700 py-3 px-6 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Tôi Đã Chuyển Khoản Xong</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVnPayModal(false)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground py-1.5 transition-colors cursor-pointer"
                >
                  Đóng hoặc chọn phương thức khác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
