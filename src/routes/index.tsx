import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Menu, Search, ShoppingBag, Star, User, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SilkOrbit } from "@/components/silk-orbit";
import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";
import silkDetail from "@/assets/silk-detail.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mộc Silk — Thời trang đũi tơ tằm cao cấp" },
      { name: "description", content: "Khám phá thời trang đũi tơ tằm Việt Nam, được dệt thủ công cho nhịp sống đương đại." },
      { property: "og:title", content: "Mộc Silk — Thời trang đũi tơ tằm cao cấp" },
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
  const [filter, setFilter] = useState("Tất cả");
  const [bag, setBag] = useState(0);
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const visibleProducts = filter === "Tất cả" ? products : products.filter((product) => product.category === filter);
  const demo = (label: string) => setNotice(`${label} sẽ sớm được mở.`);

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <div className="bg-primary px-4 py-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-primary-foreground">
        Miễn phí giao hàng toàn quốc cho đơn từ 2.000.000₫
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <button className="md:hidden" aria-label="Mở menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
          <a href="#top" className="font-display text-2xl tracking-[0.2em]">MỘC <span className="text-accent">SILK</span></a>
          <nav className="hidden items-center gap-8 text-[0.72rem] font-semibold uppercase tracking-[0.14em] md:flex">
            <a href="#products" className="transition-colors hover:text-accent">Sản phẩm</a>
            <a href="#craft" className="transition-colors hover:text-accent">Chất liệu</a>
            <button onClick={() => demo("Community")} className="flex items-center gap-1.5 transition-colors hover:text-accent"><Users size={15}/> Community</button>
          </nav>
          <div className="flex items-center gap-1 md:gap-3">
            <Button variant="ghost" size="icon" aria-label="Tìm kiếm" onClick={() => demo("Tìm kiếm")}><Search /></Button>
            <Button variant="ghost" size="sm" aria-label="Đăng nhập" onClick={() => demo("Đăng nhập")}><User /><span className="hidden lg:inline">Đăng nhập</span></Button>
            <Button variant="quiet" size="sm" className="hidden lg:inline-flex" onClick={() => demo("Đăng ký")}>Đăng ký</Button>
            <Button variant="ghost" size="icon" aria-label={`Giỏ hàng, ${bag} sản phẩm`} onClick={() => demo("Giỏ hàng")} className="relative"><ShoppingBag/><span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[0.6rem] text-accent-foreground">{bag}</span></Button>
          </div>
        </div>
        {menu && <div className="grid gap-4 border-t border-border px-5 py-5 text-sm uppercase tracking-[0.12em] md:hidden"><a href="#products" onClick={() => setMenu(false)}>Sản phẩm</a><a href="#craft" onClick={() => setMenu(false)}>Chất liệu</a><button className="text-left" onClick={() => demo("Community")}>Community</button><button className="text-left" onClick={() => demo("Đăng nhập")}>Đăng nhập</button><button className="text-left" onClick={() => demo("Đăng ký")}>Đăng ký</button></div>}
      </header>

      <section id="top" className="relative min-h-[calc(100svh-104px)] border-b border-border bg-hero">
        <div className="mx-auto grid min-h-[calc(100svh-104px)] max-w-[1440px] items-center px-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:px-10">
          <div className="relative z-10 max-w-xl pt-8 md:pt-0">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Bộ sưu tập Thu Đông 2026</p>
            <h1 className="font-display text-[clamp(3.4rem,7vw,7.4rem)] leading-[0.87]">Mộc Silk</h1>
            <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground md:text-lg">Vẻ đẹp nguyên bản của đũi tơ tằm, được dệt chậm và may đo cho người phụ nữ Việt đương đại.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button variant="commerce" size="commerce" asChild><a href="#products">Khám phá bộ sưu tập <ArrowRight /></a></Button>
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">100% sợi tơ tự nhiên</p>
            </div>
          </div>
          <div className="relative h-[48vh] min-h-[350px] md:h-[72vh]">
            <SilkOrbit />
            <div className="pointer-events-none absolute bottom-7 right-0 max-w-40 border-l border-accent pl-4 text-xs leading-5 text-muted-foreground">Chạm và di chuyển để cảm nhận chuyển động của sợi tơ.</div>
          </div>
        </div>
        <a href="#products" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground md:block">Cuộn để khám phá ↓</a>
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
                <img src={product.image} alt={product.name} width={1024} height={1280} loading={index < 4 ? "eager" : "lazy"} className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${index > 2 ? "object-[50%_25%]" : ""}`} />
                {product.tag && <span className="absolute left-3 top-3 bg-background/92 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.13em]">{product.tag}</span>}
                <Button variant="commerce" size="icon" className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100" aria-label={`Thêm ${product.name} vào giỏ`} onClick={() => { setBag(bag + 1); setNotice(`Đã thêm ${product.name} vào giỏ.`); }}><ShoppingBag /></Button>
                <button aria-label={`Yêu thích ${product.name}`} className="absolute right-3 top-3 grid size-9 place-items-center bg-background/90 opacity-0 transition-opacity group-hover:opacity-100"><Heart size={17}/></button>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="font-medium">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.tone}</p></div><p className="shrink-0 text-sm font-semibold">{product.price}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="craft" className="bg-secondary py-20 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:grid-cols-2 md:items-center md:px-10">
          <div className="overflow-hidden"><img src={silkDetail} alt="Bề mặt vải đũi tơ tằm nguyên bản" width={1536} height={1024} loading="lazy" className="aspect-[3/2] h-full w-full object-cover transition-transform duration-1000 hover:scale-[1.02]" /></div>
          <div className="max-w-xl md:pl-10"><p className="text-xs uppercase tracking-[0.2em] text-accent">Từ kén tằm đến nếp áo</p><h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">Một tấm vải,<br/>nhiều đời gìn giữ.</h2><p className="mt-7 leading-7 text-muted-foreground">Mỗi mét đũi được se từ tơ thô, dệt trên khung gỗ và nhuộm bằng sắc màu từ thiên nhiên. Những nốt sần nhỏ không phải khiếm khuyết — đó là dấu vân tay của chất liệu thật.</p><div className="mt-9 grid grid-cols-3 gap-4 border-y border-border py-6"><div><strong className="font-display text-3xl">14</strong><p className="mt-1 text-xs text-muted-foreground">ngày hoàn thiện</p></div><div><strong className="font-display text-3xl">08</strong><p className="mt-1 text-xs text-muted-foreground">làng nghề</p></div><div><strong className="font-display text-3xl">100%</strong><p className="mt-1 text-xs text-muted-foreground">tơ tự nhiên</p></div></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-5 py-24 text-center md:py-32"><div className="mb-5 flex justify-center gap-1 text-accent">{Array.from({length:5}).map((_,i)=><Star key={i} size={16} fill="currentColor"/>)}</div><blockquote className="font-display text-3xl leading-snug md:text-5xl">“Mặc lên nhẹ như không, nhưng từng đường vân vải lại kể một câu chuyện rất Việt.”</blockquote><p className="mt-7 text-xs uppercase tracking-[0.18em] text-muted-foreground">Thu Hà — Khách hàng tại Hà Nội</p></section>

      <footer className="bg-primary px-5 py-14 text-primary-foreground md:px-10"><div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-3"><div><p className="font-display text-3xl tracking-[0.14em]">MỘC SILK</p><p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/65">Thời trang đũi tơ tằm cao cấp, mang tinh thần Việt vào từng chuyển động.</p></div><div className="grid grid-cols-2 gap-8 text-sm"><div className="space-y-3"><p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/55">Khám phá</p><p>Sản phẩm</p><p>Câu chuyện</p><p>Community</p></div><div className="space-y-3"><p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/55">Hỗ trợ</p><p>Chăm sóc sản phẩm</p><p>Đổi trả</p><p>Liên hệ</p></div></div><div><p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/55">Thư từ Mộc</p><p className="mt-3 text-sm">Nhận câu chuyện chất liệu và bộ sưu tập mới.</p><div className="mt-5 flex border-b border-primary-foreground/35"><input className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-primary-foreground/45" placeholder="Email của bạn"/><button aria-label="Đăng ký nhận thư"><ArrowRight/></button></div></div></div><div className="mx-auto mt-12 flex max-w-[1440px] flex-col justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/50 md:flex-row"><p>© 2026 Mộc Silk. Gìn giữ nét Việt.</p><p>Hà Nội · Hội An · TP. Hồ Chí Minh</p></div></footer>
      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 bg-primary px-5 py-3 text-sm text-primary-foreground shadow-xl">{notice}</div>}
    </main>
  );
}