// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";
import { Client } from "@gradio/client";

function getApiKey(): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    if (process.env["VITE_GEMINI_API_KEY"]) return process.env["VITE_GEMINI_API_KEY"];
    if (process.env["GEMINI_API_KEY"]) return process.env["GEMINI_API_KEY"];
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env["VITE_GEMINI_API_KEY"]) return import.meta.env["VITE_GEMINI_API_KEY"] as string;
    if (import.meta.env["GEMINI_API_KEY"]) return import.meta.env["GEMINI_API_KEY"] as string;
  }
  return undefined;
}

function getClient(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key || key === "your_key_here") return null;
  return new GoogleGenAI({ apiKey: key });
}

async function fileToBase64(file: File): Promise<string> {
  if (typeof file.arrayBuffer === "function") {
    const buffer = await file.arrayBuffer();
    if (typeof Buffer !== "undefined") {
      return Buffer.from(buffer).toString("base64");
    }
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  throw new Error("Không thể chuyển đổi file sang base64");
}

export interface TryOnRequest {
  personImageBase64: string;
  personImageMimeType: string;
  clothingImageBase64: string;
  clothingImageMimeType: string;
  productName?: string;
  productTone?: string;
}

export interface TryOnResponse {
  success: boolean;
  resultImageUrl?: string;
  error?: string;
  promptUsed?: string;
}

export const virtualTryOnFn = createServerFn({ method: "POST" })
  .validator(async (formData: FormData) => {
    const personFile = formData.get("personImage") as File | null;
    const clothingFile = formData.get("clothingImage") as File | null;
    const productName = (formData.get("productName") as string) || "";
    const productTone = (formData.get("productTone") as string) || "";

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
      productName,
      productTone,
    };
  })
  .handler(async ({ data }): Promise<TryOnResponse> => {
    try {
      // ---------------------------------------------------------
      // METHOD 1: REAL FACE SWAP (Swaps the person's real face onto the model wearing that exact clothing item)
      // ---------------------------------------------------------
      try {
        console.log("Starting Face Swap AI engine...");
        const targetBuffer = Buffer.from(data.clothingImageBase64, "base64");
        const sourceBuffer = Buffer.from(data.personImageBase64, "base64");

        const targetBlob = new Blob([targetBuffer], { type: data.clothingImageMimeType || "image/jpeg" });
        const sourceBlob = new Blob([sourceBuffer], { type: data.personImageMimeType || "image/jpeg" });

        const app = await Client.connect("felixrosberg/face-swap");
        const swapResult = await app.predict("/run_inference", [
          targetBlob, // Target: clothing image
          sourceBlob, // Source: user's face photo
          0,          // Anonymization ratio 0
          0,          // Adversarial defense ratio 0
          [],         // Mode
        ]);

        if (swapResult?.data && Array.isArray(swapResult.data) && swapResult.data[0]?.url) {
          const swappedUrl = swapResult.data[0].url;
          console.log("Face swap success! Fetching image from:", swappedUrl);
          const imgRes = await fetch(swappedUrl);
          if (imgRes.ok) {
            const buf = await imgRes.arrayBuffer();
            const b64 = Buffer.from(buf).toString("base64");
            return {
              success: true,
              resultImageUrl: `data:image/webp;base64,${b64}`,
            };
          }
        }
      } catch (swapErr) {
        console.warn("Face swap model error, falling back to Gemini Vision synthesis:", swapErr);
      }

      // ---------------------------------------------------------
      // METHOD 2: GEMINI 3.8 FLASH VISION + HIGH RESOLUTION SYNTHESIS
      // ---------------------------------------------------------
      const client = getClient();
      if (!client) {
        return { success: false, error: "Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra file .env" };
      }

      console.log("Analyzing with Gemini 3.8 Flash...");
      const pName = data.productName || "Vietnamese raw silk dress";
      const pTone = data.productTone || "natural silk";

      const visionPrompt = `You are a fashion stylist.
Look at Image 1 (a photo of a person: accurately identify their face, hair style, facial structure, skin tone, gender) and Image 2 (a photo of ${pName} in ${pTone}).
Write a concise 50-word English prompt for a photorealistic fashion photo showing that exact person wearing that exact silk outfit in a modern studio.
Return ONLY the prompt text, no formatting.`;

      let generatedPrompt = "";
      try {
        const analysisResponse = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: visionPrompt },
                { inlineData: { mimeType: data.personImageMimeType, data: data.personImageBase64 } },
                { inlineData: { mimeType: data.clothingImageMimeType, data: data.clothingImageBase64 } },
              ],
            },
          ],
        });

        generatedPrompt = analysisResponse.text?.trim() || "";
      } catch (gErr) {
        console.warn("Gemini vision prompt error:", gErr);
        generatedPrompt = `Photorealistic full-length fashion portrait of the person wearing luxury handcrafted ${pName} in ${pTone}, beautiful soft lighting, 8k`;
      }

      const seed = Math.floor(Math.random() * 900000) + 100000;
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedPrompt)}?width=768&height=1024&nologo=true&seed=${seed}`;

      const imageResponse = await fetch(imageUrl);
      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        const b64 = Buffer.from(imageBuffer).toString("base64");
        return {
          success: true,
          resultImageUrl: `data:image/jpeg;base64,${b64}`,
          promptUsed: generatedPrompt,
        };
      }

      throw new Error("Không thể tạo ảnh thử đồ qua cả hai phương thức");
    } catch (err: unknown) {
      console.error("Virtual Try-On pipeline error:", err);
      const message = err instanceof Error ? err.message : "Lỗi không xác định khi tạo ảnh thử đồ";
      return { success: false, error: message };
    }
  });