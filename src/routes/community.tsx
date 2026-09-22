import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Edit3,
  Heart,
  ThumbsDown,
  Image as ImageIcon,
  MessageCircle,
  PenSquare,
  Plus,
  Search,
  Send,
  Share2,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import {
  BlogPost,
  BLOG_POSTS,
  COMMUNITY_DISCUSSIONS,
  getStoredBlogs,
  saveStoredBlogs,
} from "@/data/blogs";
import { BlogEditorModal } from "@/components/blog-editor-modal";
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal";

export const Route = createFileRoute("/community")({
  validateSearch: (search: Record<string, unknown>): { tab?: string | undefined } => ({
    tab: (search["tab"] as string) || "feed",
  }),
  head: () => ({
    meta: [
      { title: "Cộng đồng — Maison de Silk" },
      {
        name: "description",
        content:
          "Cộng đồng thu nhỏ kết nối những người yêu đũi tơ tằm Việt Nam: tự do viết bài, chia sẻ, chỉnh sửa và thảo luận các chuyên đề thủ công, phong cách sống.",
      },
    ],
  }),
  component: CommunityPage,
});

export default function CommunityPage() {
  const searchParams = Route.useSearch();
  const { totalCount, openCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab: 'feed' (Cộng đồng thảo luận) | 'blog' (Màn Blog)
  const [currentTab, setCurrentTab] = useState<"feed" | "blog">(
    searchParams.tab === "blog" ? "blog" : "feed"
  );

  // Blogs State từ localStorage
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOG_POSTS);
  const [blogScope, setBlogScope] = useState<"all" | "my_posts">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [blogSearch, setBlogSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  // Community Feed State
  const [discussions, setDiscussions] = useState(COMMUNITY_DISCUSSIONS);
  const [postContent, setPostContent] = useState("");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [dislikedPosts, setDislikedPosts] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  // Likes & Comments
  const [blogLikes, setBlogLikes] = useState<Record<string, number>>(() =>
    BLOG_POSTS.reduce((acc, p) => ({ ...acc, [p.id]: p.likes }), {})
  );
  const [userLikedBlogs, setUserLikedBlogs] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const data = getStoredBlogs();
    if (data && data.length > 0) {
      setBlogs(data);
      setBlogLikes(data.reduce((acc, p) => ({ ...acc, [p.id]: p.likes }), {}));
    }
  }, []);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const isPostOwner = (post: BlogPost): boolean => {
    if (post.isUserPost) return true;
    if (user) {
      if (post.author.email && post.author.email === user.email) return true;
      if (post.author.id && String(post.author.id) === String(user.id)) return true;
    }
    return false;
  };

  // Thêm / Sửa bài viết
  const handleSavePost = (payload: Partial<BlogPost>) => {
    // Kiểm tra đăng nhập
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
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

      const updated = blogs.map((b) => {
        if (b.id === editingPost.id) {
          return { ...b, ...payload, author: b.author } as BlogPost;
        }
        return b;
      });
      setBlogs(updated);
      saveStoredBlogs(updated);
      if (selectedPost && selectedPost.id === editingPost.id) {
        setSelectedPost((prev) => (prev ? ({ ...prev, ...payload } as BlogPost) : null));
      }
      setEditingPost(null);
      triggerNotice("Đã cập nhật bài viết cá nhân!");
    } else {
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

      const updated = [newBlogPost, ...blogs];
      setBlogs(updated);
      saveStoredBlogs(updated);
      setCurrentTab("blog");
      triggerNotice("Đã đăng bài viết mới thành công!");
    }
  };

  // Xoá bài viết
  const handleDeletePost = () => {
    if (!deleteTarget) return;
    
    // Kiểm tra quyền sở hữu bài viết khi xóa
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
      setDeleteTarget(null);
      return;
    }

    if (!isPostOwner(deleteTarget)) {
      triggerNotice("⛔ Bạn không có quyền xóa bài viết này!");
      setDeleteTarget(null);
      return;
    }

    const updated = blogs.filter((b) => b.id !== deleteTarget.id);
    setBlogs(updated);
    saveStoredBlogs(updated);
    if (selectedPost && selectedPost.id === deleteTarget.id) {
      setSelectedPost(null);
    }
    setDeleteTarget(null);
    triggerNotice("Đã xoá bài viết thành công!");
  };

  // Like Discussion
  const handleLikeDiscussion = (id: string) => {
    // Kiểm tra đăng nhập trước khi like
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
      return;
    }

    setLikedPosts((prev) => {
      const isLiked = !prev[id];
      setDiscussions((dList) =>
        dList.map((d) =>
          d.id === id ? { ...d, likes: d.likes + (isLiked ? 1 : -1) } : d
        )
      );
      return { ...prev, [id]: isLiked };
    });
  };

  // Dislike Discussion
  const handleDislikeDiscussion = (id: string) => {
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
      return;
    }

    setDislikedPosts((prev) => {
      const isDisliked = !prev[id];
      setDiscussions((dList) =>
        dList.map((d) =>
          d.id === id ? { ...d, dislikes: d.dislikes + (isDisliked ? 1 : -1) } : d
        )
      );
      return { ...prev, [id]: isDisliked };
    });
  };

  // Comment Discussion
  const handleAddDiscussionComment = (discussionId: string) => {
    // Kiểm tra đăng nhập trước khi comment
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
      return;
    }

    const text = commentInputs[discussionId]?.trim();
    if (!text) return;
    const authorName = user ? user.name : "Bạn đọc yêu lụa";
    setDiscussions((dList) =>
      dList.map((d) => {
        if (d.id === discussionId) {
          const newCmt = { author: authorName, text, time: "Vừa xong" };
          return {
            ...d,
            commentsCount: d.commentsCount + 1,
            comments: [...(d.comments || []), newCmt],
          };
        }
        return d;
      })
    );
    setCommentInputs((prev) => ({ ...prev, [discussionId]: "" }));
    triggerNotice("Đã gửi bình luận!");
  };

  // Create Discussion
  const handleCreateDiscussion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập trước khi tạo thảo luận
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
      return;
    }

    if (!postContent.trim()) return;
    const newDiscussion = {
      id: `disc-${Date.now()}`,
      author: {
        name: user ? user.name : "Người bạn Maison",
        location: "Việt Nam",
        avatar: user ? user.name.charAt(0).toUpperCase() : "M",
        badge: "Thành viên tích cực",
      },
      time: "Vừa xong",
      content: postContent,
      likes: 0,
      dislikes: 0,
      commentsCount: 0,
      tags: ["ChiaSẻ", "CộngĐồngLụa"],
      comments: [],
    };
    setDiscussions([newDiscussion, ...discussions]);
    setPostContent("");
    triggerNotice("Bài viết đã được đăng lên cộng đồng!");
  };

  // Like Blog
  const handleLikeBlog = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Kiểm tra đăng nhập trước khi like
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
      return;
    }

    const hasLiked = userLikedBlogs[id];
    setUserLikedBlogs((prev) => ({ ...prev, [id]: !hasLiked }));
    setBlogLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (hasLiked ? -1 : 1),
    }));
  };

  // Submit Blog Comment
  const handleBlogCommentSubmit = (postId: string) => {
    // Kiểm tra đăng nhập trước khi comment
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/community" } });
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
    const updated = blogs.map((b) => {
      if (b.id === postId) {
        return { ...b, comments: [...(b.comments || []), newEntry] };
      }
      return b;
    });
    setBlogs(updated);
    saveStoredBlogs(updated);
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

  const filteredBlogs = blogs.filter((post) => {
    if (blogScope === "my_posts" && !isPostOwner(post)) return false;
    const matchCat =
      selectedCategory === "Tất cả" || post.category === selectedCategory;
    const matchSearch =
      !blogSearch.trim() ||
      post.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(blogSearch.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(blogSearch.toLowerCase()));
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
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Trang chủ
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hidden sm:inline-block">
              Community Space
            </span>
          </div>

          <BrandLogo size="md" />

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="commerce"
                size="sm"
                onClick={() => {
                  setEditingPost(null);
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Viết bài mới</span>
                <span className="sm:hidden">Viết bài</span>
              </Button>
            ) : (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  navigate({ to: "/login", search: { returnTo: "/community" } });
                }}
                className="flex items-center gap-1.5 text-xs"
              >
                <UserIcon className="size-3.5" />
                <span className="hidden sm:inline">Đăng nhập</span>
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

      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground py-14 md:py-20">
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">
                <Users className="inline size-3.5 mr-1.5" />
                Kết nối & Chia sẻ
              </p>
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl">
                Cộng đồng
              </h1>
            </div>

            {/* Chuyển đổi màn hình: Feed Thảo Luận vs Màn Blog */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-primary-foreground/10 p-1.5 rounded-lg border border-primary-foreground/15 backdrop-blur-sm">
              <button
                onClick={() => {
                  setCurrentTab("feed");
                  setSelectedPost(null);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold transition-all rounded ${
                  currentTab === "feed" && !selectedPost
                    ? "bg-background text-foreground shadow-md"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/5"
                }`}
              >
                <MessageCircle className="size-3.5" />
                Thảo luận ({discussions.length})
              </button>
              <button
                onClick={() => {
                  setCurrentTab("blog");
                  setSelectedPost(null);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.14em] font-semibold transition-all rounded ${
                  currentTab === "blog" && !selectedPost
                    ? "bg-accent text-accent-foreground shadow-md font-bold"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/5"
                }`}
              >
                <BookOpen className="size-3.5 text-accent-foreground" />
                Blog ({blogs.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 mx-auto w-full max-w-[1440px] px-5 py-10 md:px-10">
        {selectedPost ? (
          /* ========================================================================= */
          /* XEM BÀI VIẾT CHI TIẾT                                                    */
          /* ========================================================================= */
          <article className="max-w-4xl mx-auto animate-in fade-in duration-200">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <button
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-4" /> Quay lại danh sách
              </button>

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

            {selectedPost.image && (
              <div className="my-8 aspect-[16/9] w-full overflow-hidden border border-border bg-secondary shadow-lg">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {selectedPost.excerpt && (
              <p className="text-lg leading-relaxed font-serif text-foreground/90 border-l-2 border-accent pl-5 my-8">
                {selectedPost.excerpt}
              </p>
            )}

            <div className="space-y-6 text-foreground/80 leading-loose text-base font-serif">
              {selectedPost.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

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
        ) : currentTab === "blog" ? (
          /* ========================================================================= */
          /* MÀN BLOG: CRUD CHO CÁC BÀI VIẾT CÁ NHÂN                                  */
          /* ========================================================================= */
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Toolbar: Scope (Tất cả / Của tôi) + Nút Viết bài + Tìm kiếm */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-2 p-1 bg-secondary/60 rounded-lg border border-border w-fit">
                <button
                  onClick={() => setBlogScope("all")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-md transition-all ${
                    blogScope === "all"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả bài blog ({blogs.length})
                </button>
                <button
                  onClick={() => setBlogScope("my_posts")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] rounded-md transition-all flex items-center gap-1.5 ${
                    blogScope === "my_posts"
                      ? "bg-accent text-accent-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UserIcon className="size-3.5" />
                  Bài viết của tôi ({myPostsCount})
                </button>
              </div>

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
                    onClick={() => navigate({ to: "/login", search: { returnTo: "/community" } })}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
                  >
                    <UserIcon className="size-4" /> Đăng nhập để viết
                  </Button>
                )}

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Tìm kiếm bài blog..."
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

            {blogScope === "my_posts" && (
              <div className="flex items-center justify-between bg-accent/10 border border-accent/30 p-4 rounded-md text-xs">
                <div className="flex items-center gap-2.5 text-accent font-medium">
                  <Sparkles className="size-4 shrink-0" />
                  <span>
                    Chế độ <strong>Bài viết của tôi</strong>: Bạn có thể chỉnh sửa nội dung hoặc xoá bất kỳ bài viết nào bạn đã đăng.
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
                            {isOwner && (
                              <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded border border-border">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPost(post);
                                    setIsEditorOpen(true);
                                  }}
                                  title="Sửa bài viết"
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
                            )}

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
              <div className="text-center py-20 border border-dashed border-border rounded-lg max-w-lg mx-auto">
                <BookOpen className="size-12 mx-auto text-muted-foreground/40 mb-4" />
                <h4 className="font-display text-xl text-foreground">
                  {blogScope === "my_posts"
                    ? "Bạn chưa có bài viết cá nhân nào"
                    : "Không tìm thấy bài blog phù hợp"}
                </h4>
                <p className="text-xs text-muted-foreground mt-2 px-6">
                  {blogScope === "my_posts"
                    ? "Hãy bắt đầu viết bài đầu tiên của bạn để chia sẻ kiến thức, mẹo hay hoặc cảm nghĩ về đũi tơ tằm!"
                    : "Hãy thử xoá từ khoá tìm kiếm hoặc chọn danh mục khác."}
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
                      <Plus className="size-4 mr-1.5" /> Viết bài mới ngay
                    </Button>
                  ) : (
                    <Button
                      variant="quiet"
                      size="sm"
                      onClick={() => navigate({ to: "/login", search: { returnTo: "/community" } })}
                    >
                      <UserIcon className="size-4 mr-1.5" /> Đăng nhập để viết
                    </Button>
                  )}
                  {blogScope === "my_posts" && (
                    <Button variant="quiet" size="sm" onClick={() => setBlogScope("all")}>
                      Xem tất cả bài viết
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* THẢO LUẬN CỘNG ĐỒNG (FEED)                                               */
          /* ========================================================================= */
          <div className="animate-in fade-in duration-300">
            <div className="space-y-8">
              {/* Form đăng status cộng đồng */}
              <div className="border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid size-10 place-items-center rounded-full bg-foreground text-background font-bold text-sm">
                    {user ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {user ? user.name : "Bạn đang nghĩ gì về đũi tơ hôm nay?"}
                    </h3>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Chia sẻ trải nghiệm mặc đẹp, câu hỏi hoặc hình ảnh cùng cộng đồng
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreateDiscussion}>
                  <textarea
                    rows={3}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={user ? "Viết cảm nghĩ, trải nghiệm phối đồ hoặc câu hỏi gửi tới cộng đồng Maison de Silk..." : "Đăng nhập để tham gia thảo luận với cộng đồng..."}
                    disabled={!user}
                    className="w-full border border-border bg-secondary/30 p-3.5 text-sm outline-none focus:border-accent transition-colors resize-none placeholder:text-muted-foreground/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`inline-flex items-center gap-1 ${user ? 'cursor-pointer hover:text-foreground' : 'opacity-50 cursor-not-allowed'}`}>
                        <ImageIcon className="size-3.5" /> Thêm ảnh
                      </span>
                      <span>•</span>
                      <span className={`inline-flex items-center gap-1 ${user ? 'cursor-pointer hover:text-foreground' : 'opacity-50 cursor-not-allowed'}`}>
                        <Tag className="size-3.5" /> Gắn thẻ
                      </span>
                    </div>
                    {user ? (
                      <Button variant="commerce" size="sm" type="submit">
                        <Send className="size-3.5" /> Đăng thảo luận
                      </Button>
                    ) : (
                      <Button 
                        variant="quiet" 
                        size="sm" 
                        type="button"
                        onClick={() => navigate({ to: "/login", search: { returnTo: "/community" } })}
                      >
                        <UserIcon className="size-3.5" /> Đăng nhập
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Feed các bài thảo luận */}
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                  Dòng thời gian hoạt động mới nhất
                </h3>

                {discussions.map((item) => (
                  <article
                    key={item.id}
                    className="border border-border bg-background p-6 transition-all hover:border-border/80 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-secondary text-foreground font-bold text-xs uppercase border border-border">
                          {item.author.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {item.author.name}
                            </span>
                            <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-accent">
                              {item.author.badge}
                            </span>
                          </div>
                          <p className="text-[0.7rem] text-muted-foreground">
                            {item.author.location} · {item.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm md:text-base leading-relaxed text-foreground/90 mb-4">
                      {item.content}
                    </p>

                    {item.image && (
                      <div className="mb-4 aspect-[16/10] max-h-80 w-full overflow-hidden border border-border bg-secondary">
                        <img
                          src={item.image}
                          alt="Ảnh đính kèm từ thành viên"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[0.7rem] text-accent font-medium hover:underline cursor-pointer"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLikeDiscussion(item.id)}
                          className={`flex items-center gap-1.5 transition-colors hover:text-red-500 cursor-pointer ${
                            likedPosts[item.id] ? "text-red-500 font-bold" : ""
                          }`}
                        >
                          <Heart
                            className="size-4"
                            fill={likedPosts[item.id] ? "currentColor" : "none"}
                          />
                          <span>{item.likes} Yêu thích</span>
                        </button>
                        <button
                          onClick={() => handleDislikeDiscussion(item.id)}
                          className={`flex items-center gap-1.5 transition-colors hover:text-blue-500 cursor-pointer ${
                            dislikedPosts[item.id] ? "text-blue-500 font-bold" : ""
                          }`}
                        >
                          <ThumbsDown
                            className="size-4"
                            fill={dislikedPosts[item.id] ? "currentColor" : "none"}
                          />
                          <span>{item.dislikes} Không thích</span>
                        </button>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="size-4" />
                          <span>{item.commentsCount} Bình luận</span>
                        </span>
                      </div>
                    </div>

                    {item.comments && item.comments.length > 0 && (
                      <div className="mt-4 space-y-2.5 border-t border-border/50 pt-3 bg-secondary/10 p-3 rounded">
                        {item.comments.map((cmt, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-semibold text-foreground mr-1.5">
                              {cmt.author}:
                            </span>
                            <span className="text-foreground/80">{cmt.text}</span>
                            <span className="block text-[0.65rem] text-muted-foreground mt-0.5">
                              {cmt.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[item.id] || ""}
                        onChange={(e) =>
                          setCommentInputs({
                            ...commentInputs,
                            [item.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddDiscussionComment(item.id);
                        }}
                        placeholder="Để lại phản hồi cho thành viên..."
                        className="flex-1 border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground/40"
                      />
                      <Button
                        size="sm"
                        variant="quiet"
                        onClick={() => handleAddDiscussionComment(item.id)}
                      >
                        Gửi
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-primary px-5 py-12 text-primary-foreground md:px-10 border-t border-border">
        <div className="mx-auto grid max-w-[1440px] gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo-white.png"
                alt="Maison de Silk"
                className="h-10 w-auto object-contain"
              />
              <span className="font-display text-xl tracking-[0.14em]">MAISON DE SILK</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-primary-foreground/65 max-w-xs">
              Cộng đồng gìn giữ tinh hoa đũi tơ tằm Việt Nam, kết nối tình yêu di sản vào đời sống đương đại.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-primary-foreground/50 font-bold">
                Cộng đồng
              </p>
              <p>
                <button
                  onClick={() => {
                    setCurrentTab("feed");
                    setSelectedPost(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:underline"
                >
                  Thảo luận thành viên
                </button>
              </p>
              <p>
                <button
                  onClick={() => {
                    setCurrentTab("blog");
                    setSelectedPost(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:underline"
                >
                  Màn Blog &amp; Journal
                </button>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.15em] text-primary-foreground/50 font-bold">
                Khám phá
              </p>
              <p><a href="/products" className="hover:underline">Bộ sưu tập áo đũi</a></p>
              <p><a href="/#craft" className="hover:underline">Chuyện làng nghề</a></p>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-primary-foreground/50 font-bold">
              Bản tin Maison
            </p>
            <p className="mt-2 text-xs text-primary-foreground/70">
              Nhận các bài viết mới từ cộng đồng mỗi tuần.
            </p>
            <div className="mt-3 flex border-b border-primary-foreground/35">
              <input
                className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-primary-foreground/45"
                placeholder="Email nhận bài blog mới"
              />
              <button
                onClick={() => triggerNotice("Cảm ơn bạn đã đăng ký nhận bài viết blog!")}
                className="px-2 hover:text-accent transition-colors"
                aria-label="Đăng ký"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Soạn thảo bài viết */}
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
