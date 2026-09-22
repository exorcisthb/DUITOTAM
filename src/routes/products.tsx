import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, ShoppingBag, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { toSlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined; search?: string | undefined } => ({
    category: (search["category"] as string) || undefined,
    search: (search["search"] as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Bộ sưu tập sản phẩm — Maison de Silk" },
      { name: "description", content: "Khám phá toàn bộ bộ sưu tập thời trang đũi tơ tằm Maison de Silk." },
    ],
  }),
  component: ProductsPage,
});

const allProducts = [
  { name: "Áo dài Mây", category: "Áo dài", price: "3.890.000₫", image: ivory, tone: "Ngà nguyên bản", tag: "Mới" },
  { name: "Bộ Lam An", category: "Trang phục hằng ngày", price: "2.490.000₫", image: charcoal, tone: "Than tre", tag: "Bán chạy" },
  { name: "Đầm Nguyệt Quế", category: "Đầm", price: "3.290.000₫", image: green, tone: "Lá dâu", tag: "Độc bản" },
  { name: "Áo An Nhiên", category: "Áo kiểu", price: "1.590.000₫", image: ivory, tone: "Mộc", tag: "" },
  { name: "Quần Hiên", category: "Quần", price: "1.890.000₫", image: charcoal, tone: "Mực", tag: "" },
  { name: "Đầm Thanh Diệp", category: "Đầm", price: "2.990.000₫", image: green, tone: "Rêu non", tag: "Mới" },
  { name: "Áo dài Tĩnh", category: "Áo dài", price: "4.190.000₫", image: ivory, tone: "Trắng gạo", tag: "Đặt trước" },
  { name: "Bộ Mặc Nhiên", category: "Trang phục hằng ngày", price: "2.690.000₫", image: charcoal, tone: "Đen đũi", tag: "" },
  { name: "Đầm Bình Minh", category: "Đầm", price: "3.490.000₫", image: ivory, tone: "Hồng đất", tag: "" },
  { name: "Áo dài Sương", category: "Áo dài", price: "4.590.000₫", image: green, tone: "Sương mai", tag: "Mới" },
  { name: "Áo Lặng Yên", category: "Áo kiểu", price: "1.790.000₫", image: charcoal, tone: "Bóng tối", tag: "" },
  { name: "Quần Nhàn", category: "Quần", price: "1.690.000₫", image: ivory, tone: "Lụa cháo", tag: "Bán chạy" },
];

const filters = ["Tất cả", "Áo dài", "Đầm", "Áo kiểu", "Quần", "Trang phục hằng ngày"];

function ProductsPage() {
  const { category: initialCategory, search: initialSearch } = Route.useSearch();
  const { totalCount, openCart, addToCart } = useCart();
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState(initialCategory ?? "Tất cả");
  const [searchQuery, setSearchQuery] = useState(initialSearch ?? "");

  useEffect(() => {
    setFilter(initialCategory ?? "Tất cả");
    setSearchQuery(initialSearch ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialCategory, initialSearch]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visible = allProducts.filter((p) => {
    const matchCat = filter === "Tất cả" || p.category === filter;
    const matchSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) || p.category.toLowerCase().includes(searchQuery.trim().toLowerCase()) || p.tone.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Trang chủ
          </Link>
          <BrandLogo size="md" />
          <div className="flex items-center justify-end w-24">
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


      {/* Filter bar */}
      <div className="sticky top-20 z-30 border-b border-border bg-background/95 backdrop-blur-md px-5 md:px-10">
        <div className="mx-auto flex max-w-[1440px] gap-1.5 overflow-x-auto py-3">
          {filters.map((item) => (
            <Button
              key={item}
              variant={filter === item ? "commerce" : "quiet"}
              size="sm"
              className="shrink-0"
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10">
        {visible.length === 0 ? (
          <div className="py-32 text-center text-muted-foreground">
            <p className="font-display text-2xl">Không có sản phẩm nào</p>
            <p className="mt-2 text-sm">Thử chọn danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
            {visible.map((product, index) => (
              <article key={product.name} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
                    width={1024}
                    height={1280}
                    loading={index < 8 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  {product.tag && (
                    <span className="absolute left-3 top-3 z-10 bg-background/92 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.13em]">
                      {product.tag}
                    </span>
                  )}

                  {/* Nút Xem sản phẩm khi hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                    <a
                      href={`/product/${toSlug(product.name)}`}
                      className="inline-flex items-center gap-2 border border-border/80 bg-background/95 px-4 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-foreground shadow-lg transition-all duration-300 hover:bg-foreground hover:text-background hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      Xem sản phẩm
                    </a>
                  </div>

                  <Button
                    variant="commerce"
                    size="icon"
                    className="absolute bottom-3 right-3 z-10 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
                    aria-label={`Thêm ${product.name} vào giỏ`}
                    onClick={() => addToCart(product, "M", 1)}
                  >
                    <ShoppingBag />
                  </Button>
                  <button
                    aria-label={`Yêu thích ${product.name}`}
                    className="absolute right-3 top-3 z-10 grid size-9 place-items-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Heart size={17} />
                  </button>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <a
                      href={`/product/${toSlug(product.name)}`}
                      className="font-medium hover:text-accent transition-colors block"
                    >
                      {product.name}
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">{product.tone}</p>
                    <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground/70">{product.category}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{product.price}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {notice && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 bg-primary px-5 py-3 text-sm text-primary-foreground shadow-xl">
          {notice}
        </div>
      )}
    </main>
  );
}
