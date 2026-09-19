import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";
import { getDb, initDb } from "./db.server";

// Helper for hashing password with salt
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

// Helper for verifying password
function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculatedHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(calculatedHash, "hex"));
  } catch {
    return false;
  }
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserDTO;
  error?: string;
}

// Server Function: Register User
export const registerUserFn = createServerFn({ method: "POST" })
  .validator((data: RegisterInput) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const name = data.name?.trim();
      const email = data.email?.trim().toLowerCase();
      const password = data.password;

      if (!name || name.length < 2) {
        return { success: false, error: "Họ và tên phải có ít nhất 2 ký tự." };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return { success: false, error: "Địa chỉ email không hợp lệ." };
      }

      if (!password || password.length < 6) {
        return { success: false, error: "Mật khẩu phải chứa ít nhất 6 ký tự." };
      }

      // Ensure schema exists
      await initDb();
      const db = getDb();

      // Check if email already exists
      const existing = await db.execute({
        sql: "SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
        args: [email],
      });

      if (existing.rows.length > 0) {
        return {
          success: false,
          error: "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.",
        };
      }

      // Hash password
      const { hash, salt } = hashPassword(password);
      const createdAt = new Date().toISOString();

      // Insert new user
      const result = await db.execute({
        sql: "INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [name, email, hash, salt, createdAt],
      });

      const newId = Number(result.lastInsertRowid);

      return {
        success: true,
        user: {
          id: newId,
          name,
          email,
          createdAt,
        },
      };
    } catch (err: unknown) {
      console.error("Lỗi đăng ký:", err);
      return {
        success: false,
        error: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.",
      };
    }
  });

// Server Function: Login User
export const loginUserFn = createServerFn({ method: "POST" })
  .validator((data: LoginInput) => data)
  .handler(async ({ data }): Promise<AuthResponse> => {
    try {
      const email = data.email?.trim().toLowerCase();
      const password = data.password;

      if (!email || !password) {
        return { success: false, error: "Vui lòng nhập đầy đủ email và mật khẩu." };
      }

      // Ensure schema exists
      await initDb();
      const db = getDb();

      const result = await db.execute({
        sql: "SELECT id, name, email, password_hash, salt, created_at FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
        args: [email],
      });

      if (result.rows.length === 0) {
        return {
          success: false,
          error: "Email hoặc mật khẩu không chính xác.",
        };
      }

      const row = result.rows[0];
      if (!row) {
        return { success: false, error: "Email hoặc mật khẩu không chính xác." };
      }

      const passwordHash = row["password_hash"] as string;
      const saltVal = row["salt"] as string;

      const isMatch = verifyPassword(password, passwordHash, saltVal);
      if (!isMatch) {
        return {
          success: false,
          error: "Email hoặc mật khẩu không chính xác.",
        };
      }

      return {
        success: true,
        user: {
          id: Number(row["id"]),
          name: row["name"] as string,
          email: row["email"] as string,
          createdAt: row["created_at"] as string,
        },
      };
    } catch (err: unknown) {
      console.error("Lỗi đăng nhập:", err);
      return {
        success: false,
        error: "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.",
      };
    }
  });
