import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2, Download, Upload, Image as ImageIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { virtualTryOnFn, type TryOnResponse } from "@/lib/virtual-tryon-fn";

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  clothingImageUrl: string;
  productName: string;
}

export function TryOnModal({
  isOpen,
  onClose,
  clothingImageUrl,
  productName,
}: TryOnModalProps) {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cleanup preview URLs on close
  useEffect(() => {
    return () => {
      if (personPreview) URL.revokeObjectURL(personPreview);
    };
  }, [personPreview]);

  const handlePersonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setPersonFile(file);
      setPersonPreview(URL.createObjectURL(file));
    }
  };

  const removePersonImage = () => {
    setPersonFile(null);
    setPersonPreview(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!personFile) {
      setError("Vui lòng tải lên ảnh của bạn (chân dung/toàn thân)");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("personImage", personFile);

      // Fetch clothing image from URL and convert to blob
      const clothingResponse = await fetch(clothingImageUrl);
      if (!clothingResponse.ok) throw new Error("Không thể tải ảnh sản phẩm");
      const clothingBlob = await clothingResponse.blob();
      const clothingFile = new File([clothingBlob], "clothing.jpg", { type: "image/jpeg" });
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
    setPersonPreview(null);
    setResultImage(null);
    setError(null);
    setSuccess(false);
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `try-on-${productName.replace(/\s+/g, "-")}-${Date.now()}.png`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-secondary/30">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-accent">
              <Sparkles className="size-3.5" />
              Thử đồ ảo AI
            </div>
            <h2 className="font-display text-xl sm:text-2xl mt-0.5">
              Thử mặc: {productName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!resultImage ? (
            /* Upload Form */
            <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clothing Image (Preview only) */}
              <div>
                <label className="block text-sm font-semibold mb-3">Trang phục: {productName}</label>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-accent/50 bg-secondary">
                  <img
                    src={clothingImageUrl}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-accent/90 text-accent-foreground px-2 py-0.5 text-[0.65rem] font-medium rounded">
                    <Sparkles className="size-3 inline mr-1" /> Trang phục mẫu
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-center">Ảnh trang phục mẫu (tự động từ sản phẩm)</p>
              </div>

              {/* Person Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-3">Ảnh của bạn (chân dung/toàn thân) <span className="text-destructive">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    id="person-image-modal"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setError(null);
                        setPersonFile(file);
                        setPersonPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <div
                    className={personPreview ? "relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-accent/50" : "relative aspect-[3/4]"}
                    style={{
                      border: "2px dashed",
                      borderColor: "var(--border)",
                      borderRadius: "1rem",
                      padding: "2rem",
                      textAlign: "center",
                      background: "var(--secondary)",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {personPreview ? (
                      <>
                        <img
                          src={personPreview}
                          alt="Ảnh của bạn xem trước"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPersonFile(null);
                            setPersonPreview(null);
                          }}
                          className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-colors shadow-lg"
                          aria-label="Xóa ảnh"
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

              {/* Generate Button - Full width on mobile, right-aligned on lg */}
              <div className="lg:col-span-2 flex justify-end lg:justify-start">
                <button
                  type="submit"
                  disabled={isLoading || !personFile}
                  className="rounded-2xl bg-foreground py-4 px-8 text-base font-semibold uppercase tracking-wider text-background hover:bg-foreground/90 transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
              </div>

              {/* Tips */}
              <div className="lg:col-span-2 rounded-lg border border-border/50 bg-secondary/30 p-4 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Mẹo cho kết quả tốt nhất:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ảnh bạn: Chân dung rõ mặt, ánh sáng tốt, đứng thẳng, nền đơn giản</li>
                  <li>Tránh: Ảnh mờ, góc chụp nghiêng, nhiều người, trang phục che khuất nhiều</li>
                </ul>
              </div>
            </form>
          ) : (
            /* Result Display */
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>Tạo ảnh thành công! Bạn có thể tải về hoặc thử lại.</span>
              </div>

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

              <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 text-xs text-muted-foreground space-y-1 text-center">
                <p className="font-semibold text-foreground">Lưu ý:</p>
                <p>Kết quả chỉ mang tính tham khảo, màu sắc và độ fit thực tế có thể khác biệt tùy ánh sáng và góc chụp.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer - Tips */}
        <div className="border-t border-border px-6 py-4 bg-secondary/30">
          <p className="text-xs text-muted-foreground text-center">
            <User className="inline size-3 mr-1" /> Ảnh của bạn chỉ dùng để tạo ảnh thử đồ, không được lưu trữ trên server.
          </p>
        </div>
      </div>
    </div>
  );
}