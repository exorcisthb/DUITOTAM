import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ShieldCheck,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  User,
  Calendar,
  MapPin,
  KeyRound,
} from "lucide-react";
import green from "@/assets/product-green.jpg";

const RECOVERY_KEY_STORAGE = "moc_silk_recovery_key";
const USER_PROFILE_KEY = "moc_silk_user_profile";

export interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  address: string;
  recoveryKey: string;
}

export function generateRecoveryKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) key += "-";
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/account-setup")({
  head: () => ({
    meta: [
      { title: "Thiết lập tài khoản — Maison de Silk" },
      { name: "description", content: "Hoàn tất thông tin tài khoản và lưu key khôi phục." },
    ],
  }),
  component: AccountSetupPage,
});

function AccountSetupPage() {
  const { user, isSessionChecked } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [recoveryKey] = useState(() => generateRecoveryKey());
  const [copied, setCopied] = useState(false);
  const [keyConfirmed, setKeyConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isSessionChecked && !user) {
      navigate({ to: "/login", search: { returnTo: "/account-setup" } });
    }
  }, [user, isSessionChecked, navigate]);

  if (!isSessionChecked || !user) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setErrorMsg("");
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ tên.");
      return;
    }
    if (!dateOfBirth) {
      setErrorMsg("Vui lòng nhập ngày sinh.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ.");
      return;
    }
    if (!keyConfirmed) {
      setErrorMsg("Bạn phải xác nhận đã lưu giữ key khôi phục trước khi tiếp tục.");
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));

    saveUserProfile({
      fullName: fullName.trim(),
      dateOfBirth,
      address: address.trim(),
      recoveryKey,
    });

    setIsSaving(false);
    navigate({ to: "/" });
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

        <div className="relative z-10 space-y-4">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-primary-foreground/60">Bảo mật tài khoản</p>
          <blockquote className="font-display text-3xl leading-snug text-primary-foreground">
            "Key khôi phục là chìa khóa<br />bảo vệ tài khoản của bạn."
          </blockquote>
          <p className="text-xs text-primary-foreground/60 tracking-wide leading-relaxed">
            Lưu giữ key ở nơi an toàn. Bạn sẽ cần nó khi muốn đặt lại mật khẩu.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 py-12 sm:px-16 xl:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <p className="text-[0.65rem] uppercase tracking-[0.24em] text-accent mb-2">Hoàn tất đăng ký</p>
            <h1 className="font-display text-3xl sm:text-4xl font-normal">Thiết lập tài khoản</h1>
            <p className="text-muted-foreground text-sm mt-2">Điền thông tin và lưu key khôi phục của bạn.</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive mb-5">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Họ tên */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30"
                />
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Ngày sinh</Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="pl-10 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30"
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 h-12 text-sm border-border/70 focus-visible:ring-primary bg-secondary/30"
                />
              </div>
            </div>

            {/* ── KEY KHÔI PHỤC ── */}
            <div className="rounded-lg border-2 border-amber-500/50 bg-amber-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-400">
                  Key khôi phục tài khoản
                </p>
              </div>

              {/* Key display */}
              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-lg font-bold tracking-[0.15em] text-foreground bg-background border border-border rounded-md px-4 py-2.5 text-center select-all">
                  {recoveryKey}
                </div>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="shrink-0 size-10 flex items-center justify-center rounded-md border border-border bg-background hover:bg-secondary transition-colors"
                  title="Sao chép key"
                >
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 text-muted-foreground" />}
                </button>
              </div>

              {/* Cảnh báo */}
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">⚠️ QUAN TRỌNG — HÃY LƯU LẠI KEY NÀY NGAY!</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-600/80 dark:text-amber-400/80">
                    <li>Key này là <strong>bắt buộc</strong> khi bạn muốn đặt lại mật khẩu.</li>
                    <li>Hãy copy và lưu ở nơi an toàn (ghi chú, email, mật khẩu quản lý...).</li>
                    <li>Nếu mất key, bạn <strong>không thể</strong> khôi phục tài khoản.</li>
                    <li>Mỗi tài khoản chỉ có 1 key duy nhất.</li>
                  </ul>
                </div>
              </div>

              {/* Xác nhận đã lưu */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keyConfirmed}
                  onChange={(e) => setKeyConfirmed(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-border accent-amber-600"
                />
                <span className="text-xs text-foreground/80">
                  Tôi đã <strong>lưu giữ</strong> key khôi phục ở nơi an toàn và hiểu rằng nếu mất key, tôi sẽ không thể khôi phục tài khoản.
                </span>
              </label>
            </div>

            <Button
              variant="commerce"
              disabled={isSaving}
              className="w-full h-12 text-xs tracking-[0.18em] mt-2"
              onClick={handleSave}
            >
              {isSaving ? (
                <><Loader2 className="size-4 animate-spin mr-2" /> Đang lưu...</>
              ) : (
                <><ShieldCheck className="size-4 mr-2" /> Hoàn tất thiết lập</>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              <a href="/" className="font-semibold text-foreground underline underline-offset-4 hover:text-accent transition-colors">
                Bỏ qua, về trang chủ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
