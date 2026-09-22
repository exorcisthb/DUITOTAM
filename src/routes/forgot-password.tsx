import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, KeyRound, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { getUserProfile } from "@/routes/account-setup";
import ivory from "@/assets/product-ivory.jpg";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Quên mật khẩu — Maison de Silk" },
      { name: "description", content: "Đặt lại mật khẩu tài khoản Maison de Silk." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (!email.trim().toLowerCase().endsWith("@gmail.com")) {
      setErrorMsg("Vui lòng sử dụng địa chỉ Gmail (@gmail.com).");
      return;
    }
    if (!recoveryKey.trim()) {
      setErrorMsg("Vui lòng nhập key khôi phục.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    // Kiểm tra key khôi phục
    const profile = getUserProfile();
    if (!profile) {
      setIsLoading(false);
      setErrorMsg("Không tìm thấy thông tin tài khoản. Vui lòng liên hệ hỗ trợ.");
      return;
    }

    if (profile.recoveryKey !== recoveryKey.trim().toUpperCase()) {
      setIsLoading(false);
      setErrorMsg("Key khôi phục không chính xác. Vui lòng kiểm tra lại.");
      return;
    }

    setIsLoading(false);
    setSuccessMsg("Xác thực thành công! Đang chuyển đến trang đặt lại mật khẩu...");

    setTimeout(() => {
      navigate({ to: "/reset-password" });
    }, 1200);
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
          <a href="/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="size-4" /> Quay lại đăng nhập
          </a>

          <a href="/" className="block lg:hidden mb-8">
            <img src="/logo-transparent.png" alt="Maison de Silk" className="h-12 w-auto object-contain" />
          </a>

          <div className="mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-accent mb-2">Hỗ trợ tài khoản</p>
            <h1 className="font-display text-4xl font-normal">Quên mật khẩu</h1>
            <p className="text-muted-foreground text-sm mt-2">Nhập email và key khôi phục để đặt lại mật khẩu.</p>
          </div>

          {successMsg ? (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
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
                <Label htmlFor="fp-email" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="fp-email"
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
                <Label htmlFor="fp-key" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
                  Key khôi phục
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="fp-key"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value.toUpperCase())}
                    className="pl-10 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30 font-mono tracking-[0.1em]"
                  />
                </div>
                <p className="text-[0.65rem] text-muted-foreground">
                  Key đã được cấp khi bạn đăng ký tài khoản.
                </p>
              </div>

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full h-12 text-xs tracking-[0.18em] mt-2"
              >
                {isLoading ? (
                  <><Loader2 className="size-4 animate-spin mr-2" /> Đang xác thực...</>
                ) : (
                  "Xác nhận & Đặt lại mật khẩu"
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
