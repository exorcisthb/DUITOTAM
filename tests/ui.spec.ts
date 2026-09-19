import { test, expect } from "@playwright/test";

// ──────────────────────────────────────────────
// Nhóm test: Trang chủ & Giao diện cơ bản
// ──────────────────────────────────────────────
test.describe("Trang chủ — Mộc Silk", () => {
  test("Hiển thị đúng tiêu đề trang và logo", async ({ page }) => {
    await page.goto("/");

    // Kiểm tra title tab trình duyệt
    await expect(page).toHaveTitle(/Mộc Silk/);

    // Kiểm tra logo trên header
    await expect(page.getByText("MỘC")).toBeVisible();
    await expect(page.getByText("SILK")).toBeVisible();
  });

  test("Hero section hiển thị đầy đủ nội dung", async ({ page }) => {
    await page.goto("/");

    // Tiêu đề bộ sưu tập
    await expect(page.getByText("Bộ sưu tập Thu Đông 2026")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mộc Silk" })).toBeVisible();

    // Mô tả
    await expect(page.getByText(/Vẻ đẹp nguyên bản của đũi tơ tằm/)).toBeVisible();

    // Nút CTA
    await expect(page.getByRole("link", { name: /Khám phá bộ sưu tập/i })).toBeVisible();
  });

  test("Header hiển thị nút Đăng nhập và Đăng ký khi chưa đăng nhập", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: /Đăng nhập/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Đăng ký/i })).toBeVisible();
  });

  test("Thanh thông báo freeship hiển thị", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Miễn phí giao hàng toàn quốc/)).toBeVisible();
  });

  test("Danh sách sản phẩm nổi bật hiển thị đủ", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Khám phá bộ sưu tập/i }).click();

    // Kiểm tra section sản phẩm
    await expect(page.getByRole("heading", { name: "Sản phẩm nổi bật" })).toBeVisible();

    // Ít nhất 4 sản phẩm
    const products = page.locator("article");
    await expect(products).toHaveCount(8);
  });

  test("Bộ lọc sản phẩm hoạt động", async ({ page }) => {
    await page.goto("/#products");

    // Click filter Áo dài
    await page.getByRole("button", { name: "Áo dài" }).click();
    const products = page.locator("article");
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(8);
  });
});

// ──────────────────────────────────────────────
// Nhóm test: Modal Đăng nhập & Đăng ký
// ──────────────────────────────────────────────
test.describe("Modal xác thực — Đăng nhập & Đăng ký", () => {
  test("Bấm Đăng nhập → Modal mở ra với form đăng nhập", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Đăng nhập/i }).click();

    // Modal xuất hiện
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Đăng Nhập" })).toBeVisible();

    // Có 2 tab
    await expect(page.getByRole("button", { name: "Đăng nhập" }).nth(1)).toBeVisible();
    await expect(page.getByRole("button", { name: "Tạo tài khoản mới" })).toBeVisible();
  });

  test("Chuyển tab sang Đăng ký trong modal", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Đăng nhập/i }).first().click();
    await page.getByRole("button", { name: "Tạo tài khoản mới" }).click();

    await expect(page.getByRole("heading", { name: "Đăng Ký Thành Viên" })).toBeVisible();
    await expect(page.getByLabel("Họ và tên")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("Validation: đăng nhập với ô trống → báo lỗi", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Đăng nhập/i }).first().click();

    // Submit form rỗng
    await page.getByRole("button", { name: "Đăng Nhập" }).click();

    await expect(page.getByText(/Vui lòng điền đầy đủ/i)).toBeVisible();
  });

  test("Validation: đăng ký với mật khẩu không khớp → báo lỗi", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Đăng nhập/i }).first().click();
    await page.getByRole("button", { name: "Tạo tài khoản mới" }).click();

    await page.getByLabel("Họ và tên").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Mật khẩu (≥ 6 ký tự)").fill("abc123");
    await page.getByLabel("Xác nhận mật khẩu").fill("abc456"); // không khớp

    await page.getByRole("button", { name: "Đăng Ký Tài Khoản" }).click();

    await expect(page.getByText(/không trùng khớp/i)).toBeVisible();
  });

  test("Đóng modal bằng nút X", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Đăng nhập/i }).first().click();

    // Đóng modal
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────
// Nhóm test: Trang /login và /register riêng
// ──────────────────────────────────────────────
test.describe("Trang /login và /register", () => {
  test("Trang /login hiển thị đúng", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Đăng nhập/);
    await expect(page.getByRole("heading", { name: "Đăng Nhập" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mật khẩu")).toBeVisible();
  });

  test("Trang /register hiển thị đúng", async ({ page }) => {
    await page.goto("/register");
    await expect(page).toHaveTitle(/Đăng ký/);
    await expect(page.getByRole("heading", { name: "Tạo Tài Khoản" })).toBeVisible();
  });

  test("Link Quay lại trang chủ hoạt động", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Quay lại trang chủ/i }).click();
    await expect(page).toHaveURL("/");
  });
});

// ──────────────────────────────────────────────
// Nhóm test: Responsive (mobile viewport)
// ──────────────────────────────────────────────
test.describe("Responsive — Mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("Menu mobile hiển thị nút hamburger", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Mở menu" })).toBeVisible();
  });

  test("Bấm hamburger mở menu mobile", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Mở menu" }).click();
    await expect(page.getByRole("link", { name: "Sản phẩm" })).toBeVisible();
  });
});
