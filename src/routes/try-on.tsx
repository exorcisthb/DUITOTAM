import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
  Upload,
  X,
  RotateCcw,
  ShoppingBag,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { PRODUCTS_DATA, type ProductData, toSlug } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { virtualTryOnFn } from "@/lib/virtual-tryon-fn";

import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";

export const Route = createFileRoute("/try-on")({
  head: () => ({
    meta: [
      { title: "Phòng Thử Đồ Ảo AI — Maison de Silk" },
      {
        name: "description",
        content:
          "Thử trang phục đũi tơ tằm trực tiếp lên ảnh của bạn bằng công nghệ AI tiên tiến từ Maison de Silk.",
      },
    ],
  }),
  component: TryOnPage,
});

// Sample portrait model options for instant demo without uploading
const SAMPLE_MODELS = [
  {
    id: "sample-1",
    name: "Mẫu nữ Á Đông 1",
    image: "/sample-model-1.jpg",
    desc: "Áo dài truyền thống",
  },
  {
    id: "sample-2",
    name: "Mẫu nữ Á Đông 2",
    image: "/sample-model-2.jpg",
    desc: "Đầm suông hiện đại",
  },
  {
    id: "sample-3",
    name: "Mẫu phong cách Mộc",
    image: "/sample-model-3.jpg",
    desc: "Trang phục thường nhật",
  },
];

const CATEGORIES = [
  "Tất cả",
  "Áo dài",
  "Đầm",
  "Áo kiểu",
  "Quần",
  "Trang phục hằng ngày",
];

export default function TryOnPage() {
  const { totalCount, openCart, addToCart } = useCart();

  // State
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductData>(
    PRODUCTS_DATA[0] ?? ({} as ProductData)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");

  // Results & status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (personPreview && personPreview.startsWith("blob:")) {
        URL.revokeObjectURL(personPreview);
      }
      if (resultImage && resultImage.startsWith("blob:")) {
        URL.revokeObjectURL(resultImage);
      }
    };
  }, [personPreview, resultImage]);

  // Handle uploading user photo
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng tải lên định dạng file ảnh (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ảnh vượt quá 10MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }

    setErrorMessage(null);
    setPersonFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPersonPreview(objectUrl);
    setResultImage(null); // Reset previous result for new photo
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Use a sample model portrait
  const selectSampleModel = async (sample: (typeof SAMPLE_MODELS)[0]) => {
    try {
      setErrorMessage(null);
      setPersonPreview(sample.image);
      const res = await fetch(sample.image);
      const blob = await res.blob();
      const file = new File([blob], `${sample.id}.jpg`, { type: "image/jpeg" });
      setPersonFile(file);
      setResultImage(null);
    } catch (err) {
      console.error("Error setting sample photo:", err);
    }
  };

  const removeUserPhoto = () => {
    setPersonFile(null);
    if (personPreview && personPreview.startsWith("blob:")) {
      URL.revokeObjectURL(personPreview);
    }
    setPersonPreview(null);
    setResultImage(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Execute Try-On action
  const handleStartTryOn = async () => {
    if (!personFile && !personPreview) {
      setErrorMessage("Vui lòng tải lên ảnh của bạn ở Ô 1 trước khi bắt đầu.");
      return;
    }
    if (!selectedProduct) {
      setErrorMessage("Vui lòng chọn một trang phục ở hàng bên dưới.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setInfoNotice(null);
    setLoadingStep("Đang chuẩn bị ảnh chân dung và trang phục...");

    try {
      // Chuẩn bị file ảnh người dùng
      let actualPersonFile = personFile;
      if (!actualPersonFile && personPreview) {
        const res = await fetch(personPreview);
        const blob = await res.blob();
        actualPersonFile = new File([blob], "person.jpg", { type: "image/jpeg" });
      }

      setLoadingStep("Đang chuẩn bị trang phục " + selectedProduct.name + "...");
      const clothingRes = await fetch(selectedProduct.image);
      const clothingBlob = await clothingRes.blob();
      const clothingFile = new File([clothingBlob], "clothing.jpg", {
        type: clothingBlob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("personImage", actualPersonFile!);
      formData.append("clothingImage", clothingFile);
      formData.append(
        "garmentDescription",
        `${selectedProduct.name} - ${selectedProduct.tone} đũi tơ tằm`
      );
      formData.append("productId", selectedProduct.id);

      setLoadingStep("AI đang nhận diện vóc dáng và khuôn mặt của bạn...");

      const stepTimer1 = setTimeout(() => {
        setLoadingStep(
          "AI đang may đo và mặc " + selectedProduct.name + " lên người bạn..."
        );
      }, 2500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep("Đang tinh chỉnh nếp gấp vải lụa tơ tằm và ánh sáng tự nhiên...");
      }, 6000);

      // Gọi API Virtual Try-On IDM-VTON
      const result = await virtualTryOnFn({ data: formData });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (result.success && result.resultImageUrl) {
        setResultImage(result.resultImageUrl);
        setInfoNotice(
          "✓ Bạn đã được khoác lên chiếc " + selectedProduct.name + " thành công!"
        );
      } else {
        setErrorMessage(
          result.error || "AI không thể thử đồ. Hãy dùng ảnh chân dung rõ mặt, đứng thẳng."
        );
      }
    } catch (err: unknown) {
      console.error("TryOn API error:", err);
      const message = err instanceof Error ? err.message : "Lỗi kết nối khi gọi AI";
      setErrorMessage("Lỗi: " + message + ". Hãy thử lại.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  // Download image result
  const handleDownloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `maison-try-on-${toSlug(selectedProduct.name)}-${Date.now()}.jpg`;
    link.click();
  };

  // Filter products
  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (selectedCategory === "Tất cả") return true;
    return p.category === selectedCategory;
  });

  // When selecting a product from row 2
  const handleSelectProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setErrorMessage(null);

    // Scroll gently to result card if on mobile
    if (window.innerWidth < 768 && resultCardRef.current) {
      resultCardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Trang chủ
            </Link>
            <span className="hidden sm:inline text-border">/</span>
            <Link
              to="/products"
              className="hidden sm:inline text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Bộ sưu tập
            </Link>
          </div>

          <BrandLogo size="md" />

          <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-10 md:py-12">
        {/* Title & Description */}
        <div className="mb-8 md:mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold uppercase tracking-[0.18em] mb-3">
            <Sparkles className="size-3.5" />
            AI Virtual Fitting Studio
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight">
            Phòng Thử Đồ Ảo AI
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            Tải ảnh bản thân lên, chọn trang phục tơ tằm yêu thích ở danh sách bên
            dưới và trải nghiệm nếp áo đũi tự nhiên trên chính vóc dáng của bạn.
          </p>
        </div>

        {/* Global Error Notice */}
        {errorMessage && (
          <div className="mb-6 mx-auto max-w-4xl flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs md:text-sm text-destructive animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:opacity-70"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Info Notice */}
        {infoNotice && (
          <div className="mb-6 mx-auto max-w-4xl flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3.5 text-xs md:text-sm text-accent animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{infoNotice}</span>
            </div>
            <button
              onClick={() => setInfoNotice(null)}
              className="p-1 hover:opacity-70"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* HÀNG TRÊN: 2 Ô NẰM CÙNG 1 HÀNG (Upload ảnh bản thân & Kết quả thử đồ AI) */}
        {/* ========================================================================= */}
        <section className="mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* ---------------------------------------------------- */}
            {/* Ô 1: UPLOAD ẢNH BẢN THÂN LÊN */}
            {/* ---------------------------------------------------- */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-accent/15 text-accent text-xs font-bold">
                    1
                  </span>
                  <h2 className="font-semibold text-base md:text-lg">
                    Ảnh của bạn
                  </h2>
                </div>
                {personPreview && (
                  <button
                    onClick={removeUserPhoto}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 transition-colors"
                  >
                    <X className="size-3.5" /> Xóa ảnh
                  </button>
                )}
              </div>

              {/* Upload Dropzone / Preview */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative flex-1 min-h-[360px] md:min-h-[440px] rounded-xl border-2 transition-all flex flex-col items-center justify-center overflow-hidden ${
                  personPreview
                    ? "border-accent/40 bg-secondary/20"
                    : "border-dashed border-border hover:border-accent/60 bg-secondary/30 hover:bg-secondary/40 cursor-pointer"
                }`}
                onClick={() => {
                  if (!personPreview && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="person-file-input"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleInputChange}
                />

                {personPreview ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2">
                    <img
                      src={personPreview}
                      alt="Ảnh của bạn"
                      className="max-h-[420px] w-full object-contain rounded-lg shadow-sm"
                    />

                    {/* Badge đã sẵn sàng */}
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[0.7rem] font-medium shadow-md backdrop-blur">
                      <CheckCircle2 className="size-3.5" /> Đã sẵn sàng
                    </div>

                    {/* Change photo button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                      className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-background/90 text-foreground text-xs font-semibold shadow-lg hover:bg-background border border-border backdrop-blur transition-all"
                    >
                      <Upload className="size-3.5" /> Đổi ảnh khác
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center max-w-sm">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-secondary text-muted-foreground">
                      <Upload className="size-7" />
                    </div>
                    <p className="text-base font-medium text-foreground">
                      Kéo thả hoặc bấm để tải ảnh lên
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Ảnh chụp rõ mặt, đứng thẳng toàn thân hoặc bán thân.
                      Hỗ trợ JPEG, PNG, WebP (Tối đa 10MB).
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4 text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                    >
                      Chọn từ thiết bị
                    </Button>
                  </div>
                )}
              </div>

              {/* Sample model selector for quick testing */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[0.75rem] font-medium text-muted-foreground mb-2">
                  Hoặc thử nhanh bằng ảnh mẫu có sẵn:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_MODELS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => selectSampleModel(sample)}
                      className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                        personPreview === sample.image
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-foreground/30 bg-background"
                      }`}
                    >
                      <img
                        src={sample.image}
                        alt={sample.name}
                        className="size-8 rounded object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[0.68rem] font-medium truncate">
                          {sample.name}
                        </p>
                        <p className="text-[0.6rem] text-muted-foreground truncate">
                          Chọn mẫu
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* Ô 2: Ô KẾT QUẢ THỬ ĐỒ AI (NẰM CÙNG 1 HÀNG) */}
            {/* ---------------------------------------------------- */}
            <div
              ref={resultCardRef}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    2
                  </span>
                  <h2 className="font-semibold text-base md:text-lg">
                    Kết quả thử đồ AI
                  </h2>
                </div>
                {resultImage && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="size-3.5" /> Hoàn thành
                  </span>
                )}
              </div>

              {/* Result Container */}
              <div className="relative flex-1 min-h-[360px] md:min-h-[440px] rounded-xl border border-border bg-secondary/20 flex flex-col items-center justify-center overflow-hidden">
                {isLoading ? (
                  // Loading state
                  <div className="p-8 text-center max-w-sm flex flex-col items-center">
                    <div className="relative mb-5 grid size-20 place-items-center">
                      <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-ping" />
                      <div className="absolute inset-0 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <Sparkles className="size-8 text-accent animate-pulse" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      AI đang ghép trang phục...
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {loadingStep ||
                        "Vui lòng chờ trong giây lát trong khi AI xử lý..."}
                    </p>
                  </div>
                ) : resultImage ? (
                  // Result image state
                  <div className="relative w-full h-full flex items-center justify-center p-2 group">
                    <img
                      src={resultImage}
                      alt="Kết quả thử đồ"
                      className="max-h-[420px] w-full object-contain rounded-lg shadow-md"
                    />

                    {/* Action buttons over result */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsZoomOpen(true)}
                        className="grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-lg hover:bg-background border border-border transition-colors backdrop-blur"
                        title="Xem phóng to"
                        aria-label="Xem phóng to"
                      >
                        <Maximize2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadResult}
                        className="grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-lg hover:bg-background border border-border transition-colors backdrop-blur"
                        title="Tải ảnh về máy"
                        aria-label="Tải ảnh về máy"
                      >
                        <Download className="size-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background/95 border border-border shadow-xl backdrop-blur">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">
                          {selectedProduct.name}
                        </p>
                        <p className="text-[0.68rem] text-muted-foreground">
                          {selectedProduct.price} • {selectedProduct.tone}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="commerce"
                          className="text-xs h-8 px-3"
                          onClick={() => addToCart(selectedProduct, "M", 1)}
                        >
                          <ShoppingBag className="size-3 mr-1" /> Mua ngay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 px-2.5"
                          onClick={handleStartTryOn}
                          title="Thử lại"
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty state / Ready to try
                  <div className="p-6 text-center max-w-sm flex flex-col items-center">
                    <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-accent/10 text-accent">
                      <Sparkles className="size-8" />
                    </div>

                    {selectedProduct ? (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
                          Sản phẩm đang chọn thử
                        </p>
                        <h3 className="text-base font-semibold text-foreground">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {selectedProduct.price} • {selectedProduct.tone}
                        </p>

                        <div className="my-4 mx-auto size-20 rounded-lg overflow-hidden border border-border shadow-sm">
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="size-full object-cover"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="commerce"
                          className="w-full text-xs font-semibold py-5 shadow-md flex items-center justify-center gap-2"
                          onClick={handleStartTryOn}
                        >
                          <Sparkles className="size-4" /> Thử đồ ngay với AI
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Chưa chọn sản phẩm
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Vui lòng chọn một mẫu từ danh sách sản phẩm ở hàng bên
                          dưới.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected product banner under result */}
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="size-9 rounded-md object-cover border border-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground truncate">
                      {selectedProduct.category} • {selectedProduct.price}
                    </p>
                  </div>
                </div>

                <Link
                  to="/product/$id"
                  params={{ id: selectedProduct.id }}
                  className="inline-flex items-center gap-1 text-[0.72rem] text-accent hover:underline shrink-0"
                >
                  Xem chi tiết <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HÀNG BÊN DƯỚI: TẤT CẢ Ô NHỎ CÁC SẢN PHẨM CÓ TRONG WEB ĐỂ ẤN VÀO CHỌN   */}
        {/* ========================================================================= */}
        <section className="border-t border-border pt-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="grid size-6 place-items-center rounded-full bg-accent/15 text-accent text-xs font-bold">
                  3
                </span>
                <h2 className="font-display text-2xl font-normal">
                  Chọn trang phục bạn muốn thử
                </h2>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ấn vào bất kỳ ô sản phẩm nào dưới đây để chọn mẫu thử lên ô kết
                quả ở hàng trên.
              </p>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid: Compact cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {filteredProducts.map((item) => {
              const isSelected = selectedProduct.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item)}
                  className={`group relative flex flex-col rounded-xl border p-2 text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background bg-accent/5 shadow-md scale-[1.02]"
                      : "border-border bg-card hover:border-foreground/40 hover:shadow-sm"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-secondary">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[0.62rem] font-bold text-accent-foreground shadow">
                        <CheckCircle2 className="size-3" /> Đang chọn
                      </div>
                    )}

                    {/* Category tag */}
                    <div className="absolute bottom-2 left-2 z-10 rounded bg-background/80 px-1.5 py-0.5 text-[0.6rem] font-medium text-foreground backdrop-blur">
                      {item.category}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-2.5 flex-1 flex flex-col justify-between px-0.5">
                    <div>
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.name}
                      </p>
                      <p className="text-[0.65rem] text-muted-foreground truncate">
                        {item.tone}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-border/50">
                      <span className="text-xs font-semibold text-accent">
                        {item.price}
                      </span>
                      <span
                        className={`text-[0.65rem] font-medium px-2 py-0.5 rounded transition-colors ${
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground group-hover:bg-foreground group-hover:text-background"
                        }`}
                      >
                        {isSelected ? "Đã chọn" : "Chọn thử"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Fullscreen Zoom Modal */}
      {isZoomOpen && resultImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-background p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resultImage}
              alt="Phóng to kết quả thử đồ"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
            <div className="mt-3 flex items-center justify-between px-2">
              <div>
                <p className="text-sm font-semibold">{selectedProduct.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedProduct.price} • {selectedProduct.tone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadResult}
                  className="text-xs"
                >
                  <Download className="size-3.5 mr-1" /> Tải về
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsZoomOpen(false)}
                  className="text-xs"
                >
                  <X className="size-4" /> Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card/60 py-6 px-5 text-center text-xs text-muted-foreground">
        <p className="font-medium text-foreground/80">
          Maison de Silk — Trải nghiệm Thời trang Đũi Tơ Tằm Thủ công
        </p>
        <p className="mt-1 text-[0.7rem]">
          Ảnh bạn tải lên chỉ phục vụ phiên thử đồ ảo trực tiếp và hoàn toàn được
          bảo mật.
        </p>
      </footer>
    </div>
  );
}