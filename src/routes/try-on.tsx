import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, X, Sparkles, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon, Download } from "lucide-react";
import { virtualTryOnFn } from "@/lib/virtual-tryon-fn";

export const Route = createFileRoute("/try-on")({
  head: () => ({
    meta: [
      { title: "Thử đồ ảo AI — Maison de Silk" },
      { name: "description", content: "Thử đồ ảo với AI: upload ảnh người và ảnh trang phục, AI sẽ ghép hình thực tế." },
    ],
  }),
  component: TryOnPage,
});

function TryOnPage() {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [clothingPreview, setClothingPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePersonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
    }
  };

  const handleClothingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setClothingFile(file);
      setClothingPreview(URL.createObjectURL(file));
    }
  };

  const removePersonImage = () => {
    setPersonFile(null);
    setPersonPreview(null);
    URL.revokeObjectURL(personPreview || "");
  };

  const removeClothingImage = () => {
    setClothingFile(null);
    setClothingPreview(null);
    URL.revokeObjectURL(clothingPreview || "");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!personFile || !clothingFile) {
      setError("Vui lòng tải lên cả 2 ảnh: ảnh người và ảnh trang phục");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("personImage", personFile);
      formData.append("clothingImage", clothingFile);

      const response = await virtualTryOnFn({ data: formData });

      if (response.success && response.resultImageUrl) {
        setResultImage(response.resultImageUrl);
        setSuccess(true);
      } else {
        setError(response.error || "Không thể tạo ảnh. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      console.error("Try-on error:", err);
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonFile(null);
    setClothingFile(null);
    setPersonPreview(null);
    setClothingPreview(null);
    setResultImage(null);
    setError(null);
    setSuccess(false);
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `try-on-result-${Date.now()}.png`;
    link.click();
  };

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
          <div className="flex items-center gap-6">
            <a href="/" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              Trang chủ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/products" className="hidden sm:block text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors">
              Cửa hàng
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-accent">
            <Sparkles className="inline size-3.5 mr-1.5" />
            AI Virtual Try-On (Beta)
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-normal">Thử đồ ảo</h1>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Tải lên ảnh chân dung của bạn và ảnh trang phục — AI sẽ ghép hình bạn mặc trang phục đó một cách thực tế.
          </p>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>Tạo ảnh thành công! Bạn có thể tải về hoặc thử lại với ảnh khác.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive animate-in fade-in">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Upload Areas - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Person Image */}
            <div>
              <label className="block text-sm font-semibold mb-3">Ảnh người (chân dung/toàn thân)</label>
              <div className="relative">
                <input
                  type="file"
                  id="person-image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePersonFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <div
                  className={personPreview ? "relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-accent/50" : "relative aspect-[3/4]"}
                  style={uploadZoneStyle}
                >
                  {personPreview ? (
                    <>
                      <img
                        src={personPreview}
                        alt="Ảnh người xem trước"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removePersonImage}
                        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors shadow-lg"
                        aria-label="Xóa ảnh người"
                      >
                        <X className="size-4" />
                      </button>
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
            </div>

            {/* Clothing Image */}
            <div>
              <label className="block text-sm font-semibold mb-3">Ảnh trang phục (áo/quần/đầm...)</label>
              <div className="relative">
                <input
                  type="file"
                  id="clothing-image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleClothingFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <div
                  className={clothingPreview ? "relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-accent/50" : "relative aspect-[3/4]"}
                  style={uploadZoneStyle}
                >
                  {clothingPreview ? (
                    <>
                      <img
                        src={clothingPreview}
                        alt="Ảnh trang phục xem trước"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeClothingImage}
                        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors shadow-lg"
                        aria-label="Xóa ảnh trang phục"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto size-10 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để chọn ảnh</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP • Tối đa 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isLoading || !personFile || !clothingFile}
            className="w-full lg:w-1/2 mx-auto lg:mx-0 lg:ml-auto rounded-2xl bg-foreground py-4 px-8 text-base font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Đang tạo ảnh...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                <span>Tạo ảnh thử đồ</span>
              </>
            )}
          </button>

          {/* Tips */}
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Mẹo cho kết quả tốt nhất:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ảnh người: Chân dung rõ mặt, ánh sáng tốt, đứng thẳng, nền đơn giản</li>
              <li>Ảnh trang phục: Ảnh sản phẩm phẳng (lay flat) hoặc mannequin, nền trắng/trong suốt</li>
              <li>Tránh: Ảnh mờ, góc chụp nghiêng quá nhiều, trang phục che khuất nhiều, nhiều người trong ảnh</li>
            </ul>
          </div>
        </form>

        {/* Result Area */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4 text-center">Kết quả</h2>
          {resultImage ? (
            <div className="relative aspect-[3/4] max-w-xl mx-auto rounded-2xl overflow-hidden border border-border shadow-xl animate-in zoom-in-95">
              <img
                src={resultImage}
                alt="Kết quả thử đồ ảo"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={downloadResult}
                  className="grid size-10 place-items-center rounded-full bg-background/95 text-foreground shadow-lg hover:bg-background backdrop-blur transition-colors"
                  aria-label="Tải ảnh kết quả"
                >
                  <Download className="size-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="grid size-10 place-items-center rounded-full bg-background/95 text-foreground shadow-lg hover:bg-background backdrop-blur transition-colors"
                  aria-label="Thử lại"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="aspect-[3/4] max-w-xl mx-auto rounded-2xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-4 bg-secondary/20">
              <ImageIcon className="size-16 text-muted-foreground/50" />
              <p className="text-muted-foreground">Ảnh kết quả sẽ hiển thị ở đây sau khi tạo thành công</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-border bg-background/50 py-6 px-5 text-center text-xs text-muted-foreground">
        <p>Beta feature • Powered by Google Gemini 2.5 Flash Image (Nano Banana)</p>
        <p className="mt-1">Ảnh được xử lý tạm thời, không được lưu trữ vĩnh viễn trên server</p>
      </footer>
    </div>
  );
}