import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  Share2,
  Check,
  Minus,
  Plus,
  MessageCircle,
  Store,
  ThumbsUp,
  Sparkles,
  Info,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { TryOnModal } from "@/components/try-on-modal";
import { PRODUCTS_DATA, getProductById, type ProductData, type ReviewItem, toSlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { useReviews } from "@/lib/reviews-context";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Chi tiết sản phẩm — Maison de Silk" },
      { name: "description", content: "Thời trang đũi tơ tằm thủ công cao cấp Maison de Silk." },
    ],
  }),
  component: ProductDetailPage,
});

const SIZES = ["S", "M", "L", "XL"];

function ProductDetailPage() {
  const params = Route.useParams();
  const rawId = (params as { id?: string }).id ?? "";
  const fallback: ProductData = PRODUCTS_DATA[0] as ProductData;
  const product: ProductData = getProductById(rawId) ?? fallback;

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(48);
  const { totalCount, openCart, addToCart } = useCart();
  const navigate = useNavigate();
  const { getUserReviews } = useReviews();
  const [notice, setNotice] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showTryOnModal, setShowTryOnModal] = useState(false);

  const openTryOnModal = () => {
    setShowTryOnModal(true);
  };

  const closeTryOnModal = () => {
    setShowTryOnModal(false);
  };

  // Review state: merge static + user reviews from localStorage
  const userReviews = getUserReviews(product.id);
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => [
    ...product.reviews,
    ...userReviews,
  ]);

  useEffect(() => {
    const freshUserReviews = getUserReviews(product.id);
    setSelectedImage(product.image);
    setReviewsList([...product.reviews, ...freshUserReviews]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [notice]);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    navigate({ to: "/checkout" });
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleHelpful = (reviewId: string) => {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
    setNotice("Cảm ơn bạn đã đánh giá phản hồi này hữu ích!");
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "5") return r.rating === 5;
    if (activeFilter === "4") return r.rating === 4;
    if (activeFilter === "has_image") return r.images && r.images.length > 0;
    return true;
  });

  // Related products
  const relatedProducts = PRODUCTS_DATA.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-foreground">
      {/* Top Notification Toast */}
      {notice && (
        <div
          role="status"
          className="fixed top-5 left-1/2 z-50 -translate-x-1/2 bg-foreground px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-background shadow-2xl transition-all animate-in fade-in slide-in-from-top-3 flex items-center gap-2"
        >
          <Check className="size-4 text-accent" />
          {notice}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Quay lại
          </Link>
          <Link to="/" className="inline-block">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={openCart}
              className="relative grid size-10 place-items-center border border-border text-foreground hover:border-foreground transition-colors cursor-pointer"
              aria-label="Giỏ hàng"
            >
              <ShoppingBag className="size-4" />
              {totalCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-accent text-[0.65rem] font-bold text-accent-foreground">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 md:py-10">
        {/* Breadcrumb (Shopee style) */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Trang chủ</Link>
          <ChevronRight className="size-3" />
          <Link to="/products" className="hover:text-foreground">Sản phẩm</Link>
          <ChevronRight className="size-3" />
          <Link
            to="/products"
            search={{ category: product.category }}
            className="hover:text-foreground"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground font-medium">{product.name}</span>
        </nav>

        {/* SECTION 1: Product Showcase (Shopee split layout) */}
        <div className="border border-border bg-background p-4 sm:p-7 md:p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* LEFT COLUMN: Gallery & Share (5 cols) */}
            <div className="lg:col-span-5">
              {/* Main Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary border border-border/70 group">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {product.tag && (
                  <span className="absolute left-4 top-4 bg-background/95 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm">
                    {product.tag}
                  </span>
                )}
                <div className="absolute bottom-4 left-4 bg-background/85 px-3 py-1.5 backdrop-blur-sm text-[0.7rem] font-medium text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3 text-accent" /> 100% Đũi Tơ Tằm Thật
                </div>

                {/* Try-on Button - Show on hover */}
                <button
                  onClick={openTryOnModal}
                  className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-lg hover:bg-background hover:scale-105 cursor-pointer border border-border/50"
                  aria-label="Thử đồ ảo"
                >
                  <Sparkles className="size-5 text-accent" />
                </button>

                {/* Try-on Label on hover */}
                <div className="absolute right-4 top-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 bg-background/90 px-2.5 py-1 rounded-full text-[0.65rem] font-medium text-foreground shadow-lg border border-border/50 whitespace-nowrap">
                  <Sparkles className="size-3 inline mr-1 text-accent" /> Thử đồ ảo
                </div>
              </div>

              {/* Thumbnails list */}
              <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-[4/5] w-20 shrink-0 overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-accent shadow-md scale-102"
                        : "border-border opacity-70 hover:opacity-100 hover:border-foreground/50"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Social share & Wishlist (Shopee style) */}
              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Chia sẻ:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      setNotice("Đã sao chép liên kết sản phẩm!");
                    }}
                    className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 hover:border-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="size-3" /> Sao chép link
                  </button>
                </div>
                <button
                  onClick={handleToggleLike}
                  className="inline-flex items-center gap-1.5 text-foreground hover:text-destructive transition-colors"
                >
                  <Heart className={`size-4 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
                  <span>Đã thích ({likeCount})</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Buying Details (7 cols) */}
            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                {/* Official Mall Badge */}
                <div className="flex items-center gap-2">
                  <span className="bg-accent text-accent-foreground px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em]">
                    Chính Hãng Maison
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {product.category}
                  </span>
                </div>

                {/* Product Title */}
                <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-foreground">
                  {product.name}
                </h1>

                {/* Rating & Sold bar (Shopee style) */}
                <div className="mt-3 flex flex-wrap items-center gap-4 border-b border-border/70 pb-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="border-b border-accent font-semibold text-accent">{product.rating.toFixed(1)}</span>
                    <div className="flex text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="h-3 w-px bg-border" />
                  <a href="#reviews" className="border-b border-foreground/50 font-semibold text-foreground hover:text-accent">
                    {reviewsList.length} <span className="text-muted-foreground font-normal">Đánh Giá</span>
                  </a>
                  <span className="h-3 w-px bg-border" />
                  <div>
                    <span className="font-semibold text-foreground">{product.soldCount}</span>{" "}
                    <span className="text-muted-foreground">Đã Bán</span>
                  </div>
                </div>

                {/* Price block (Shopee highlight style) */}
                <div className="mt-5 bg-secondary/50 p-4 sm:p-5 flex flex-wrap items-baseline gap-3 border border-border/60">
                  <span className="text-sm sm:text-base text-muted-foreground line-through">
                    {product.originalPrice}
                  </span>
                  <span className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    {product.price}
                  </span>
                  <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-0.5 uppercase tracking-wider">
                    {product.discount}
                  </span>
                  <p className="w-full mt-1 text-[0.72rem] text-muted-foreground">
                    Đảm bảo giá tốt nhất cho dòng đũi tơ tằm nguyên bản thủ công 100%.
                  </p>
                </div>

                {/* Shop Vouchers (Shopee style) */}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground font-medium">Mã Giảm Giá:</span>
                  <span className="border border-dashed border-accent bg-accent/10 px-2.5 py-1 text-accent font-semibold">
                    Giảm 50k đơn từ 1.500k
                  </span>
                  <span className="border border-dashed border-accent bg-accent/10 px-2.5 py-1 text-accent font-semibold">
                    Giảm 100k đơn từ 3.000k
                  </span>
                </div>

                {/* Shipping info (Shopee style) */}
                <div className="mt-4 flex items-start gap-2 text-xs border-y border-border/70 py-4">
                  <span className="w-24 shrink-0 text-muted-foreground font-medium">Vận Chuyển:</span>
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <Truck className="size-3.5 text-accent" /> Miễn phí vận chuyển toàn quốc
                    </p>
                    <p className="text-muted-foreground">
                      Giao hàng tận tay trong 2 - 3 ngày làm việc. Được đồng kiểm trước khi nhận.
                    </p>
                  </div>
                </div>

                {/* Color tone choice */}
                <div className="mt-5 flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground font-medium">Sắc Thái Vải:</span>
                  <div className="inline-flex items-center gap-2 rounded border border-border px-3 py-1.5 bg-secondary/30 font-medium">
                    <span className="size-2 rounded-full bg-accent" />
                    {product.tone}
                  </div>
                </div>

                {/* Size choice */}
                <div className="mt-5 flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground font-medium">Kích Thước:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`grid h-9 w-12 place-items-center text-xs font-semibold uppercase tracking-wider transition-all ${
                          selectedSize === size
                            ? "border-2 border-foreground bg-foreground text-background"
                            : "border border-border bg-background text-foreground hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="ml-2 inline-flex items-center gap-1 text-[0.72rem] text-accent underline hover:text-foreground"
                    >
                      <Info className="size-3" /> Bảng quy đổi kích cỡ
                    </button>
                  </div>
                </div>

                {/* Size Guide Drawer/Box */}
                {showSizeGuide && (
                  <div className="mt-3 bg-secondary/60 p-3.5 text-xs border border-border animate-in fade-in">
                    <p className="font-semibold mb-1.5">Thông số chọn size chuẩn đũi tơ tằm:</p>
                    <ul className="space-y-1 text-muted-foreground text-[0.72rem]">
                      <li>• Size S: 42 - 48kg (Vòng ngực 80 - 84cm)</li>
                      <li>• Size M: 49 - 54kg (Vòng ngực 85 - 89cm)</li>
                      <li>• Size L: 55 - 60kg (Vòng ngực 90 - 94cm)</li>
                      <li>• Size XL: 61 - 67kg (Vòng ngực 95 - 100cm)</li>
                    </ul>
                  </div>
                )}

                {/* Quantity selector */}
                <div className="mt-5 flex items-center gap-2 text-xs">
                  <span className="w-24 shrink-0 text-muted-foreground font-medium">Số Lượng:</span>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-border bg-background">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Giảm"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Tăng"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-muted-foreground text-[0.72rem]">
                      {product.stock} sản phẩm có sẵn
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Shopee style CTA) */}
              <div className="mt-8 pt-5 border-t border-border">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2.5 border-2 border-accent bg-accent/10 py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-accent hover:bg-accent hover:text-accent-foreground transition-all active:scale-95"
                  >
                    <ShoppingBag className="size-4" /> Thêm Vào Giỏ Hàng
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2.5 bg-foreground py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90 transition-all active:scale-95 shadow-md"
                  >
                    Mua Ngay
                  </button>
                </div>

                {/* Shopee Mall 3 Guarantees */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <RotateCcw className="size-4 text-accent" />
                    <span className="text-[0.68rem]">7 Ngày Trả Hàng</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ShieldCheck className="size-4 text-accent" />
                    <span className="text-[0.68rem]">100% Tơ Tằm Thật</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Truck className="size-4 text-accent" />
                    <span className="text-[0.68rem]">Miễn Phí Vận Chuyển</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Shop Official Profile Banner (Shopee style) */}
        <div className="mt-6 border border-border bg-background p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-full border border-border bg-primary p-2">
              <img src="/logo-white.png" alt="Maison de Silk" className="h-8 w-auto object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-medium text-foreground">Maison de Silk Official</h3>
                <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-accent uppercase">
                  Mall
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Online 5 phút trước • Hà Nội, Việt Nam</p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => setNotice("Tư vấn viên Maison de Silk sẵn sàng hỗ trợ bạn qua Hotline 0988.686.868")}
                  className="inline-flex items-center gap-1.5 border border-accent bg-accent/10 px-3 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <MessageCircle className="size-3.5" /> Chat Ngay
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 border border-border px-3 py-1 text-xs font-medium text-foreground hover:border-foreground transition-colors"
                >
                  <Store className="size-3.5" /> Xem Shop
                </Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-8 text-xs">
            <div>
              <span className="text-muted-foreground">Đánh Giá: </span>
              <span className="font-semibold text-accent">4.9/5.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sản Phẩm: </span>
              <span className="font-semibold text-foreground">{PRODUCTS_DATA.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tỉ Lệ Phản Hồi: </span>
              <span className="font-semibold text-accent">99%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Thời Gian Phản Hồi: </span>
              <span className="font-semibold text-foreground">Trong vài phút</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tham Gia: </span>
              <span className="font-semibold text-foreground">3 Năm Trước</span>
            </div>
            <div>
              <span className="text-muted-foreground">Người Theo Dõi: </span>
              <span className="font-semibold text-foreground">18.5k</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Product Specifications & Long Description */}
        <div className="mt-6 border border-border bg-background p-5 sm:p-8 shadow-sm">
          <h2 className="bg-secondary/40 p-3 font-display text-lg uppercase tracking-widest text-foreground font-semibold">
            Chi Tiết Sản Phẩm
          </h2>
          <div className="mt-4 grid gap-3 p-2 text-xs md:grid-cols-2">
            {product.specifications.map((spec, i) => (
              <div key={i} className="flex border-b border-border/50 pb-2">
                <span className="w-40 shrink-0 text-muted-foreground">{spec.label}</span>
                <span className="font-medium text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>

          <h2 className="mt-8 bg-secondary/40 p-3 font-display text-lg uppercase tracking-widest text-foreground font-semibold">
            Mô Tả Sản Phẩm
          </h2>
          <div className="mt-5 space-y-4 px-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {product.description.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* SECTION 4: ĐÁNH GIÁ SẢN PHẨM (Shopee-style Review System) */}
        <div id="reviews" className="mt-6 border border-border bg-background p-5 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2 className="font-display text-xl sm:text-2xl text-foreground font-normal">
                ĐÁNH GIÁ SẢN PHẨM
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tất cả nhận xét từ khách hàng đã mua và trải nghiệm thực tế
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-4 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-accent" />
              <span>Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá</span>
            </div>
          </div>

          {/* Shopee-style Scoreboard & Filter Buttons */}
          <div className="mt-6 bg-secondary/30 p-5 sm:p-6 border border-border/70 flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left md:border-r md:border-border/80 md:pr-8">
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="font-sans text-4xl sm:text-5xl font-bold text-accent tabular-nums">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">trên 5</span>
              </div>
              <div className="mt-2 flex justify-center md:justify-start text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">({reviewsList.length} đánh giá)</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`rounded px-3.5 py-1.5 text-xs transition-colors ${
                  activeFilter === "all"
                    ? "border border-accent bg-accent text-accent-foreground font-semibold"
                    : "border border-border bg-background text-foreground hover:border-foreground"
                }`}
              >
                Tất Cả ({reviewsList.length})
              </button>
              <button
                onClick={() => setActiveFilter("5")}
                className={`rounded px-3.5 py-1.5 text-xs transition-colors ${
                  activeFilter === "5"
                    ? "border border-accent bg-accent text-accent-foreground font-semibold"
                    : "border border-border bg-background text-foreground hover:border-foreground"
                }`}
              >
                5 Sao ({reviewsList.filter((r) => r.rating === 5).length})
              </button>
              <button
                onClick={() => setActiveFilter("4")}
                className={`rounded px-3.5 py-1.5 text-xs transition-colors ${
                  activeFilter === "4"
                    ? "border border-accent bg-accent text-accent-foreground font-semibold"
                    : "border border-border bg-background text-foreground hover:border-foreground"
                }`}
              >
                4 Sao ({reviewsList.filter((r) => r.rating === 4).length})
              </button>
              <button
                onClick={() => setActiveFilter("has_image")}
                className={`rounded px-3.5 py-1.5 text-xs transition-colors ${
                  activeFilter === "has_image"
                    ? "border border-accent bg-accent text-accent-foreground font-semibold"
                    : "border border-border bg-background text-foreground hover:border-foreground"
                }`}
              >
                Có Hình Ảnh ({reviewsList.filter((r) => r.images && r.images.length > 0).length})
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="mt-6 divide-y divide-border">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Chưa có đánh giá nào phù hợp với bộ lọc này. Hãy là người đầu tiên để lại đánh giá!
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <article key={rev.id} className="py-6">
                  <div className="flex items-start gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{rev.userName}</span>
                        <span className="inline-flex items-center gap-1 text-[0.65rem] text-accent font-medium">
                          <Check className="size-3" /> Đã mua hàng tại Maison
                        </span>
                      </div>
                      <div className="mt-1 flex text-accent">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${
                              i < rev.rating ? "fill-current" : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="mt-1 text-[0.7rem] text-muted-foreground flex flex-wrap gap-2">
                        <span>{rev.date}</span>
                        <span>•</span>
                        <span>{rev.variation}</span>
                      </div>
                      <p className="mt-3 text-xs sm:text-sm leading-relaxed text-foreground/90">
                        {rev.comment}
                      </p>

                      {/* Review Images */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto">
                          {rev.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Feedback từ khách"
                              className="size-16 object-cover border border-border cursor-pointer hover:opacity-90"
                              onClick={() => setSelectedImage(img)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Seller Response (Shopee style) */}
                      {rev.sellerReply && (
                        <div className="mt-3.5 bg-secondary/60 p-3 text-xs border-l-2 border-accent">
                          <p className="font-semibold text-accent text-[0.72rem]">
                            Phản hồi của Người Bán (Maison de Silk):
                          </p>
                          <p className="mt-1 text-muted-foreground leading-relaxed">
                            {rev.sellerReply}
                          </p>
                        </div>
                      )}

                      {/* Helpful button */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <button
                          onClick={() => handleHelpful(rev.id)}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          <ThumbsUp className="size-3" /> Hữu ích ({rev.helpfulCount})
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        {/* SECTION 5: Related Products */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-normal text-foreground">
            Có Thể Bạn Cũng Thích
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-5">
            {relatedProducts.map((item) => (
              <Link
                key={item.id}
                to="/product/$id"
                params={{ id: item.id }}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary border border-border/70">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {item.tag && (
                    <span className="absolute left-2.5 top-2.5 bg-background/90 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em]">
                      {item.tag}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-medium group-hover:text-accent transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.tone}</p>
                  <p className="mt-1 text-sm font-semibold">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Try-on Modal */}
        <TryOnModal
          isOpen={showTryOnModal}
          onClose={closeTryOnModal}
          clothingImageUrl={selectedImage}
          productName={product.name}
        />

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border bg-primary px-5 py-12 text-primary-foreground">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 text-xs text-primary-foreground/60 sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo-white.png" alt="Maison de Silk" className="size-4 object-contain opacity-70" />
            <span>© 2026 Maison de Silk. Thời trang đũi tơ tằm cao cấp.</span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-primary-foreground">Trang chủ</Link>
            <Link to="/products" className="hover:text-primary-foreground">Bộ sưu tập</Link>
            <a href="#top" className="hover:text-primary-foreground">Về đầu trang ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
