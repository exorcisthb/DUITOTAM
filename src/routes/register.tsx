import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Đăng ký — Mộc Silk" },
      { name: "description", content: "Tạo tài khoản thành viên Mộc Silk." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { user, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
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

    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mật khẩu phải có độ dài ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Vui lòng đồng ý với điều khoản & chính sách của Mộc Silk.");
      return;
    }

    const res = await register({
      name,
      email,
      password,
    });

    if (res.success) {
      setSuccessMsg(`Đăng ký thành công! Chào mừng ${res.user?.name} đến với Mộc Silk.`);
      setTimeout(() => {
        navigate({ to: "/" });
      }, 1200);
    } else {
      setErrorMsg(res.error || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Quay lại trang chủ
          </Link>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-8 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-[0.68rem] tracking-[0.24em] uppercase font-semibold text-accent mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="size-3" /> Mộc Silk
            </p>
            <h1 className="font-display text-4xl font-normal tracking-wide text-foreground">Tạo Tài Khoản</h1>
            <p className="text-muted-foreground text-xs mt-2">
              Trở thành thành viên để nhận ưu đãi và lưu giữ bộ sưu tập yêu thích
            </p>
          </div>

          {user ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
                <span className="font-medium text-sm">Bạn hiện đã đăng nhập:</span>
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
                <div className="flex items-start gap-2.5 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="page-reg-name" className="text-xs font-medium text-foreground/85">
                  Họ và tên
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="page-reg-name"
                    type="text"
                    required
                    placeholder="Nguyễn Thuỳ Linh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-11 text-sm border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-reg-email" className="text-xs font-medium text-foreground/85">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="page-reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="thuylinh@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 text-sm border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-reg-password" className="text-xs font-medium text-foreground/85">
                  Mật khẩu (≥ 6 ký tự)
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="page-reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 text-sm border-border focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-reg-confirm" className="text-xs font-medium text-foreground/85">
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="page-reg-confirm"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-11 text-sm border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="page-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary size-4 cursor-pointer"
                />
                <label htmlFor="page-terms" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Tôi đồng ý với chính sách bảo mật & điều khoản của Mộc Silk
                </label>
              </div>

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full mt-2 h-11 text-xs tracking-[0.16em]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Đang khởi tạo...
                  </>
                ) : (
                  "Đăng Ký Tài Khoản"
                )}
              </Button>

              <div className="pt-4 text-center text-xs text-muted-foreground border-t border-border mt-6">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-foreground underline underline-offset-4 hover:text-accent"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
