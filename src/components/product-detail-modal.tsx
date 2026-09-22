import React, { useState } from "react";
import { X, ShoppingBag, Heart, Truck, RotateCcw, ShieldCheck, Check, Minus, Plus, Sparkles } from "lucide-react";

export interface ProductItem {
  name: string;
  category: string;
  price: string;
  image: string;
  tone: string;
  tag?: string;
  description?: string;
}

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem, size: string, quantity: number) => void;
}

const SIZES = ["S", "M", "L", "XL"];

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    setAddedAnimation(true);
    onAddToCart(product, selectedSize, quantity);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1200);
  };

  const getStory = (cat: string) => {
    switch (cat) {
      case "Áo dài":
        return "Áo dài may từ đũi tơ tằm tự nhiên, tôn vinh dáng vẻ duyên dáng và thanh tao. Từng đường chỉ thêu tay tỉ mỉ, bề mặt vải mộc mạc lưu giữ hơi thở làng nghề Việt cổ truyền.";
      case "Đầm":
        return "Thiết kế đầm dáng rủ tự nhiên từ sợi tơ tằm tuyển chọn, nhẹ nhàng theo từng chuyển động. Vải thoáng khí, thấm hút tự nhiên, mang lại cảm giác dễ chịu suốt ngày dài.";
      case "Áo kiểu":
        return "Dáng áo hiện đại phối cùng chất liệu đũi dệt thủ công độc đáo. Phù hợp cả khi dạo phố lẫn nơi công sở trang trọng với vẻ đẹp phóng khoáng và tối giản.";
      case "Quần":
        return "Ống suông phóng khoáng mang lại cảm giác thoải mái tối đa. Độ rủ tự nhiên của tơ tằm giúp vóc dáng thêm phần thanh thoát và uyển chuyển.";
      default:
        return "Trang phục thường nhật cao cấp với chất liệu 100% tơ tằm nguyên bản. Bề mặt có nốt sần tự nhiên đặc trưng, bền đẹp và ngày càng mềm mại sau mỗi lần giặt.";
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-none border border-border bg-background shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          className="absolute right-3.5 top-3.5 z-20 grid size-9 place-items-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-foreground hover:text-background"
        >
          <X className="size-4" />
        </button>

        {/* Left Column: Image */}
        <div className="relative md:w-1/2 shrink-0 bg-secondary aspect-[4/5] md:aspect-auto md:min-h-[480px]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {product.tag && (
            <span className="absolute left-4 top-4 bg-background/95 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground shadow-sm">
              {product.tag}
            </span>
          )}
          <div className="absolute bottom-4 left-4 right-4 bg-background/85 px-3.5 py-2 backdrop-blur-sm flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="size-3.5 text-accent" /> Đũi tơ tằm tự nhiên
            </span>
            <span>{product.tone}</span>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 flex flex-col justify-between">
          <div>
            {/* Category & Tone */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-accent font-semibold">
                {product.category}
              </p>
              <span className="text-xs text-muted-foreground">Mã: MDS-{product.name.slice(0, 3).toUpperCase()}</span>
            </div>

            {/* Title */}
            <h2 className="mt-2 font-display text-2xl sm:text-3xl text-foreground font-normal leading-tight">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                {product.price}
              </span>
              <span className="text-xs text-muted-foreground">Đã bao gồm thuế</span>
            </div>

            {/* Description */}
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border pt-4">
              {getStory(product.category)}
            </p>

            {/* Color Tone Info */}
            <div className="mt-5 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Sắc thái vải:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground bg-secondary/50">
                <span className="size-2 rounded-full bg-accent/80" />
                {product.tone}
              </span>
            </div>

            {/* Size Selector */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-[0.14em] text-foreground">
                  Chọn kích thước
                </span>
                <span className="text-[0.72rem] text-muted-foreground underline cursor-pointer hover:text-foreground">
                  Bảng thông số
                </span>
              </div>
              <div className="mt-2.5 flex gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`grid h-10 w-12 place-items-center text-xs font-medium uppercase tracking-wider transition-all ${
                      selectedSize === size
                        ? "border-2 border-foreground bg-foreground text-background"
                        : "border border-border bg-transparent text-foreground hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                Số lượng
              </span>
              <div className="mt-2.5 inline-flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 ${
                  addedAnimation
                    ? "bg-accent text-accent-foreground"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="size-4" /> Đã thêm vào giỏ
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-4" /> Thêm vào giỏ ({product.price})
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                aria-label="Yêu thích sản phẩm"
                className={`grid size-12 place-items-center border border-border transition-colors ${
                  isLiked
                    ? "border-destructive text-destructive bg-destructive/10"
                    : "text-foreground hover:border-foreground"
                }`}
              >
                <Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Policy Badges */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Truck className="size-3.5 text-accent" />
                <span className="text-[0.65rem] leading-tight">Freeship toàn quốc</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <RotateCcw className="size-3.5 text-accent" />
                <span className="text-[0.65rem] leading-tight">Đổi trả 7 ngày</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ShieldCheck className="size-3.5 text-accent" />
                <span className="text-[0.65rem] leading-tight">100% Tơ tằm thật</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
