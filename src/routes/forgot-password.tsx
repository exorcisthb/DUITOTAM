import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
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

    setIsLoading(true);
    // Giả lập gửi email
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);

    setSuccessMsg(
      `Link đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư (hoặc Spam).`
    );
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
            <p className="text-muted-foreground text-sm mt-2">Nhập email để nhận link đặt lại mật khẩu.</p>
          </div>

          {successMsg ? (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/8 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Không nhận được email? Kiểm tra thư mục Spam hoặc thử lại sau vài phút.
              </p>
              <div className="flex gap-3">
                <Button variant="quiet" size="sm" onClick={() => { setSuccessMsg(""); setEmail(""); }} className="flex-1">
                  Gửi lại
                </Button>
                <Button variant="commerce" size="sm" asChild className="flex-1">
                  <Link to="/login" search={{ returnTo: "/" }}>Về đăng nhập</Link>
                </Button>
              </div>
              {/* Demo shortcut */}
              <div className="mt-4 p-3 rounded-md border border-dashed border-accent/40 bg-accent/5">
                <p className="text-[0.65rem] text-accent font-semibold uppercase tracking-[0.12em] mb-1">Demo</p>
                <Link to="/reset-password" className="text-xs text-accent hover:underline">
                  Click để đặt lại mật khẩu ngay →
                </Link>
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

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full h-12 text-xs tracking-[0.18em] mt-2"
              >
                {isLoading ? (
                  <><Loader2 className="size-4 animate-spin mr-2" /> Đang gửi...</>
                ) : (
                  "Gửi link đặt lại mật khẩu"
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
