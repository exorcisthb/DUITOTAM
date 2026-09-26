import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  X,
  Image as ImageIcon,
  Trash2,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
  GalleryThumbnails,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { virtualTryOnFn } from "@/lib/virtual-tryon-fn";

export const Route = createFileRoute("/try-on")({
  head: () => ({
    meta: [
      { title: "Thử đồ ảo AI — Maison de Silk" },
      { name: "description", content: "Thử đồ ảo với AI: chọn nhiều mẫu trang phục, upload ảnh bạn, AI gen kết quả." },
    ],
  }),
  component: TryOnPage,
});

// Sample clothing items from products data (for demo)
const CLOTHING_SAMPLES = [
  { id: "ao-dai-may", name: "Áo dài Mây", tone: "Ngà nguyên bản", price: "3.890.000₫", image: "/assets/product-ivory.jpg" },
  { id: "bo-lam-an", name: "Bộ Lam An", tone: "Than tre", price: "2.490.000₫", image: "/assets/product-charcoal.jpg" },
  { id: "dam-nguyet-que", name: "Đầm Nguyệt Quế", tone: "Lá dâu", price: "3.290.000₫", image: "/assets/product-green.jpg" },
  { id: "ao-an-nhien", name: "Áo An Nhiên", tone: "Mộc", price: "1.590.000₫", image: "/assets/product-ivory.jpg" },
  { id: "quan-hien", name: "Quần Hiên", tone: "Mực", price: "1.890.000₫", image: "/assets/product-charcoal.jpg" },
  { id: "dam-thanh-diep", name: "Đầm Thanh Diệp", tone: "Rêu non", price: "2.990.000₫", image: "/assets/product-green.jpg" },
  { id: "ao-dai-tinh", name: "Áo dài Tĩnh", tone: "Trắng gạo", price: "4.190.000₫", image: "/assets/product-ivory.jpg" },
  { id: "bo-mac-nhien", name: "Bộ Mặc Nhiên", tone: "Đen đũi", price: "2.690.000₫", image: "/assets/product-charcoal.jpg" },
];

function TryOnPage() {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [selectedClothingIds, setSelectedClothingIds] = useState<string[]>([]);
  const [results, setResults] = useState<Record<string, { imageUrl?: string; loading?: boolean; error?: string }>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(results).forEach(r => { if (r.imageUrl) URL.revokeObjectURL(r.imageUrl); });
      if (personPreview) URL.revokeObjectURL(personPreview);
    };
  }, [results, personPreview]);

  const handlePersonFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGlobalError(null);
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
    }
  }, []);

  const removePersonImage = useCallback(() => {
    setPersonFile(null);
    setPersonPreview(null);
  }, []);

  const toggleClothing = useCallback((id: string) => {
    setSelectedClothingIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const handleGenerate = useCallback(async (clothingId: string, clothingImageUrl: string) => {
    if (!personFile) {
      setResults(prev => ({ ...prev, [clothingId]: { ...prev[clothingId], error: "Vui lòng tải lên ảnh của bạn trước" } }));
      return;
    }

    setResults(prev => ({ ...prev, [clothingId]: { imageUrl: "", loading: true } }));
    setGlobalError(null);

    try {
      const formData = new FormData();
      formData.append("personImage", personFile);

      // Fetch clothing image
      const clothingResponse = await fetch(clothingImageUrl);
      if (!clothingResponse.ok) throw new Error("Không thể tải ảnh sản phẩm");
      const clothingBlob = await clothingResponse.blob();
      const clothingFile = new File([clothingBlob], "clothing.jpg", { type: "image/jpeg" });
      formData.append("clothingImage", clothingFile);

      const response = await virtualTryOnFn({ data: formData });

      if (response.success && response.resultImageUrl) {
        setResults(prev => ({ ...prev, [clothingId]: { imageUrl: response.resultImageUrl!, loading: false } }));
      } else {
        setResults(prev => ({ ...prev, [clothingId]: { imageUrl: "", loading: false, error: response.error || "Không thể tạo ảnh" } }));
      }
    } catch (err: unknown) {
      console.error("Try-on error:", err);
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setResults(prev => ({ ...prev, [clothingId]: { imageUrl: "", loading: false, error: message } }));
    }
  }, [personFile]);

  const downloadResult = (clothingId: string, name: string) => {
    const url = results[clothingId]?.imageUrl;
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `try-on-${name.replace(/\s+/g, "-")}-${Date.now()}.png`;
    link.click();
  };

  const clearAllResults = () => {
    Object.values(results).forEach(r => { if (r.imageUrl) URL.revokeObjectURL(r.imageUrl); });
    setResults({});
  };

  const removePersonFile = () => {
    setPersonFile(null);
    setPersonPreview(null);
  };

  const selectedClothing = CLOTHING_SAMPLES.filter(c => selectedClothingIds.includes(c.id));
  const availableClothing = CLOTHING_SAMPLES.filter(c => !selectedClothingIds.includes(c.id));

  const uploadZoneStyle = {
    border: "2px dashed",
    borderColor: "var(--border)",
    borderRadius: "1rem",
    padding: "2rem",
    textAlign: "center" as const,
    background: "var(--secondary)",
    transition: "all 0.2s",
    cursor: "pointer",
    position: "relative" as const,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> Trang chủ
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/products" className="hidden sm:block text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors">
              Cửa hàng
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">
            <Sparkles className="inline size-3.5 mr-1.5" />
            AI Virtual Try-On Studio
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-normal">Thử đồ ảo đa mẫu</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Chọn nhiều mẫu trang phục, upload 1 ảnh của bạn — AI sẽ gen thử đồ cho từng mẫu bạn chọn.
          </p>
        </div>

        {globalError && (
          <div className="mb-6 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive animate-in fade-in">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Upload Person + Selected Clothing */}
          <div className="lg:col-span-1 space-y-6">
            {/* Person Upload */}
            <div className="border border-border bg-background p-6 rounded-xl">
              <label className="block text-sm font-semibold mb-4">Ảnh của bạn (chân dung/toàn thân)</label>
              <div className="relative">
                <input
                  type="file"
                  id="person-image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePersonFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className={personPreview ? "relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-accent/50" : "relative aspect-[3/4]"}
                  style={uploadZoneStyle}
                >
                  {personPreview ? (
                    <>
                      <img src={personPreview} alt="Ảnh của bạn" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={removePersonFile}
                        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors shadow-lg"
                        aria-label="Xóa ảnh"
                      >
                        <X className="size-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-emerald/90 text-emerald-foreground px-2 py-0.5 text-[0.65rem] font-medium rounded">
                        <CheckCircle2 className="size-3 inline mr-1" /> Đã sẵn sàng
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto size-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để chọn ảnh</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP • Tối đa 10MB</p>
                    </>
                  )}
                </div>
              </div>
              {personPreview && (
                <div className="mt-4 p-3 rounded-lg bg-emerald/10 border border-emerald/30">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Ảnh của bạn đã sẵn sàng cho gen thử đồ
                  </p>
                </div>
              )}

              {/* Selected Clothing */}
              <div className="border border-border bg-background p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Đã chọn ({selectedClothing.length})</h3>
                  {selectedClothing.length > 0 && (
                    <button
                      onClick={clearAllResults}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="size-3" /> Xóa kết quả
                    </button>
                  )}
                </div>
                {selectedClothing.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GalleryThumbnails className="mx-auto size-8 mb-2 opacity-40" />
                    <p className="text-sm">Chưa chọn mẫu nào</p>
                    <p className="text-xs mt-1">Chọn từ danh sách bên phải</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedClothing.map((item) => {
                      const result = results[item.id];
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30 border border-border">
                          <img src={item.image} alt={item.name} className="size-12 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.name}</p>
                            <p className="text-[0.65rem] text-muted-foreground">{item.tone} • {item.price}</p>
                          </div>
                          {result?.loading ? (
                            <Loader2 className="size-5 text-accent animate-spin" />
                          ) : result?.imageUrl ? (
                            <button
                              onClick={() => downloadResult(item.id, item.name)}
                              className="p-2 rounded-full bg-emerald/10 text-emerald-600 hover:bg-emerald/20 transition-colors"
                              aria-label="Tải ảnh kết quả"
                            >
                              <Download className="size-4" />
                            </button>
                          ) : result?.error ? (
                            <button
                              onClick={() => handleGenerate(item.id, CLOTHING_SAMPLES.find(c => c.id === item.id)!.image)}
                              className="p-2 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                              aria-label="Thử lại"
                            >
                              <RotateCcw className="size-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerate(item.id, item.image)}
                              className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                              aria-label="Gen thử đồ cho mẫu này"
                            >
                              <Sparkles className="size-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const result = results[item.id];
                              setSelectedClothingIds(prev => prev.filter(x => x !== item.id));
                              if (result?.imageUrl) URL.revokeObjectURL(result.imageUrl);
                              setResults(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                            }}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Bỏ chọn mẫu này"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Mẹo hay:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ảnh bạn: Chân dung rõ mặt, ánh sáng tốt, đứng thẳng, nền đơn giản</li>
                <li>Chọn nhiều mẫu cùng lúc → gen hàng loạt (mỗi mẫu tốn ~10-15s)</li>
                <li>Kết quả chỉ tham khảo, màu sắc/fit thực tế có thể khác</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Clothing Catalog + Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Clothing Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">Chọn mẫu trang phục</h2>
                <span className="text-xs text-muted-foreground">Click để chọn/bỏ chọn • Đã chọn: {selectedClothing.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableClothing.map((item) => {
                  const isSelected = selectedClothingIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleClothing(item.id)}
                      className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition-all group ${
                        isSelected
                          ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : "border-border hover:border-foreground/50 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-xs">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-[0.65rem] opacity-80">{item.tone} • {item.price}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full text-[0.6rem] font-bold">
                          ✓ Đã chọn
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-white/90 text-foreground px-2 py-0.5 text-[0.65rem] font-medium rounded">
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="size-3 inline mr-1" /> Đã chọn
                          </>
                        ) : (
                          <>
                            <Plus className="size-3 inline mr-1" /> Chọn
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Section */}
            {selectedClothing.length > 0 && (
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold">Kết quả thử đồ</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {selectedClothing.filter(c => results[c.id]?.imageUrl).length} / {selectedClothing.length} đã gen
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedClothing.map((item) => {
                    const result = results[item.id];
                    return (
                      <div key={item.id} className="group relative border border-border bg-background rounded-xl overflow-hidden">
                        <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
                          {result?.loading ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="size-10 text-accent animate-spin" />
                            </div>
                          ) : result?.imageUrl ? (
                            <>
                              <img
                                src={result.imageUrl}
                                alt={`Kết quả ${item.name}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                                <button
                                  onClick={() => downloadResult(item.id, item.name)}
                                  className="flex-1 grid size-8 place-items-center rounded-full bg-background/95 text-foreground shadow-lg hover:bg-background backdrop-blur transition-colors"
                                  aria-label="Tải ảnh"
                                >
                                  <Download className="size-4" />
                                </button>
                                <button
                                  onClick={() => handleGenerate(item.id, CLOTHING_SAMPLES.find(c => c.id === item.id)!.image)}
                                  className="grid size-8 place-items-center rounded-full bg-background/95 text-foreground shadow-lg hover:bg-background backdrop-blur transition-colors"
                                  aria-label="Gen lại"
                                >
                                  <RotateCcw className="size-4" />
                                </button>
                              </div>
                            </>
                          ) : result?.error ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center text-destructive">
                              <AlertCircle className="size-8" />
                              <p className="text-xs text-center">Gen thất bại</p>
                              <button
                                onClick={() => handleGenerate(item.id, CLOTHING_SAMPLES.find(c => c.id === item.id)!.image)}
                                className="mt-2 text-xs text-accent hover:underline flex items-center gap-1"
                              >
                                <RotateCcw className="size-3" /> Thử lại
                              </button>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <Sparkles className="size-10 opacity-40" />
                              <p className="text-xs text-center">Chưa gen</p>
                              <button
                                onClick={() => handleGenerate(item.id, item.image)}
                                className="mt-2 text-xs text-accent hover:underline flex items-center gap-1"
                              >
                                <Sparkles className="size-3" /> Gen thử đồ
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-3 border-t border-border">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-[0.65rem] text-muted-foreground mt-0.5">{item.tone} • {item.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-border bg-background/50 py-6 px-5 text-center text-xs text-muted-foreground">
        <p>Beta feature • Powered by Google Gemini 2.5 Flash Image (Nano Banana)</p>
        <p className="mt-1">Ảnh của bạn chỉ dùng để tạo ảnh thử đồ, không được lưu trữ trên server</p>
      </footer>
    </div>
  );
}