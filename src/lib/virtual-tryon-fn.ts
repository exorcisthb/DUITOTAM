// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

// Use VITE_ prefix like chat-bot.tsx
const GEMINI_API_KEY = import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined;

function getClient(): GoogleGenAI | null {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_key_here") return null;
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(",");
      const base64 = parts.length > 1 ? parts[1] : "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface TryOnRequest {
  personImageBase64: string;
  personImageMimeType: string;
  clothingImageBase64: string;
  clothingImageMimeType: string;
}

export interface TryOnResponse {
  success: boolean;
  resultImageUrl?: string;
  error?: string;
}

export const virtualTryOnFn = createServerFn({ method: "POST" })
  .validator(async (formData: FormData) => {
    const personFile = formData.get("personImage") as File | null;
    const clothingFile = formData.get("clothingImage") as File | null;

    if (!personFile || !clothingFile) {
      throw new Error("Thiếu ảnh người hoặc ảnh sản phẩm");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(personFile.type) || !allowedTypes.includes(clothingFile.type)) {
      throw new Error("Chỉ hỗ trợ ảnh JPEG, PNG, WebP");
    }

    const maxSize = 10 * 1024 * 1024;
    if (personFile.size > maxSize || clothingFile.size > maxSize) {
      throw new Error("Ảnh không được vượt quá 10MB");
    }

    const personBase64 = await fileToBase64(personFile);
    const clothingBase64 = await fileToBase64(clothingFile);

    return {
      personImageBase64: personBase64,
      personImageMimeType: personFile.type,
      clothingImageBase64: clothingBase64,
      clothingImageMimeType: clothingFile.type,
    };
  })
  .handler(async ({ data }): Promise<TryOnResponse> => {
    try {
      const client = getClient();
      if (!client) {
        return { success: false, error: "Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm vào .env" };
      }

      const prompt = `Bạn là một chuyên gia công nghệ thử đồ ảo (Virtual Try-On). Nhiệm vụ: ghép người trong ảnh thứ nhất mặc trang phục trong ảnh thứ hai.

Yêu cầu chi tiết:
1. Giữ nguyên khuôn mặt, dáng người, tư thế, màu da, tỷ lệ cơ thể của người trong ảnh 1
2. Giữ nguyên bối cảnh, nền, ánh sáng của ảnh 1
3. Chỉ thay đổi trang phục: thay bằng trang phục từ ảnh 2 (áo/quần/đầm...), fit tự nhiên vào cơ thể người
4. Xử lý tự nhiên các chi tiết: cổ áo, tay áo, đường cắt, nếp gấp, bóng đổ phù hợp với tư thế
5. Không bị biến dạng, méo mó, mất tỷ lệ. Kết quả phải nhìn như một bức ảnh thật chụp từ đời thực.

Trả về ảnh kết quả chất lượng cao.`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: data.personImageMimeType,
                  data: data.personImageBase64,
                },
              },
              {
                inlineData: {
                  mimeType: data.clothingImageMimeType,
                  data: data.clothingImageBase64,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        return { success: false, error: "Model không trả về kết quả" };
      }

      const parts = candidates[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        return { success: false, error: "Không có dữ liệu ảnh trả về" };
      }

      let imageData: string | null = null;
      let imageMimeType = "image/png";

      for (const part of parts) {
        if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType || "image/png";
          break;
        }
      }

      if (!imageData) {
        return { success: false, error: "Model không sinh ra ảnh (chỉ trả text). Thử lại với ảnh khác." };
      }

      const resultImageUrl = `data:${imageMimeType};base64,${imageData}`;
      return { success: true, resultImageUrl };
    } catch (err: unknown) {
      console.error("Virtual Try-On error:", err);
      const message = err instanceof Error ? err.message : "Lỗi không xác định khi gọi Gemini API";
      return { success: false, error: `Lỗi API: ${message}` };
    }
  });