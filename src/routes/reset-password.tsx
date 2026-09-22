import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import ivory from "@/assets/product-ivory.jpg";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Đặt lại mật khẩu — Maison de Silk" },
      { name: "description", content: "Tạo mật khẩu mới cho tài khoản Maison de Silk." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword) {
      setErrorMsg("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    setIsLoading(true);
    // Giả lập API
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);

    setSuccessMsg("Mật khẩu đã được đặt lại thành công!");
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
          <a href="/forgot-password" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="size-4" /> Quay lại
          </a>

          <a href="/" className="block lg:hidden mb-8">
            <img src="/logo-transparent.png" alt="Maison de Silk" className="h-12 w-auto object-contain" />
          </a>

          <div className="mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-accent mb-2">Bảo mật tài khoản</p>
            <h1 className="font-display text-4xl font-normal">Đặt lại mật khẩu</h1>
            <p className="text-muted-foreground text-sm mt-2">Tạo mật khẩu mới cho tài khoản của bạn.</p>
          </div>

          {successMsg ? (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
              <Button variant="commerce" size="sm" asChild className="w-full">
                <Link to="/login" search={{ returnTo: "/" }}>Đăng nhập ngay</Link>
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

              <div className="space-y-1.5">
                <Label htmlFor="rp-password" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="rp-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <p className="text-[0.65rem] text-muted-foreground">Tối thiểu 6 ký tự.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rp-confirm" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="rp-confirm"
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

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full h-12 text-xs tracking-[0.18em] mt-2"
              >
                {isLoading ? (
                  <><Loader2 className="size-4 animate-spin mr-2" /> Đang xử lý...</>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
                Nhớ mật khẩu?{" "}
                <Link to="/login" search={{ returnTo: "/" }} className="font-semibold text-foreground underline underline-offset-4 hover:text-accent transition-colors">
                  Đăng nhập
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
