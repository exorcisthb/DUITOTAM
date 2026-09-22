import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import green from "@/assets/product-green.jpg";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: (search["returnTo"] as string) || "/",
  }),
  head: () => ({
    meta: [
      { title: "Đăng ký — Maison de Silk" },
      { name: "description", content: "Tạo tài khoản thành viên Maison de Silk." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { returnTo } = Route.useSearch();
  const { user, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) { setErrorMsg("Vui lòng nhập địa chỉ email."); return; }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) { setErrorMsg("Vui lòng sử dụng Gmail (@gmail.com) để đăng ký."); return; }
    if (password.length < 6) { setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    if (password !== confirmPassword) { setErrorMsg("Mật khẩu xác nhận không trùng khớp."); return; }
    if (!agreeTerms) { setErrorMsg("Vui lòng đồng ý với điều khoản của Maison de Silk."); return; }

    const username = email.split("@")[0] || "Thành viên";
    const res = await register({ name: username, email, password });
    if (res.success) {
      setSuccessMsg(`Đăng ký thành công! Chào mừng ${res.user?.name ?? username} đến với Maison de Silk.`);
      setTimeout(() => navigate({ to: "/account-setup" }), 1200);
    } else {
      setErrorMsg(res.error || "Đăng ký thất bại. Vui lòng thử lại.");
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
          src={green}
          alt="Trang phục đũi tơ tằm Maison de Silk"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/25" />

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground/60">Đặc quyền thành viên</p>
            <h2 className="font-display text-3xl leading-snug text-primary-foreground">
              Trải nghiệm<br />trọn vẹn hơn<br />với tài khoản Mộc.
            </h2>
          </div>
          <ul className="space-y-2.5">
            {[
              "Lưu bộ sưu tập yêu thích",
              "Ưu đãi thành viên độc quyền",
              "Theo dõi đơn hàng dễ dàng",
              "Trải nghiệm mua sắm cá nhân hoá",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-primary-foreground/80">
                <CheckCircle2 className="size-4 text-primary-foreground/50 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-16 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <a href={returnTo} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="size-4" /> Quay lại
          </a>

          <a href="/" className="block lg:hidden mb-8">
            <img src="/logo-transparent.png" alt="Maison de Silk" className="h-12 w-auto object-contain" />
          </a>

          <div className="mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-accent mb-2">Thành viên Mộc</p>
            <h1 className="font-display text-4xl font-normal">Tạo Tài Khoản</h1>
            <p className="text-muted-foreground text-sm mt-2">Gia nhập cộng đồng yêu tơ lụa Việt nguyên bản.</p>
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
                <Link to="/">Về trang chủ</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Gmail</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
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
                <Label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Ít nhất 6 ký tự"
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

              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="reg-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border cursor-pointer accent-primary"
                />
                <label htmlFor="reg-terms" className="text-xs text-muted-foreground cursor-pointer select-none leading-relaxed">
                  Tôi đồng ý với{" "}
                  <span className="text-foreground underline underline-offset-2 hover:text-accent cursor-pointer transition-colors">
                    chính sách bảo mật & điều khoản
                  </span>{" "}
                  của Maison de Silk
                </label>
              </div>

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full h-12 text-xs tracking-[0.18em] mt-2"
              >
                {isLoading ? (
                  <><Loader2 className="size-4 animate-spin mr-2" /> Đang khởi tạo...</>
                ) : (
                  "Đăng Ký Tài Khoản"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                Đã có tài khoản?{" "}
                <a href={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-foreground underline underline-offset-4 hover:text-accent transition-colors">
                  Đăng nhập ngay
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
