import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Edit3,
  Heart,
  PenSquare,
  Plus,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import {
  BlogPost,
  BLOG_POSTS,
  getStoredBlogs,
  saveStoredBlogs,
} from "@/data/blogs";
import { BlogEditorModal } from "@/components/blog-editor-modal";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";

export const Route = createFileRoute("/blog")({
  validateSearch: (search: Record<string, unknown>): { id?: string | undefined; category?: string | undefined } => ({
    id: (search["id"] as string) || undefined,
    category: (search["category"] as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Maison Journal — Cộng Đồng Blog Tơ Lụa" },
      {
        name: "description",
        content:
          "Không gian cộng đồng thu nhỏ: nơi các thành viên tự do chia sẻ, chỉnh sửa và đăng tải các bài viết về đũi tơ tằm, kỹ thuật thủ công và phong cách sống.",
      },
    ],
  }),
  component: BlogPage,
});

export default function BlogPage() {
  const searchParams = Route.useSearch();
  const { totalCount, openCart } = useCart();
  const { user, openAuthModal } = useAuth();

  // Blogs State từ localStorage
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOG_POSTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Tab filter: 'all' | 'my_posts'
  const [viewScope, setViewScope] = useState<"all" | "my_posts">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.category || "Tất cả"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  // Likes & Comments
  const [blogLikes, setBlogLikes] = useState<Record<string, number>>(() =>
    BLOG_POSTS.reduce((acc, p) => ({ ...acc, [p.id]: p.likes }), {})
  );
  const [userLikedBlogs, setUserLikedBlogs] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const [notice, setNotice] = useState("");

  // Load blogs on mount
  useEffect(() => {
    const data = getStoredBlogs();
    if (data && data.length > 0) {
      setBlogs(data);
      setBlogLikes(data.reduce((acc, p) => ({ ...acc, [p.id]: p.likes }), {}));
    }

    if (searchParams.id) {
      const list = data && data.length > 0 ? data : BLOG_POSTS;
      const target = list.find((p) => p.id === searchParams.id || p.slug === searchParams.id);
      if (target) setSelectedPost(target);
    }
    setIsLoaded(true);
  }, [searchParams.id]);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2800);
  };

  // Kiểm tra bài viết có thuộc quyền sở hữu của user hiện tại không
  const isPostOwner = (post: BlogPost): boolean => {
    if (post.isUserPost) return true;
    if (user) {
      if (post.author.email && post.author.email === user.email) return true;
      if (post.author.id && String(post.author.id) === String(user.id)) return true;
    }
    return false;
  };

  // Thêm / Cập nhật bài viết
  const handleSavePost = (payload: Partial<BlogPost>) => {
    // Kiểm tra đăng nhập
    if (!user) {
      triggerNotice("⚠️ Bạn cần đăng nhập để tạo hoặc chỉnh sửa bài viết!");
      openAuthModal("login");
      setIsEditorOpen(false);
      return;
    }

    if (editingPost) {
      // Kiểm tra quyền sở hữu bài viết khi sửa
      if (!isPostOwner(editingPost)) {
        triggerNotice("⛔ Bạn không có quyền chỉnh sửa bài viết này!");
        setIsEditorOpen(false);
        setEditingPost(null);
        return;
      }

      // Chế độ Sửa bài
      const updatedBlogs = blogs.map((b) => {
        if (b.id === editingPost.id) {
          return {
            ...b,
            ...payload,
            author: b.author, // giữ thông tin tác giả ban đầu
          } as BlogPost;
        }
        return b;
      });

      setBlogs(updatedBlogs);
      saveStoredBlogs(updatedBlogs);

      if (selectedPost && selectedPost.id === editingPost.id) {
        setSelectedPost((prev) => (prev ? ({ ...prev, ...payload } as BlogPost) : null));
      }

      setEditingPost(null);
      triggerNotice("Đã cập nhật bài viết thành công!");
    } else {
      // Chế độ Thêm bài viết mới
      const newId = `post-${Date.now()}`;
      const newSlug = payload.title
        ? payload.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        : `bai-viet-${Date.now()}`;

      const authorName = user?.name || "Bạn đọc Maison";
      const authorRole = "Thành viên cộng đồng";
      const authorAvatar = authorName.slice(0, 2).toUpperCase();

      const newBlogPost: BlogPost = {
        id: newId,
        slug: `${newSlug}-${newId.slice(-4)}`,
        title: payload.title || "Bài viết mới",
        subtitle: payload.subtitle || "Chia sẻ từ cộng đồng",
        excerpt: payload.excerpt || "",
        content: payload.content || [""],
        category: payload.category || "Phong cách sống",
        author: {
          name: authorName,
          role: authorRole,
          avatar: authorAvatar,
          id: user?.id,
          email: user?.email,
        },
        publishedAt: "Hôm nay",
        readTime: payload.readTime || "4 phút đọc",
        image: payload.image || "",
        tags: payload.tags || ["Cộng đồng"],
        likes: 0,
        isUserPost: true,
        quote: payload.quote,
        comments: [],
      };

      const updatedBlogs = [newBlogPost, ...blogs];
      setBlogs(updatedBlogs);
      saveStoredBlogs(updatedBlogs);

      triggerNotice("Xuất bản bài viết thành công lên Màn Blog!");
    }
  };

  // Xóa bài viết
  const handleDeletePost = () => {
    if (!deleteTarget) return;
    
    // Kiểm tra quyền sở hữu bài viết khi xóa
    if (!user) {
      triggerNotice("⚠️ Bạn cần đăng nhập để xóa bài viết!");
      setDeleteTarget(null);
      openAuthModal("login");
      return;
    }

    if (!isPostOwner(deleteTarget)) {
      triggerNotice("⛔ Bạn không có quyền xóa bài viết này!");
      setDeleteTarget(null);
      return;
    }

    const updatedBlogs = blogs.filter((b) => b.id !== deleteTarget.id);
    setBlogs(updatedBlogs);
    saveStoredBlogs(updatedBlogs);

    if (selectedPost && selectedPost.id === deleteTarget.id) {
      setSelectedPost(null);
    }
    setDeleteTarget(null);
    triggerNotice("Đã xoá bài viết khỏi cộng đồng!");
  };

  // Like bài viết
  const handleLikeBlog = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Kiểm tra đăng nhập trước khi like
    if (!user) {
      triggerNotice("⚠️ Đăng nhập để thích bài viết!");
      openAuthModal("login");
      return;
    }

    const hasLiked = userLikedBlogs[id];
    setUserLikedBlogs((prev) => ({ ...prev, [id]: !hasLiked }));
    setBlogLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (hasLiked ? -1 : 1),
    }));
  };

  // Submit comment
  const handleBlogCommentSubmit = (postId: string) => {
    // Kiểm tra đăng nhập trước khi comment
    if (!user) {
      triggerNotice("⚠️ Đăng nhập để bình luận!");
      openAuthModal("login");
      return;
    }

    if (!newComment.trim()) return;
    const authorName = user ? user.name : "Bạn đọc mến yêu";
    const newEntry = {
      id: `cmt-${Date.now()}`,
      author: authorName,
      text: newComment.trim(),
      time: "Vừa xong",
    };

    const updatedBlogs = blogs.map((b) => {
      if (b.id === postId) {
        return {
          ...b,
          comments: [...(b.comments || []), newEntry],
        };
      }
      return b;
    });

    setBlogs(updatedBlogs);
    saveStoredBlogs(updatedBlogs);

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), newEntry] } : null
      );
    }

    setNewComment("");
    triggerNotice("Đã đăng bình luận!");
  };

  const categories = [
    "Tất cả",
    "Nghề thủ công",
    "Phong cách sống",
    "Chuyện làng nghề",
    "Chăm sóc vải",
    "Bộ sưu tập",
  ];

  // Lọc bài viết theo Scope (Tất cả / Của tôi) + Chuyên mục + Tìm kiếm
  const filteredBlogs = blogs.filter((post) => {
    if (viewScope === "my_posts" && !isPostOwner(post)) {
      return false;
    }
    const matchCat =
      selectedCategory === "Tất cả" || post.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const myPostsCount = blogs.filter(isPostOwner).length;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-6">
            <Link
              to="/community"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Quay lại Community
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Link
              to="/"
              className="text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
            >
              Trang chủ
            </Link>
          </div>

          <BrandLogo size="md" />

          <div className="flex items-center gap-3">
            {/* Nút Viết bài mới - Chỉ hiển thị khi đã đăng nhập */}
            {user ? (
              <Button
                variant="commerce"
                size="sm"
                onClick={() => {
                  setEditingPost(null);
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs shadow-sm"
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Viết bài mới</span>
                <span className="sm:hidden">Đăng bài</span>
              </Button>
            ) : (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-1.5 text-xs"
              >
                <User className="size-3.5" />
                <span className="hidden sm:inline">Đăng nhập để viết bài</span>
                <span className="sm:hidden">Đăng nhập</span>
              </Button>
            )}

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

      {/* Hero Banner Màn Blog */}
      <section className="relative border-b border-border bg-primary text-primary-foreground py-14 md:py-20">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">
                <BookOpen className="size-4" />
                Cộng Đồng Blog Thu Nhỏ
              </div>
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl leading-tight">
                Màn Blog Tơ Lụa
                <br />
                <span className="font-serif italic font-normal opacity-90 text-2xl sm:text-4xl">
                  Góc Chia Sẻ &amp; Đăng Tải Cá Nhân
                </span>
              </h1>
              <p className="mt-3 max-w-xl text-sm md:text-base text-primary-foreground/75 leading-relaxed">
                Mỗi thành viên đều là một tác giả. Tự do viết bài, chia sẻ trải nghiệm, chỉnh sửa và quản lý các bài viết của riêng bạn trong không gian di sản Maison de Silk.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => {
                    setEditingPost(null);
                    setIsEditorOpen(true);
                  }}
                  className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all flex items-center gap-2"
                >
                  <PenSquare className="size-4" />
                  Viết bài Blog của bạn
                </Button>
              ) : (
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => openAuthModal("login")}
                  className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all flex items-center gap-2"
                >
                  <User className="size-4" />
                  Đăng nhập để viết bài
                </Button>
              )}
              <Link
                to="/community"
                className="inline-flex items-center gap-2 rounded border border-primary-foreground/30 bg-primary-foreground/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary-foreground/15 transition-colors"
              >
                <Users className="size-4" />
                Vào Community Feed
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-[1440px] px-5 py-10 md:px-10">
        {selectedPost ? (
          /* ========================================================================= */
          /* CHẾ ĐỘ ĐỌC CHI TIẾT BÀI VIẾT                                             */
          /* ========================================================================= */
          <article className="max-w-4xl mx-auto animate-in fade-in duration-200">
            {/* Top Bar Trong Bài Viết */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <button
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-4" /> Danh sách bài viết
              </button>

              {/* Nút Sửa / Xoá nếu là bài của User */}
              <div className="flex items-center gap-3">
                {isPostOwner(selectedPost) && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => {
                        setEditingPost(selectedPost);
                        setIsEditorOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-xs text-foreground"
                    >
                      <Edit3 className="size-3.5" /> Sửa bài viết
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(selectedPost)}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <Trash2 className="size-3.5" /> Xoá bài
                    </Button>
                  </div>
                )}
                <span className="text-xs uppercase tracking-[0.15em] text-accent font-semibold ml-2">
                  {selectedPost.category}
                </span>
              </div>
            </div>

            {/* Post Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> {selectedPost.publishedAt}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> {selectedPost.readTime}
                </span>
                {isPostOwner(selectedPost) && (
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-[0.65rem] font-bold text-accent uppercase">
                    Bài viết của tôi
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-5xl leading-tight">
                {selectedPost.title}
              </h1>

              {selectedPost.subtitle && (
                <p className="text-base sm:text-lg text-muted-foreground font-serif italic">
                  "{selectedPost.subtitle}"
                </p>
              )}

              {/* Author & Interactions Bar */}
              <div className="flex items-center justify-between border-y border-border py-4 my-6">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-full bg-foreground text-background font-bold text-sm">
                    {selectedPost.author.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {selectedPost.author.name}
                      {isPostOwner(selectedPost) && (
                        <span className="text-[0.65rem] text-accent font-normal">(Bạn)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedPost.author.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLikeBlog(selectedPost.id)}
                    className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs rounded transition-colors ${
                      userLikedBlogs[selectedPost.id]
                        ? "border-red-500 bg-red-500/10 text-red-500"
                        : "border-border hover:border-foreground/40"
                    }`}
                  >
                    <Heart
                      className="size-3.5"
                      fill={userLikedBlogs[selectedPost.id] ? "currentColor" : "none"}
                    />
                    <span>{blogLikes[selectedPost.id] || 0}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      triggerNotice("Đã sao chép liên kết!");
                    }}
                    className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs rounded hover:border-foreground/40 transition-colors"
                  >
                    <Share2 className="size-3.5" /> Chia sẻ
                  </button>
                </div>
              </div>
            </div>

            {/* Image */}
            {selectedPost.image && (
              <div className="my-8 aspect-[16/9] w-full overflow-hidden border border-border bg-secondary shadow-lg">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {selectedPost.excerpt && (
              <p className="text-lg leading-relaxed font-serif text-foreground/90 border-l-2 border-accent pl-5 my-8">
                {selectedPost.excerpt}
              </p>
            )}

            {/* Body Content */}
            <div className="space-y-6 text-foreground/80 leading-loose text-base font-serif">
              {selectedPost.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Quote */}
            {selectedPost.quote && selectedPost.quote.text && (
              <figure className="my-10 border-y border-border py-8 text-center px-4 bg-secondary/20">
                <blockquote className="font-display text-xl md:text-2xl text-foreground italic leading-snug">
                  "{selectedPost.quote.text}"
                </blockquote>
                <figcaption className="mt-4 text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                  — {selectedPost.quote.author}
                </figcaption>
              </figure>
            )}

            {/* Tags */}
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {selectedPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-secondary px-3 py-1 text-xs text-muted-foreground font-medium rounded-full"
                >
                  <Tag className="size-3" /> #{tag}
                </span>
              ))}
            </div>

            {/* Comment Section */}
            <div className="mt-12 border-t border-border pt-10">
              <h3 className="font-display text-2xl mb-6">
                Bình luận ({selectedPost.comments?.length || 0})
              </h3>
              <div className="mb-8 flex gap-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBlogCommentSubmit(selectedPost.id);
                  }}
                  placeholder="Để lại bình luận hoặc cảm nhận của bạn..."
                  className="flex-1 border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                />
                <Button
                  variant="commerce"
                  onClick={() => handleBlogCommentSubmit(selectedPost.id)}
                >
                  Gửi
                </Button>
              </div>

              <div className="space-y-4">
                {(selectedPost.comments || []).map((cmt) => (
                  <div key={cmt.id} className="border border-border/80 bg-secondary/30 p-4 rounded">
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-xs uppercase tracking-[0.1em] font-semibold text-foreground">
                        {cmt.author}
                      </strong>
                      <span className="text-[0.7rem] text-muted-foreground">{cmt.time}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{cmt.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ) : (
          /* ========================================================================= */
          /* DANH SÁCH BÀI VIẾT BLOG                                                  */
          /* ========================================================================= */
          <div className="space-y-8">
            {/* Top Toolbar: Chuyển Tab (Tất cả vs Bài viết của tôi) + Tìm kiếm */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-border pb-6">
              {/* Tab Scope */}
              <div className="flex items-center gap-2 p-1 bg-secondary/60 rounded-lg border border-border w-fit">
                <button
                  onClick={() => setViewScope("all")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-md transition-all ${
                    viewScope === "all"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả bài viết ({blogs.length})
                </button>
                <button
                  onClick={() => setViewScope("my_posts")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-md transition-all flex items-center gap-1.5 ${
                    viewScope === "my_posts"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="size-3.5" />
                  Bài viết của tôi ({myPostsCount})
                </button>
              </div>

              {/* Nút Đăng bài nhanh & Ô tìm kiếm */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {user ? (
                  <Button
                    variant="commerce"
                    size="sm"
                    onClick={() => {
                      setEditingPost(null);
                      setIsEditorOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
                  >
                    <Plus className="size-4" /> Viết bài mới
                  </Button>
                ) : (
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => openAuthModal("login")}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
                  >
                    <User className="size-4" /> Đăng nhập để viết
                  </Button>
                )}

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tiêu đề, tác giả, tag..."
                    className="w-full border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-foreground/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3.5 py-1.5 text-[0.72rem] uppercase tracking-[0.12em] font-semibold transition-all rounded-full ${
                    selectedCategory === cat
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Thông báo nếu đang ở tab Bài viết của tôi */}
            {viewScope === "my_posts" && (
              <div className="flex items-center justify-between bg-accent/10 border border-accent/30 p-4 rounded-md text-xs">
                <div className="flex items-center gap-2.5 text-accent font-medium">
                  <Sparkles className="size-4 shrink-0" />
                  <span>
                    Bạn đang xem danh sách các bài viết do cá nhân bạn sở hữu. Bạn có toàn quyền <strong>Thêm</strong>, <strong>Chỉnh sửa</strong> và <strong>Xoá</strong> các bài viết này.
                  </span>
                </div>
              </div>
            )}

            {/* Grid bài viết */}
            {filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBlogs.map((post) => {
                  const isOwner = isPostOwner(post);
                  return (
                    <article
                      key={post.id}
                      className="group flex flex-col border border-border bg-background overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-xl relative"
                    >
                      {/* Image Click to View */}
                      <div
                        onClick={() => setSelectedPost(post)}
                        className="relative aspect-[16/10] overflow-hidden bg-secondary cursor-pointer"
                      >
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center bg-secondary text-muted-foreground">
                            <BookOpen className="size-10 opacity-40" />
                          </div>
                        )}

                        <span className="absolute left-3 top-3 bg-background/90 backdrop-blur-md px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground border border-border">
                          {post.category}
                        </span>

                        {isOwner && (
                          <span className="absolute right-3 top-3 bg-accent text-accent-foreground px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] rounded shadow">
                            Của tôi
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col justify-between p-6">
                        <div onClick={() => setSelectedPost(post)} className="cursor-pointer">
                          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground mb-2">
                            <Calendar className="size-3" />
                            {post.publishedAt}
                            <span>•</span>
                            <Clock className="size-3" />
                            {post.readTime}
                          </div>
                          <h3 className="font-display text-xl leading-snug group-hover:text-accent transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Author + Actions Footer */}
                        <div className="mt-6 border-t border-border pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="grid size-7 place-items-center rounded-full bg-secondary text-xs font-bold text-foreground">
                              {post.author.avatar}
                            </div>
                            <span className="text-xs font-medium text-foreground truncate max-w-[110px]">
                              {post.author.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Nút Sửa / Xoá nếu là Owner */}
                            {isOwner ? (
                              <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded border border-border">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPost(post);
                                    setIsEditorOpen(true);
                                  }}
                                  title="Chỉnh sửa bài viết"
                                  className="p-1 hover:text-accent text-muted-foreground transition-colors"
                                >
                                  <Edit3 className="size-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget(post);
                                  }}
                                  title="Xoá bài viết"
                                  className="p-1 hover:text-destructive text-muted-foreground transition-colors"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            ) : null}

                            <button
                              onClick={(e) => handleLikeBlog(post.id, e)}
                              className={`flex items-center gap-1 text-xs transition-colors hover:text-red-500 ${
                                userLikedBlogs[post.id] ? "text-red-500 font-bold" : "text-muted-foreground"
                              }`}
                            >
                              <Heart
                                className="size-3.5"
                                fill={userLikedBlogs[post.id] ? "currentColor" : "none"}
                              />
                              <span>{blogLikes[post.id] || 0}</span>
                            </button>
                            <span
                              onClick={() => setSelectedPost(post)}
                              className="text-xs font-semibold uppercase tracking-[0.1em] text-accent group-hover:underline cursor-pointer ml-1"
                            >
                              Đọc →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 border border-dashed border-border rounded-lg max-w-lg mx-auto">
                <BookOpen className="size-12 mx-auto text-muted-foreground/40 mb-4" />
                <h4 className="font-display text-xl text-foreground">
                  {viewScope === "my_posts"
                    ? "Bạn chưa có bài viết cá nhân nào"
                    : "Không tìm thấy bài viết phù hợp"}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 px-6">
                  {viewScope === "my_posts"
                    ? "Hãy bắt đầu tạo bài viết đầu tiên để chia sẻ phong cách, kiến thức hoặc trải nghiệm về đũi tơ tằm với mọi người!"
                    : "Hãy thử thay đổi từ khoá tìm kiếm hoặc chọn danh mục khác."}
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  {user ? (
                    <Button
                      variant="commerce"
                      size="sm"
                      onClick={() => {
                        setEditingPost(null);
                        setIsEditorOpen(true);
                      }}
                    >
                      <Plus className="size-4 mr-1.5" /> Viết bài ngay
                    </Button>
                  ) : (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => openAuthModal("login")}
                    >
                      <User className="size-4 mr-1.5" /> Đăng nhập để viết bài
                    </Button>
                  )}
                  {viewScope === "my_posts" && (
                    <Button variant="quiet" size="sm" onClick={() => setViewScope("all")}>
                      Xem tất cả bài viết
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-primary px-5 py-10 text-primary-foreground md:px-10 border-t border-border text-xs">
        <div className="mx-auto flex max-w-[1440px] flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span className="text-primary-foreground/60">
              © 2026 Maison de Silk · Cộng Đồng Blog Tơ Lụa &amp; Sáng Tạo Cá Nhân
            </span>
          </div>
          <div className="flex items-center gap-6 text-primary-foreground/70">
            <Link to="/community" className="hover:text-primary-foreground hover:underline">
              Cộng đồng Community
            </Link>
            <Link to="/products" className="hover:text-primary-foreground hover:underline">
              Sản phẩm
            </Link>
            <Link to="/" className="hover:text-primary-foreground hover:underline">
              Trang chủ
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal Soạn thảo bài viết (Thêm / Sửa) */}
      <BlogEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        initialData={editingPost}
        currentUser={user}
      />

      {/* Modal Xác nhận xoá bài viết */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePost}
      />

      {/* Toast Notice */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-foreground text-background px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {notice}
        </div>
      )}
    </main>
  );
}
