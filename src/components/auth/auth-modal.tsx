import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, setAuthModalTab, login, register, isLoading } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleTabChange = (tab: "login" | "register") => {
    setErrorMsg("");
    setSuccessMsg("");
    setAuthModalTab(tab);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    const res = await login({ email: loginEmail, password: loginPassword });
    if (res.success) {
      setSuccessMsg(`Chào mừng bạn quay trở lại, ${res.user?.name || ""}!`);
      setTimeout(() => {
        setSuccessMsg("");
      }, 1500);
    } else {
      setErrorMsg(res.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên của bạn.");
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ email.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg("Mật khẩu phải có độ dài ít nhất 6 ký tự.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp.");
      return;
    }
    if (!agreeTerms) {
      setErrorMsg("Vui lòng đồng ý với điều khoản & chính sách của Maison de Silk.");
      return;
    }

    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
    });

    if (res.success) {
      setSuccessMsg(`Đăng ký thành công! Chào mừng ${res.user?.name} đến với Maison de Silk.`);
      setTimeout(() => {
        setSuccessMsg("");
      }, 1500);
    } else {
      setErrorMsg(res.error || "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-md">
        {/* Header decoration */}
        <div className="bg-primary/95 text-primary-foreground px-8 py-7 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial from-accent/20 to-transparent pointer-events-none opacity-50" />
          <p className="text-[0.68rem] tracking-[0.24em] uppercase font-semibold text-accent mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="size-3" /> Maison de Silk Authenticity
          </p>
          <DialogTitle className="font-display text-3xl font-normal tracking-wide text-primary-foreground">
            {authModalTab === "login" ? "Đăng Nhập" : "Đăng Ký Thành Viên"}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/75 text-xs mt-1.5">
            {authModalTab === "login"
              ? "Trải nghiệm đặc quyền thương hiệu và quản lý đơn hàng của bạn."
              : "Lưu giữ hành trình tơ tằm cùng các ưu đãi bộ sưu tập giới hạn."}
          </DialogDescription>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 border-b border-border text-center text-xs tracking-[0.14em] uppercase font-medium">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`py-3.5 transition-all cursor-pointer ${
              authModalTab === "login"
                ? "border-b-2 border-primary text-foreground font-semibold bg-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`py-3.5 transition-all cursor-pointer ${
              authModalTab === "register"
                ? "border-b-2 border-primary text-foreground font-semibold bg-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tạo tài khoản mới
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {errorMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 flex items-start gap-2.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {authModalTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium text-foreground/85">
                  Email đăng nhập
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="tenban@domain.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-9 h-11 text-sm border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-medium text-foreground/85">
                    Mật khẩu
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-9 pr-10 h-11 text-sm border-border focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="commerce"
                disabled={isLoading}
                className="w-full mt-2 h-11 text-xs tracking-[0.16em]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Đang đăng nhập...
                  </>
                ) : (
                  "Đăng Nhập"
                )}
              </Button>

              <div className="pt-3 text-center text-xs text-muted-foreground">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-accent cursor-pointer"
                >
                  Đăng ký thành viên Mộc
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-xs font-medium text-foreground/85">
                  Họ và tên
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Nguyễn Thuỳ Linh"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="pl-9 h-10 text-sm border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-xs font-medium text-foreground/85">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="thuylinh@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-9 h-10 text-sm border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className="text-xs font-medium text-foreground/85">
                    Mật khẩu (≥ 6 ký tự)
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 pr-9 h-10 text-sm border-border focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-confirm" className="text-xs font-medium text-foreground/85">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="reg-confirm"
                      type={showRegPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="pl-9 h-10 text-sm border-border focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary size-4 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Tôi đồng ý với chính sách & điều khoản của Maison de Silk
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
                    <Loader2 className="size-4 animate-spin mr-2" /> Đang tạo tài khoản...
                  </>
                ) : (
                  "Đăng Ký Tài Khoản"
                )}
              </Button>

              <div className="pt-2 text-center text-xs text-muted-foreground">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-accent cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
