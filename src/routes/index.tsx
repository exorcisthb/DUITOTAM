import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, Heart, LogOut, Menu, Package, Search, ShoppingBag, Star, User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo, BrandMark } from "@/components/brand-logo";
import { toSlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";
import silkDetail from "@/assets/silk-detail.jpg";
import heroVideo from "@/assets/moc-silk-hero.mp4.asset.json";
import heroPoster from "@/assets/moc-silk-hero-poster.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison de Silk — Thời trang đũi tơ tằm cao cấp" },
      { name: "description", content: "Khám phá thời trang đũi tơ tằm Việt Nam, được dệt thủ công cho nhịp sống đương đại." },
      { property: "og:title", content: "Maison de Silk — Thời trang đũi tơ tằm cao cấp" },
      { property: "og:description", content: "Thiết kế thanh lịch từ sợi tơ tự nhiên và bàn tay nghệ nhân Việt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const products = [
  { name: "Áo dài Mây", category: "Áo dài", price: "3.890.000₫", image: ivory, tone: "Ngà nguyên bản", tag: "Mới" },
  { name: "Bộ Lam An", category: "Trang phục hằng ngày", price: "2.490.000₫", image: charcoal, tone: "Than tre", tag: "Bán chạy" },
  { name: "Đầm Nguyệt Quế", category: "Đầm", price: "3.290.000₫", image: green, tone: "Lá dâu", tag: "Độc bản" },
  { name: "Áo An Nhiên", category: "Áo kiểu", price: "1.590.000₫", image: ivory, tone: "Mộc", tag: "" },
  { name: "Quần Hiên", category: "Quần", price: "1.890.000₫", image: charcoal, tone: "Mực", tag: "" },
  { name: "Đầm Thanh Diệp", category: "Đầm", price: "2.990.000₫", image: green, tone: "Rêu non", tag: "Mới" },
  { name: "Áo dài Tĩnh", category: "Áo dài", price: "4.190.000₫", image: ivory, tone: "Trắng gạo", tag: "Đặt trước" },
  { name: "Bộ Mặc Nhiên", category: "Trang phục hằng ngày", price: "2.690.000₫", image: charcoal, tone: "Đen đũi", tag: "" },
];

const filters = ["Tất cả", "Áo dài", "Đầm", "Áo kiểu", "Quần"];

function Home() {
  const { user, openAuthModal, logout } = useAuth();
  const { totalCount, openCart, addToCart } = useCart();
  const [filter, setFilter] = useState("Tất cả");
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleProducts = filter === "Tất cả" ? products : products.filter((product) => product.category === filter);
  const demo = (label: string) => setNotice(`${label} sẽ sớm được mở.`);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setSearchQuery("");
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(""); };

  const searchSuggestions = searchQuery.trim().length > 0
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        p.tone.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <button className="md:hidden" aria-label="Mở menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
          <BrandLogo size="md" />
          <nav className="hidden items-center gap-8 text-[0.72rem] font-semibold uppercase tracking-[0.14em] md:flex">
            {/* Products with hover dropdown */}
            <div className="relative group/nav">
              <a
                href="/products"
                className="flex items-center gap-1 transition-colors hover:text-accent group-hover/nav:text-accent"
              >
                Sản phẩm
                <svg className="size-3 transition-transform group-hover/nav:rotate-180" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4l4 4 4-4"/></svg>
              </a>

              {/* Dropdown */}
              <div
                className="absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto transition-all duration-200 translate-y-1 group-hover/nav:translate-y-0 z-50"
              >
                <div className="min-w-[180px] rounded-md border border-border bg-background/98 shadow-xl backdrop-blur-md overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/60">
                    <p className="text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Danh mục</p>
                  </div>
                  {["Tất cả", "Áo dài", "Đầm", "Áo kiểu", "Quần", "Trang phục hằng ngày"].map((cat) => (
                    <a
                      key={cat}
                      href={`/products?category=${encodeURIComponent(cat)}`}
                      className="flex items-center justify-between px-4 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-secondary hover:text-accent"
                    >
                      {cat}
                      <svg className="size-3 opacity-30" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2l4 4-4 4"/></svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <a href="#craft" onClick={(e) => scrollToSection(e, "craft")} className="transition-colors hover:text-accent">Chất liệu</a>
            <a href="/community" className="flex items-center gap-1.5 transition-colors hover:text-accent"><Users size={15}/> Community</a>
          </nav>
          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="icon" aria-label="Tìm kiếm" onClick={openSearch}><Search /></Button>
            
            {user ? (
              <div className="relative" ref={userMenuRef}>
                {/* Avatar circle button */}
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Tài khoản"
                  className="relative grid size-9 place-items-center rounded-full bg-foreground text-background text-sm font-bold uppercase hover:opacity-90 transition-all ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-accent/50 cursor-pointer select-none shadow-md"
                >
                  {user.name.charAt(0)}
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-border bg-secondary/30">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-9 place-items-center rounded-full bg-foreground text-background text-sm font-bold uppercase shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-[0.65rem] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <a
                        href="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        <User className="size-3.5 text-muted-foreground" />
                        <span>Thông tin cá nhân</span>
                      </a>
                      <a
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-foreground hover:bg-secondary/60 transition-colors"
                      >
                        <Package className="size-3.5 text-muted-foreground" />
                        <span>Quản lý đơn hàng</span>
                      </a>
                    </div>

                    {/* Divider + logout */}
                    <div className="border-t border-border py-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                          setNotice("Đã đăng xuất tài khoản.");
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="size-3.5" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" aria-label="Đăng nhập" asChild>
                  <a href="/login"><User /><span className="hidden lg:inline">Đăng nhập</span></a>
                </Button>
                <Button variant="quiet" size="sm" className="hidden lg:inline-flex" asChild>
                  <a href="/register">Đăng ký</a>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label={`Giỏ hàng, ${totalCount} sản phẩm`}
              onClick={openCart}
              className="relative cursor-pointer"
            >
              <ShoppingBag />
              <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-foreground">
                {totalCount}
              </span>
            </Button>
          </div>
        </div>
        {menu && (
          <div className="grid gap-4 border-t border-border px-5 py-5 text-sm uppercase tracking-[0.12em] md:hidden">
            <div className="pb-2 border-b border-border">
              <BrandLogo size="sm" onClick={() => setMenu(false)} />
            </div>
            <div className="space-y-1">
              <a href="/products" onClick={() => setMenu(false)} className="block">Sản phẩm</a>
              <div className="pl-3 grid gap-1 border-l border-border/60">
                {["Áo dài", "Đầm", "Áo kiểu", "Quần", "Trang phục hằng ngày"].map((cat) => (
                  <a
                    key={cat}
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    onClick={() => setMenu(false)}
                    className="text-[0.68rem] text-muted-foreground hover:text-accent transition-colors normal-case tracking-[0.06em] py-0.5"
                  >
                    {cat}
                  </a>
                ))}
              </div>
            </div>
            <a href="#craft" onClick={(e) => { setMenu(false); scrollToSection(e, "craft"); }}>Chất liệu</a>
            <a href="/community" onClick={() => setMenu(false)} className="text-left block">Community</a>
            {user ? (
              <div className="border-t border-border pt-4 mt-1 space-y-1">
                <div className="flex items-center gap-2.5 pb-2">
                  <div className="grid size-9 place-items-center rounded-full bg-foreground text-background text-sm font-bold uppercase shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-[0.65rem] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <a href="/login" onClick={() => setMenu(false)} className="flex items-center gap-2 text-xs text-foreground py-1.5">
                  <User size={14} className="text-muted-foreground" /> Thông tin cá nhân
                </a>
                <a href="/orders" onClick={() => setMenu(false)} className="flex items-center gap-2 text-xs text-foreground py-1.5">
                  <Package size={14} className="text-muted-foreground" /> Quản lý đơn hàng
                </a>
                <button
                  className="flex items-center gap-2 text-destructive text-xs py-1.5"
                  onClick={() => {
                    setMenu(false);
                    logout();
                    setNotice("Đã đăng xuất tài khoản.");
                  }}
                >
                  <LogOut size={14} /> Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <a href="/login" onClick={() => setMenu(false)}>Đăng nhập</a>
                <a href="/register" onClick={() => setMenu(false)}>Đăng ký</a>
              </>
            )}
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-label="Tìm kiếm sản phẩm">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeSearch} />
          {/* Panel */}
          <div className="relative z-10 border-b border-border bg-background shadow-2xl">
            <div className="mx-auto max-w-[1440px] px-5 md:px-10">
              {/* Input row */}
              <div className="flex items-center gap-3 py-4">
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                    if (e.key === "Escape") closeSearch();
                  }}
                  placeholder="Tìm kiếm sản phẩm, danh mục, chất liệu..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 text-foreground"
                  aria-label="Ô tìm kiếm"
                />
                <button onClick={closeSearch} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Đóng tìm kiếm">
                  <X className="size-5" />
                </button>
              </div>

              {/* Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="border-t border-border/60 pb-3">
                  <p className="py-2 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Gợi ý</p>
                  <ul className="divide-y divide-border/40">
                    {searchSuggestions.map((p) => (
                      <li key={p.name}>
                        <a
                          href={`/product/${toSlug(p.name)}`}
                          onClick={closeSearch}
                          className="flex items-center gap-4 py-3 group transition-colors hover:text-accent"
                        >
                          <img src={p.image} alt={p.name} className="size-11 object-cover shrink-0 bg-secondary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">{p.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.category} — {p.tone}</p>
                          </div>
                          <span className="text-sm font-semibold shrink-0 text-muted-foreground group-hover:text-accent transition-colors">{p.price}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                  {searchQuery.trim() && (
                    <a
                      href={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={closeSearch}
                      className="mt-1 flex items-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent hover:underline"
                    >
                      <Search className="size-3.5" />
                      Xem tất cả kết quả cho “{searchQuery.trim()}”
                    </a>
                  )}
                </div>
              )}

              {/* No results */}
              {searchQuery.trim().length > 0 && searchSuggestions.length === 0 && (
                <div className="border-t border-border/60 py-6 text-center">
                  <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm nào khớp với “{searchQuery}”</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <section id="top" className="relative min-h-[calc(100svh-80px)] overflow-hidden border-b border-border bg-primary">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero-video.mp4"
          poster={silkDetail}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Người mẫu mặc trang phục lụa đũi Maison de Silk"
        />
        <div className="absolute inset-0 bg-primary/20" aria-hidden="true" />
        <div className="relative z-10 flex min-h-[calc(100svh-80px)] items-end justify-center px-5 pb-14 pt-24 text-center text-primary-foreground md:pb-20">
          <div className="max-w-3xl flex flex-col items-center">
            <img
              src="/logo-white.png"
              alt="Maison de Silk"
              className="h-28 md:h-40 w-auto object-contain mb-6 drop-shadow-md select-none"
            />
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/90">Bộ sưu tập Thu Đông 2026</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-primary-foreground/90 md:text-base">Vẻ đẹp nguyên bản của đũi tơ tằm, được dệt chậm cho người phụ nữ Việt đương đại.</p>
            <Button variant="quiet" size="commerce" className="mt-7 border-primary-foreground bg-background/95 text-foreground hover:bg-background" asChild><a href="#products" onClick={(e) => scrollToSection(e, "products")}>Khám phá bộ sưu tập <ArrowRight /></a></Button>
          </div>
        </div>
        <a href="#products" onClick={(e) => scrollToSection(e, "products")} className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 text-[0.62rem] uppercase tracking-[0.25em] text-primary-foreground/80 md:block transition-opacity hover:opacity-100 opacity-80">Cuộn để khám phá ↓</a>
      </section>

      <section id="products" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-7 md:flex-row md:items-end">
          <div><p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">Chọn riêng cho bạn</p><h2 className="font-display text-4xl md:text-6xl">Sản phẩm nổi bật</h2></div>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
            {filters.map((item) => <Button key={item} variant={filter === item ? "commerce" : "quiet"} size="sm" onClick={() => setFilter(item)}>{item}</Button>)}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <article key={product.name} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <img
                  src={product.image}
                  alt={product.name}
                  width={1024}
                  height={1280}
                  loading={index < 4 ? "eager" : "lazy"}
                  className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${index > 2 ? "object-[50%_25%]" : ""}`}
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
                  className="absolute bottom-3 right-3 z-10 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100 cursor-pointer"
                  aria-label={`Thêm ${product.name} vào giỏ`}
                  onClick={() => addToCart(product, "M", 1)}
                >
                  <ShoppingBag />
                </Button>
                <button
                  aria-label={`Yêu thích ${product.name}`}
                  className="absolute right-3 top-3 z-10 grid size-9 place-items-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Heart size={17}/>
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
                </div>
                <p className="shrink-0 text-sm font-semibold">{product.price}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <a
            href="/products"
            className="inline-flex items-center gap-2.5 border border-border px-8 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-all hover:bg-foreground hover:text-background hover:border-foreground"
          >
            Xem tất cả sản phẩm
            <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </a>
        </div>
      </section>

      <section id="craft" className="bg-secondary py-20 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:grid-cols-2 md:items-center md:px-10">
          <div className="overflow-hidden"><img src={silkDetail} alt="Bề mặt vải đũi tơ tằm nguyên bản" width={1536} height={1024} loading="lazy" className="aspect-[3/2] h-full w-full object-cover transition-transform duration-1000 hover:scale-[1.02]" /></div>
          <div className="max-w-xl md:pl-10"><p className="text-xs uppercase tracking-[0.2em] text-accent">Từ kén tằm đến nếp áo</p><h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">Một tấm vải,<br/>nhiều đời gìn giữ.</h2><p className="mt-7 leading-7 text-muted-foreground">Mỗi mét đũi được se từ tơ thô, dệt trên khung gỗ và nhuộm bằng sắc màu từ thiên nhiên. Những nốt sần nhỏ không phải khiếm khuyết — đó là dấu vân tay của chất liệu thật.</p><div className="mt-9 grid grid-cols-3 gap-4 border-y border-border py-6"><div><strong className="font-display text-3xl">14</strong><p className="mt-1 text-xs text-muted-foreground">ngày hoàn thiện</p></div><div><strong className="font-display text-3xl">08</strong><p className="mt-1 text-xs text-muted-foreground">làng nghề</p></div><div><strong className="font-display text-3xl">100%</strong><p className="mt-1 text-xs text-muted-foreground">tơ tự nhiên</p></div></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-5 py-24 text-center md:py-32"><div className="mb-5 flex justify-center gap-1 text-accent">{Array.from({length:5}).map((_,i)=><Star key={i} size={16} fill="currentColor"/>)}</div><blockquote className="font-display text-3xl leading-snug md:text-5xl">“Mặc lên nhẹ như không, nhưng từng đường vân vải lại kể một câu chuyện rất Việt.”</blockquote><p className="mt-7 text-xs uppercase tracking-[0.18em] text-muted-foreground">Thu Hà — Khách hàng tại Hà Nội</p></section>

      <footer className="bg-primary px-5 py-14 text-primary-foreground md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo-white.png"
                alt="Maison de Silk"
                className="h-12 w-auto object-contain"
              />
              <span className="font-display text-2xl tracking-[0.14em]">MAISON DE SILK</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/65">
              Thời trang đũi tơ tằm cao cấp, mang tinh thần Việt vào từng chuyển động.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/55">Khám phá</p>
              <a href="/products" className="block hover:underline">Sản phẩm</a>
              <a href="#craft" className="block hover:underline">Câu chuyện</a>
              <a href="/community" className="block hover:underline">Community</a>
              <a href="/blog" className="block hover:underline">Blog</a>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/55">Hỗ trợ</p>
              <p>Chăm sóc sản phẩm</p>
              <p>Đổi trả</p>
              <p>Liên hệ</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/55">Thư từ Maison</p>
            <p className="mt-3 text-sm">Nhận câu chuyện chất liệu và bộ sưu tập mới.</p>
            <div className="mt-5 flex border-b border-primary-foreground/35">
              <input className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-primary-foreground/45" placeholder="Email của bạn"/>
              <button aria-label="Đăng ký nhận thư"><ArrowRight/></button>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/50 md:flex-row">
          <p className="flex items-center gap-2">
            <img src="/logo-white.png" alt="" className="size-3.5 object-contain inline-block opacity-60" />
            © 2026 Maison de Silk. Gìn giữ nét Việt.
          </p>
          <p>Hà Nội · Hội An · TP. Hồ Chí Minh</p>
        </div>
      </footer>
      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 bg-primary px-5 py-3 text-sm text-primary-foreground shadow-xl">{notice}</div>}
    </main>
  );
}