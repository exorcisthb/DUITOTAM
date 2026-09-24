import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS_DATA } from "@/data/products";

interface ProductLink {
  slug: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  suggestions?: string[] | undefined;
  productLinks?: ProductLink[] | undefined;
}

const QUICK_PROMPTS = [
  "Tư vấn chọn size",
  "Mẫu áo dài đũi nổi bật",
  "Cách giặt & bảo quản vải tơ tằm",
  "Chính sách đổi trả & vận chuyển",
];

const GEMINI_API_KEY = import.meta.env["VITE_GEMINI_API_KEY"] as string | undefined;

const buildSystemPrompt = () => {
  const productList = PRODUCTS_DATA.map(
    (p) => `- ${p.name} | Danh mục: ${p.category} | Giá: ${p.price} (gốc ${p.originalPrice}, giảm ${p.discount}) | Màu: ${p.tone} | Đánh giá: ${p.rating}/5.0 (${p.reviewCount} lượt) | Đã bán: ${p.soldCount} sp | Tồn kho: ${p.stock} | Nhãn: ${p.tag || "Không"} | Slug: ${p.slug} | Mô tả: ${p.shortDesc}`
  ).join("\n");

  return `Bạn là "Maison AI Stylist" — trợ lý AI toàn năng của website thời trang cao cấp "Maison de Silk" (chuyên lụa tơ tằm và đũi thủ công Việt Nam).

DANH SÁCH TẤT CẢ SẢN PHẨM TRÊN WEBSITE:
${productList}

THÔNG TIN QUAN TRỌNG VỀ WEBSITE:
1. Sản phẩm bán chạy nhất:
   • Áo dài Mây (đã bán 450 sản phẩm) [PRODUCT:ao-dai-may]
   • Bộ Lam An (đã bán 380 sản phẩm) [PRODUCT:bo-lam-an]
   • Quần Nhàn (đã bán 290 sản phẩm) [PRODUCT:quan-nhan]
2. Sản phẩm đánh giá cao nhất (5.0 sao kèm nhiều đánh giá):
   • Áo dài Mây (5.0 sao - 128 đánh giá) [PRODUCT:ao-dai-may]
   • Đầm Nguyệt Quế (5.0 sao - 64 đánh giá) [PRODUCT:dam-nguyet-que]
   • Áo dài Tĩnh (5.0 sao - 41 đánh giá) [PRODUCT:ao-dai-tinh]
   • Đầm Thanh Diệp (5.0 sao - 38 đánh giá) [PRODUCT:dam-thanh-diep]
   • Áo dài Sương (5.0 sao - 22 đánh giá) [PRODUCT:ao-dai-suong]
3. Phân khúc giá:
   • Rẻ nhất / Giá thấp nhất: Áo An Nhiên (1.590.000₫) [PRODUCT:ao-an-nhien], Quần Nhàn (1.690.000₫) [PRODUCT:quan-nhan], Áo Lặng Yên (1.790.000₫) [PRODUCT:ao-lang-yen]
   • Đắt nhất / Cao cấp nhất: Áo dài Sương (4.590.000₫) [PRODUCT:ao-dai-suong], Áo dài Tĩnh (4.190.000₫) [PRODUCT:ao-dai-tinh], Áo dài Mây (3.890.000₫) [PRODUCT:ao-dai-may]
4. Bảng size & Tư vấn vóc dáng:
   • Size S: 42 - 48 kg | Vòng ngực 80 - 84 cm
   • Size M: 49 - 54 kg | Vòng ngực 85 - 89 cm
   • Size L: 55 - 60 kg | Vòng ngực 90 - 94 cm
   • Size XL: 61 - 67 kg | Vòng ngực 95 - 100 cm
   (Lưu ý: Nếu số đo giữa 2 size hoặc thích mặc rộng thoải mái theo phong cách đũi suông, khuyên khách chọn tăng 1 size).
5. Hướng dẫn đặt hàng & Mua sắm trên web:
   • Quý khách bấm vào xem chi tiết sản phẩm -> Chọn kích thước (S/M/L/XL), màu sắc -> Bấm "Thêm vào giỏ hàng" hoặc "Mua ngay" -> Đến trang Thanh toán, điền thông tin người nhận và lựa chọn phương thức thanh toán (COD hoặc chuyển khoản/thẻ).
6. Chính sách dịch vụ & Vận chuyển:
   • Vận chuyển: Miễn phí giao hàng toàn quốc (Hỏa tốc 2-4h nội thành Hà Nội/TP.HCM; Toàn quốc nhận sau 2-3 ngày).
   • Đổi trả: Hỗ trợ đổi size, đổi mẫu trong vòng 7 ngày kể từ khi nhận hàng nếu còn nguyên tem mác.
   • Bảo quản lụa đũi: Giặt tay nhẹ nhàng với sữa tắm hoặc dầu gội, không vắt xoắn mạnh, phơi trong bóng râm mát, ủi ở mức nhiệt độ thấp chuyên dụng cho lụa.

QUY TẮC BẮT BUỘC KHI TRẢ LỜI:
1. SẴN SÀNG TRẢ LỜI MỌI CÂU HỎI LIÊN QUAN ĐẾN CỬA HÀNG VÀ WEBSITE:
   Bao gồm: sản phẩm bán chạy, sản phẩm mới, sản phẩm đánh giá cao, rẻ nhất, đắt nhất, cách đặt hàng, hướng dẫn chọn size theo cân nặng chiều cao, chất liệu vải, phối đồ, giặt ủi, chính sách giao hàng, đổi trả, khuyến mãi, tồn kho, v.v. BẠN PHẢI TRẢ LỜI NHIỆT TÌNH, CHÍNH XÁC VÀ KHÔNG ĐƯỢC TỪ CHỐI các câu hỏi này.
2. Tag sản phẩm: Khi nhắc đến sản phẩm nào, LUÔN KÈM THEO TAG [PRODUCT:slug] ngay sau tên sản phẩm (chỉ dùng slug có trong danh sách trên).
3. Độ dài & Giọng điệu: Dùng tiếng Việt chuẩn mực, lịch sự, thân thiện, trả lời ngắn gọn súc tích (khoảng 2-4 câu hoặc gạch đầu dòng rõ ràng), đi thẳng vào câu hỏi của khách hàng.
4. Phạm vi từ chối: CHỈ từ chối những chủ đề HOÀN TOÀN KHÔNG LIÊN QUAN ĐẾN THỜI TRANG HAY CỬA HÀNG như: giải toán, làm thơ, viết văn thi đại học, viết mã code/lập trình, phân tích lịch sử/chính trị thế giới. Lúc đó từ chối lịch sự: "Dạ, tôi là trợ lý thời trang của Maison de Silk nên chỉ hỗ trợ tư vấn trang phục lụa đũi và dịch vụ mua sắm của cửa hàng thôi ạ. Quý khách cần tư vấn mẫu trang phục nào hôm nay không ạ?"
5. Không dùng markdown rườm rà: Không dùng **, *, #, codeblock. Dùng văn bản thuần túy và dấu chấm tròn • để liệt kê.`;
};

// Strip residual markdown formatting Gemini may output despite instructions
const stripMarkdown = (text: string): string =>
  text
    .replace(/\*\*(.*?)\*\*/gs, "$1") // **bold** → plain
    .replace(/\*(.*?)\*/gs, "$1")     // *italic* → plain
    .replace(/_{1,2}(.*?)_{1,2}/gs, "$1") // __bold__ or _italic_ → plain
    .replace(/#{1,6}\s+/g, "")        // ## heading → remove hashes
    .replace(/`{1,3}[^`]*`{1,3}/g, "")// `code` → remove
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text only
    .replace(/\*{1,3}/g, "")          // clean any stray asterisks
    .trim();

// Parse Gemini reply: strip [PRODUCT:slug] tags → clean text + product link list
const parseGeminiReply = (raw: string): { text: string; productLinks: ProductLink[] } => {
  const seen = new Set<string>();
  const productLinks: ProductLink[] = [];
  const textWithoutTags = raw.replace(/\[PRODUCT:([a-z0-9-]+)\]/gi, (_, slug: string) => {
    const cleanSlug = slug.toLowerCase();
    if (!seen.has(cleanSlug)) {
      seen.add(cleanSlug);
      const p = PRODUCTS_DATA.find((item) => item.slug === cleanSlug);
      if (p) productLinks.push({ slug: p.slug, name: p.name, price: p.price, image: p.image, category: p.category });
    }
    return ""; // remove tag from displayed text
  });
  const text = stripMarkdown(textWithoutTags).replace(/[ \t]+/g, " ").trim();
  return { text, productLinks };
};

const localFallback = (q2: string): { text: string; productLinks?: ProductLink[] | undefined; suggestions?: string[] | undefined } => {
  const q = q2.toLowerCase();
  const fb = PRODUCTS_DATA[0]!;
  const toLink = (p: typeof fb): ProductLink => ({ slug: p.slug, name: p.name, price: p.price, image: p.image, category: p.category });

  // Strictly reject unrelated queries (math, essays, programming, etc.)
  if (
    q.includes("toán") ||
    q.includes("làm văn") ||
    q.includes("viết văn") ||
    q.includes("bài văn") ||
    q.includes("thơ") ||
    q.includes("code") ||
    q.includes("lập trình") ||
    q.includes("bài tập") ||
    q.includes("vật lý") ||
    q.includes("hóa học") ||
    q.includes("lịch sử") ||
    /[0-9+\-*/=^]{4,}/.test(q)
  ) {
    return {
      text: "Dạ, tôi là trợ lý thời trang của Maison de Silk nên chỉ hỗ trợ tư vấn trang phục lụa đũi và dịch vụ mua sắm của cửa hàng thôi ạ. Quý khách cần tư vấn mẫu trang phục nào hôm nay không ạ?",
      suggestions: QUICK_PROMPTS,
    };
  }

  // 1. Best sellers (bán chạy)
  if (q.includes("bán chạy") || q.includes("hot") || q.includes("mua nhiều") || q.includes("bán nhiều")) {
    const topProducts = [...PRODUCTS_DATA].sort((a, b) => b.soldCount - a.soldCount).slice(0, 3);
    return {
      text: `Sản phẩm bán chạy nhất hiện nay của Maison de Silk là ${topProducts[0]?.name} (đã bán ${topProducts[0]?.soldCount} lượt), tiếp theo là ${topProducts[1]?.name} (${topProducts[1]?.soldCount} lượt) và ${topProducts[2]?.name} (${topProducts[2]?.soldCount} lượt) ạ.`,
      productLinks: topProducts.map(toLink),
      suggestions: ["Sản phẩm đánh giá cao", "Tư vấn chọn size", "Sản phẩm rẻ nhất"],
    };
  }

  // 2. Highest rated (đánh giá cao, rating, sao, review)
  if (q.includes("đánh giá") || q.includes("rating") || q.includes("review") || q.includes("khen") || (q.includes("sao") && (q.includes("cao") || q.includes("5")))) {
    const topRated = [...PRODUCTS_DATA].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount).slice(0, 3);
    return {
      text: `Các sản phẩm nhận được đánh giá cao nhất với số điểm tuyệt đối 5.0 sao là ${topRated[0]?.name} (${topRated[0]?.reviewCount} đánh giá), ${topRated[1]?.name} (${topRated[1]?.reviewCount} đánh giá) và ${topRated[2]?.name} ạ!`,
      productLinks: topRated.map(toLink),
      suggestions: ["Sản phẩm bán chạy nhất", "Tư vấn chọn size"],
    };
  }

  // 3. Lowest price (rẻ nhất, giá thấp, tiết kiệm)
  if (q.includes("rẻ nhất") || q.includes("thấp nhất") || q.includes("giá mềm") || q.includes("giá rẻ")) {
    const cheapest = [...PRODUCTS_DATA].sort((a, b) => a.priceNumber - b.priceNumber).slice(0, 2);
    return {
      text: `Sản phẩm có mức giá mềm nhất hiện tại là ${cheapest[0]?.name} với giá ${cheapest[0]?.price}, tiếp theo là ${cheapest[1]?.name} (${cheapest[1]?.price}) ạ.`,
      productLinks: cheapest.map(toLink),
      suggestions: ["Sản phẩm đắt nhất", "Sản phẩm bán chạy nhất"],
    };
  }

  // 4. Highest price (đắt nhất, cao cấp nhất, giá cao)
  if (q.includes("đắt nhất") || q.includes("cao nhất") || q.includes("cao cấp nhất") || q.includes("sang trọng nhất")) {
    const mostExpensive = [...PRODUCTS_DATA].sort((a, b) => b.priceNumber - a.priceNumber).slice(0, 2);
    return {
      text: `Sản phẩm cao cấp có giá cao nhất của cửa hàng là ${mostExpensive[0]?.name} (${mostExpensive[0]?.price}) thêu thủ công tinh xảo, cùng với ${mostExpensive[1]?.name} (${mostExpensive[1]?.price}) ạ.`,
      productLinks: mostExpensive.map(toLink),
      suggestions: ["Sản phẩm rẻ nhất", "Sản phẩm bán chạy nhất"],
    };
  }

  // 5. How to order (đặt hàng, mua hàng, thanh toán)
  if (q.includes("đặt hàng") || q.includes("mua hàng") || q.includes("thanh toán") || q.includes("cách mua") || q.includes("order")) {
    return {
      text: "Để đặt hàng trên website: Quý khách chọn sản phẩm ưng ý, chọn size và màu sắc rồi bấm 'Thêm vào giỏ' hoặc 'Mua ngay'. Sau đó nhập thông tin giao hàng và chọn phương thức thanh toán (COD hoặc chuyển khoản) là hoàn tất ạ!",
      suggestions: ["Chính sách vận chuyển", "Tư vấn chọn size"],
    };
  }

  // 6. Size consultation
  if (q.includes("size") || q.includes("kg") || q.includes("nặng") || q.includes("cao") || q.includes("kích cỡ") || q.includes("vừa không")) {
    return {
      text: "Bảng size chuẩn của Maison de Silk:\n• S: 42-48 kg (vòng ngực 80-84 cm)\n• M: 49-54 kg (vòng ngực 85-89 cm)\n• L: 55-60 kg (vòng ngực 90-94 cm)\n• XL: 61-67 kg (vòng ngực 95-100 cm)\nNếu quý khách phân vân giữa hai size hoặc thích dáng suông rộng rãi, nên chọn tăng 1 size ạ!",
      suggestions: ["Xem Áo dài Mây", "Xem Bộ Lam An"],
    };
  }

  // 7. Categories: Áo dài
  if (q.includes("áo dài")) {
    const items = PRODUCTS_DATA.filter((i) => i.category === "Áo dài").slice(0, 2);
    return {
      text: `Maison de Silk tự hào với các tuyệt tác Áo dài đũi tơ tằm thêu tay như "${items[0]?.name}" (${items[0]?.price}) và "${items[1]?.name}" (${items[1]?.price}) tôn vinh nét đẹp truyền thống Việt.`,
      productLinks: items.map(toLink),
      suggestions: ["Tư vấn chọn size", "Chính sách vận chuyển"],
    };
  }

  // 8. Categories: Đầm
  if (q.includes("đầm") || q.includes("váy")) {
    const items = PRODUCTS_DATA.filter((i) => i.category === "Đầm").slice(0, 2);
    return {
      text: `Các mẫu đầm lụa đũi như "${items[0]?.name}" (${items[0]?.price}) và "${items[1]?.name}" (${items[1]?.price}) có độ rủ mềm mại, phom dáng suông bay bổng rất tôn dáng và sang trọng ạ.`,
      productLinks: items.map(toLink),
      suggestions: ["Cách giặt vải đũi", "Tư vấn chọn size"],
    };
  }

  // 9. Categories: Quần & Đồ thường nhật
  if (q.includes("quần") || q.includes("bộ") || q.includes("hằng ngày")) {
    const items = PRODUCTS_DATA.filter((i) => i.category === "Quần" || i.category === "Trang phục hằng ngày").slice(0, 2);
    return {
      text: `Dòng trang phục hằng ngày và quần suông đũi như "${items[0]?.name}" và "${items[1]?.name}" mang phong cách thiền tối giản, thoáng mát tối đa cho mọi hoạt động.`,
      productLinks: items.map(toLink),
      suggestions: ["Tư vấn chọn size", "Chính sách đổi trả"],
    };
  }

  // 10. Washing & Care
  if (q.includes("giặt") || q.includes("bảo quản") || q.includes("ủi") || q.includes("là")) {
    return {
      text: "Hướng dẫn chăm sóc lụa đũi tơ tằm:\n• Giặt tay nhẹ bằng nước lạnh pha dầu gội hoặc sữa tắm dịu nhẹ.\n• Tuyệt đối không vò xoắn hay vắt mạnh bằng máy.\n• Phơi nơi râm mát, tránh ánh nắng gắt trực tiếp.\n• Ủi ở mức nhiệt độ thấp dành riêng cho lụa.",
      suggestions: ["Chính sách đổi trả", "Tư vấn chọn size"],
    };
  }

  // 11. Shipping & Returns
  if (q.includes("vận chuyển") || q.includes("ship") || q.includes("đổi trả") || q.includes("giao") || q.includes("phí")) {
    return {
      text: "Chính sách mua sắm tại Maison de Silk:\n• Vận chuyển: Miễn phí toàn quốc, nhận hàng sau 2-3 ngày (nội thành 2-4h).\n• Đổi trả: Hỗ trợ đổi size hoặc đổi mẫu trong vòng 7 ngày kể từ khi nhận hàng nếu còn nguyên vẹn tem mác ạ.",
      suggestions: ["Tư vấn chọn size", "Sản phẩm bán chạy nhất"],
    };
  }

  return {
    text: "Maison de Silk sẵn lòng giải đáp mọi thông tin về sản phẩm, tư vấn size theo vóc dáng, cách đặt hàng hay các chính sách mua sắm. Quý khách đang quan tâm đến nội dung nào ạ?",
    suggestions: ["Sản phẩm bán chạy nhất", "Sản phẩm đánh giá cao", "Tư vấn chọn size", "Cách thức đặt hàng"],
  };
};

let _genaiClient: GoogleGenAI | null = null;
const getClient = (): GoogleGenAI | null => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") return null;
  if (!_genaiClient) _genaiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return _genaiClient;
};

const chatHistory: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Kính chào quý khách! Tôi là trợ lý thời trang Maison de Silk. Tôi có thể hỗ trợ quý khách chọn size theo vóc dáng, giới thiệu các mẫu đũi tơ tằm thủ công hoặc tư vấn cách bảo quản nếp áo. Quý khách đang quan tâm đến điều gì?",
      timestamp: "Vừa xong",
      suggestions: QUICK_PROMPTS,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setApiError(null);

    const client = getClient();
    if (client) {
      try {
        chatHistory.push({ role: "user", parts: [{ text: query }] });
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: chatHistory,
          config: { systemInstruction: buildSystemPrompt(), temperature: 0.6, maxOutputTokens: 1024 },
        });
        const { text: replyText, productLinks } = parseGeminiReply(
          response.text?.trim() || "Xin lỗi, tôi chưa hiểu rõ. Quý khách có thể diễn đạt lại không ạ?"
        );
        chatHistory.push({ role: "model", parts: [{ text: replyText }] });
        setMessages((prev) => [...prev, {
          id: `bot-${Date.now()}`, sender: "bot", text: replyText,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          productLinks: productLinks.length > 0 ? productLinks : undefined,
        }]);
      } catch (err) {
        console.error("Gemini error:", err);
        setApiError(err instanceof Error ? err.message : "Lỗi kết nối");
        const reply = localFallback(query);
        setMessages((prev) => [...prev, {
          id: `bot-${Date.now()}`, sender: "bot", text: reply.text,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          productLinks: reply.productLinks, suggestions: reply.suggestions,
        }]);
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      const reply = localFallback(query);
      setMessages((prev) => [...prev, {
        id: `bot-${Date.now()}`, sender: "bot", text: reply.text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        productLinks: reply.productLinks, suggestions: reply.suggestions,
      }]);
    }
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Unread hint tooltip badge */}
        {!isOpen && hasUnread && (
          <button
            onClick={handleOpen}
            className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-xs font-medium text-foreground shadow-xl backdrop-blur-md transition-all hover:scale-105 animate-in fade-in"
          >
            <span className="size-2 rounded-full bg-accent animate-ping" />
            <span>Chat với Trợ lý Maison AI</span>
          </button>
        )}

        {/* Circular Floating Button */}
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          aria-label="Mở khung trò chuyện hỗ trợ"
          className="relative grid size-14 place-items-center rounded-full bg-foreground text-background shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-border/40"
        >
          {isOpen ? (
            <X className="size-6 text-background transition-transform duration-300 rotate-90" />
          ) : (
            <>
              <MessageCircle className="size-6 text-background" />
              {/* Online pulse dot */}
              <span className="absolute right-0.5 top-0.5 flex size-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-3.5 rounded-full border-2 border-background bg-accent" />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Cửa sổ trò chuyện với trợ lý"
          className="fixed bottom-24 right-4 sm:right-6 z-40 flex h-[530px] max-h-[82vh] w-[92vw] sm:w-[390px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 bg-primary px-4 py-3.5 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="relative grid size-9 place-items-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
                <img src="/logo-white.png" alt="Maison" className="size-5 object-contain" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-primary bg-green-500" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-semibold tracking-wide text-primary-foreground">
                    Maison AI Stylist
                  </h3>
                  <Sparkles className="size-3 text-accent" />
                </div>
                <p className="text-[0.65rem] text-primary-foreground/70 leading-none mt-0.5">
                  Tư vấn thời trang tơ tằm • Trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chat"
              className="grid size-7 place-items-center rounded-full text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-2 text-[0.65rem] text-yellow-800">
              ⚠ Kết nối Gemini tạm gián đoạn. Đang dùng chế độ nội bộ.
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-secondary/15">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[0.65rem] font-bold">
                    M
                  </div>
                )}
                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-line shadow-xs ${
                      m.sender === "user"
                        ? "bg-foreground text-background rounded-tr-none"
                        : "bg-background border border-border/80 text-foreground rounded-tl-none"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Product Recommendation Cards */}
                  {m.productLinks && m.productLinks.length > 0 && (
                    <div className="space-y-2">
                      {m.productLinks.map((pl) => (
                        <Link
                          key={pl.slug}
                          to="/product/$id"
                          params={{ id: pl.slug }}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 p-2.5 hover:bg-accent/20 transition-all text-foreground group"
                        >
                          <img
                            src={pl.image}
                            alt={pl.name}
                            className="size-14 rounded-lg object-cover shrink-0 border border-border/50"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-foreground group-hover:text-accent transition-colors truncate">
                              {pl.name}
                            </p>
                            <p className="text-[0.65rem] text-muted-foreground mt-0.5">{pl.category}</p>
                            <p className="text-[0.7rem] font-bold text-accent mt-0.5">{pl.price}</p>
                          </div>
                          <span className="shrink-0 inline-flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wider text-accent group-hover:underline">
                            Xem <ArrowRight className="size-3" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void handleSend(prompt)}
                          className="rounded-full border border-border bg-background/95 px-3 py-1 text-[0.68rem] text-muted-foreground hover:border-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[0.6rem] text-muted-foreground/60 ${
                      m.sender === "user" ? "text-right mr-1" : "ml-1"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[0.65rem] font-bold">
                  M
                </div>
                <div className="rounded-2xl rounded-tl-none border border-border/80 bg-background px-3.5 py-2 flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.2s]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="border-t border-border bg-background p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi cần tư vấn..."
              disabled={isTyping}
              className="flex-1 rounded-full border border-border bg-secondary/30 px-4 py-2 text-xs outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Gửi tin nhắn"
              className={`grid size-9 place-items-center rounded-full transition-all cursor-pointer ${
                input.trim() && !isTyping
                  ? "bg-foreground text-background hover:bg-foreground/90 scale-100"
                  : "bg-secondary text-muted-foreground/40 cursor-not-allowed scale-95"
              }`}
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
