import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import ivory from "@/assets/product-ivory.jpg";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: (search["returnTo"] as string) || "/",
  }),
  head: () => ({
    meta: [
      { title: "Đăng nhập — Maison de Silk" },
      { name: "description", content: "Đăng nhập tài khoản thành viên Maison de Silk." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { returnTo } = Route.useSearch();
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setErrorMsg("Vui lòng sử dụng địa chỉ Gmail (@gmail.com) để đăng nhập.");
      return;
    }

    const res = await login({ email, password });
    if (res.success) {
      setSuccessMsg(`Đăng nhập thành công! Chào mừng ${res.user?.name || ""}.`);
      setTimeout(() => navigate({ to: returnTo }), 1000);
    } else {
      setErrorMsg(res.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col justify-between p-12">
        <div className="relative z-10">
          <a href="/" className="inline-block">
            <img src="/logo-white.png" alt="Maison de Silk" className="h-14 w-auto object-contain drop-shadow-md" />
          </a>
        </div>

        <img
          src={ivory}
          alt="Trang phục đũi tơ tằm Maison de Silk"
          className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/30" />

        <div className="relative z-10 space-y-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground/60">Bộ sưu tập Thu Đông 2026</p>
          <blockquote className="font-display text-3xl leading-snug text-primary-foreground">
            "Mặc lên nhẹ như<br />không, nhưng đẹp<br />đến từng thớ vải."
          </blockquote>
          <p className="text-xs text-primary-foreground/60 tracking-wide">— Thu Hà, Hà Nội</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-16 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          {/* Back link */}
          <a href={returnTo} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="size-4" /> Quay lại
          </a>

          {/* Logo (mobile only) */}
          <a href="/" className="block lg:hidden mb-8">
            <img src="/logo-transparent.png" alt="Maison de Silk" className="h-12 w-auto object-contain" />
          </a>

          <div className="mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-accent mb-2">Thành viên Mộc</p>
            <h1 className="font-display text-4xl font-normal">Đăng Nhập</h1>
            <p className="text-muted-foreground text-sm mt-2">Chào mừng trở lại không gian tơ lụa Việt.</p>
          </div>

          {user ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
                <span className="text-sm font-medium">Bạn đã đăng nhập</span>
              </div>
              <p className="font-display text-xl">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Button variant="commerce" asChild className="w-full mt-4">
                <Link to={returnTo}>Về trang chủ</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tenban@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Mật khẩu</Label>
                  <button type="button" className="text-[0.68rem] text-muted-foreground hover:text-accent transition-colors">Quên mật khẩu?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-11 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full h-12 text-xs tracking-[0.18em] mt-2"
              >
                {isLoading ? (
                  <><Loader2 className="size-4 animate-spin mr-2" /> Đang xử lý...</>
                ) : (
                  "Đăng Nhập"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                Chưa có tài khoản?{" "}
                <a href={`/register?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-foreground underline underline-offset-4 hover:text-accent transition-colors">
                  Đăng ký ngay
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
