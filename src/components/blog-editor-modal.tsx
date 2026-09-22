import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogPost } from "@/data/blogs";
import silkDetail from "@/assets/silk-detail.jpg";
import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";

interface BlogEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (postData: Partial<BlogPost>) => void;
  initialData?: BlogPost | null;
  currentUser?: { name: string; email: string; id: number } | null;
}

const PRESET_IMAGES = [
  { label: "Vải đũi mộc", url: silkDetail },
  { label: "Sắc ngà nguyên bản", url: ivory },
  { label: "Màu than tre", url: charcoal },
  { label: "Sắc rêu lá dâu", url: green },
];

const CATEGORIES: BlogPost["category"][] = [
  "Nghề thủ công",
  "Phong cách sống",
  "Chuyện làng nghề",
  "Chăm sóc vải",
  "Bộ sưu tập",
];

export function BlogEditorModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  currentUser,
}: BlogEditorModalProps) {
  const isEditing = !!initialData;

  // Kiểm tra người dùng phải đăng nhập
  useEffect(() => {
    if (isOpen && !currentUser) {
      // Nếu không có user, không cho mở modal
      onClose();
    }
  }, [isOpen, currentUser, onClose]);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState<BlogPost["category"]>("Phong cách sống");
  const [image, setImage] = useState(silkDetail);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [readTime, setReadTime] = useState("5 phút đọc");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSubtitle(initialData.subtitle || "");
      setCategory(initialData.category);
      setImage(initialData.image);
      setExcerpt(initialData.excerpt);
      setContentBody(initialData.content.join("\n\n"));
      setQuoteText(initialData.quote?.text || "");
      setQuoteAuthor(initialData.quote?.author || "");
      setTagsInput(initialData.tags.join(", "));
      setReadTime(initialData.readTime || "5 phút đọc");
      const isPreset = PRESET_IMAGES.some((p) => p.url === initialData.image);
      if (!isPreset && initialData.image) {
        setUseCustomImage(true);
        setCustomImageUrl(initialData.image);
      } else {
        setUseCustomImage(false);
        setCustomImageUrl("");
      }
    } else {
      // Reset default form
      setTitle("");
      setSubtitle("");
      setCategory("Phong cách sống");
      setImage(silkDetail);
      setCustomImageUrl("");
      setUseCustomImage(false);
      setExcerpt("");
      setContentBody("");
      setQuoteText("");
      setQuoteAuthor("");
      setTagsInput("Đũi tơ tằm, Phong cách sống, Trải nghiệm");
      setReadTime("4 phút đọc");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Không cho phép mở modal nếu chưa đăng nhập
  if (!currentUser) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra đăng nhập trước khi submit
    if (!currentUser) {
      setError("Bạn cần đăng nhập để đăng bài viết.");
      return;
    }

    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!excerpt.trim()) {
      setError("Vui lòng nhập tóm tắt ngắn cho bài viết.");
      return;
    }
    if (!contentBody.trim()) {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    // Phân tách nội dung thành các đoạn văn
    const paragraphs = contentBody
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const finalImage = useCustomImage && customImageUrl.trim() ? customImageUrl.trim() : image;

    const postPayload: Partial<BlogPost> = {
      title: title.trim(),
      subtitle: subtitle.trim() || `Chia sẻ từ cộng đồng Maison de Silk`,
      category,
      image: finalImage,
      excerpt: excerpt.trim(),
      content: paragraphs.length > 0 ? paragraphs : [contentBody.trim()],
      readTime: readTime.trim() || "4 phút đọc",
      tags: tags.length > 0 ? tags : ["Cộng đồng", "Tơ lụa"],
      quote:
        quoteText.trim()
          ? {
              text: quoteText.trim(),
              author: quoteAuthor.trim() || (currentUser?.name || "Tác giả bài viết"),
            }
          : undefined,
    };

    onSave(postPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-secondary/30">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-accent">
              <Sparkles className="size-3.5" />
              {isEditing ? "Chỉnh sửa bài viết" : "Đăng bài Blog cộng đồng mới"}
            </div>
            <h2 className="font-display text-xl sm:text-2xl mt-0.5">
              {isEditing ? "Cập nhật bài viết cá nhân" : "Chia sẻ câu chuyện của bạn"}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Author notice */}
          <div className="rounded border border-border/80 bg-secondary/20 p-3 text-xs flex items-center justify-between">
            <div>
              <span className="text-muted-foreground">Tác giả đăng bài: </span>
              <strong className="text-foreground">{currentUser?.name || "Thành viên Khách"}</strong>
              {currentUser?.email && (
                <span className="text-muted-foreground ml-1.5">({currentUser.email})</span>
              )}
            </div>
            <span className="rounded bg-accent/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-accent">
              Bài viết cá nhân
            </span>
          </div>

          {/* Tiêu đề & Phụ đề */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
                Tiêu đề bài viết <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Cảm xúc khi mặc tà áo đũi tơ tằm dạo phố mùa thu..."
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
                Phụ đề / Câu dẫn (Subtitle)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ví dụ: Vẻ đẹp mộc mạc làm dịu đi những tất bật của đời sống đô thị"
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Chuyên mục & Thời gian đọc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
                Chuyên mục <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogPost["category"])}
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
                Thời gian đọc ước tính
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="Ví dụ: 4 phút đọc"
                className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Chọn ảnh bìa */}
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-2">
              Ảnh bìa bài viết <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setImage(preset.url);
                    setUseCustomImage(false);
                  }}
                  className={`group relative aspect-[16/10] overflow-hidden border rounded text-left transition-all ${
                    !useCustomImage && image === preset.url
                      ? "border-accent ring-2 ring-accent ring-offset-2 ring-offset-background"
                      : "border-border hover:border-foreground/40 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center">
                    <span className="text-[0.65rem] text-white font-medium">{preset.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom image URL toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={useCustomImage}
                  onChange={(e) => setUseCustomImage(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>Hoặc dán URL hình ảnh tuỳ chỉnh từ internet</span>
              </label>

              {useCustomImage && (
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/anh-to-tam.jpg"
                  className="w-full border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-accent transition-colors"
                />
              )}
            </div>
          </div>

          {/* Tóm tắt ngắn (Excerpt) */}
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
              Tóm tắt bài viết (Excerpt) <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Một đoạn mô tả ngắn gọn 2-3 câu giới thiệu nội dung để hiển thị trên danh sách bài viết..."
              className="w-full border border-border bg-background p-3 text-sm outline-none focus:border-accent transition-colors resize-none"
              required
            />
          </div>

          {/* Nội dung bài viết (Content Body) */}
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
              Nội dung chi tiết <span className="text-destructive">*</span>
            </label>
            <p className="text-[0.7rem] text-muted-foreground mb-2">
              Mẹo: Nhấn Enter 2 lần để tách đoạn văn mới. Bài viết sẽ được định dạng đẹp mắt như trang sách.
            </p>
            <textarea
              rows={7}
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              placeholder="Viết nội dung bài viết của bạn tại đây...&#10;&#10;Đoạn văn thứ hai về cảm xúc, chất liệu, địa điểm hoặc bí quyết chăm sóc vải..."
              className="w-full border border-border bg-background p-3.5 text-sm outline-none focus:border-accent transition-colors resize-y leading-relaxed font-serif"
              required
            />
          </div>

          {/* Trích dẫn nổi bật (Tùy chọn) */}
          <div className="border border-border/70 bg-secondary/15 p-4 rounded space-y-3">
            <span className="text-xs uppercase tracking-[0.15em] font-semibold text-muted-foreground block">
              Trích dẫn nổi bật (Tuỳ chọn)
            </span>
            <input
              type="text"
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              placeholder='Câu danh ngôn hoặc trích dẫn tâm đắc (ví dụ: "Tấm áo đũi đẹp nhất khi nó đồng hành cùng nụ cười người mặc")'
              className="w-full border border-border bg-background px-3 py-2 text-xs outline-none focus:border-accent"
            />
            <input
              type="text"
              value={quoteAuthor}
              onChange={(e) => setQuoteAuthor(e.target.value)}
              placeholder="Tác giả câu trích dẫn (ví dụ: Tác giả, Nghệ nhân, hoặc Tự sự cá nhân)"
              className="w-full border border-border bg-background px-3 py-2 text-xs outline-none focus:border-accent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] font-semibold text-foreground mb-1.5">
              Gắn thẻ (Tags, phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Đũi tơ tằm, Phong cách sống, Áo dài, Chăm sóc vải"
              className="w-full border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="quiet" onClick={onClose}>
              Huỷ bỏ
            </Button>
            <Button type="submit" variant="commerce">
              {isEditing ? "Lưu thay đổi bài viết" : "Xuất bản bài viết ngay"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
