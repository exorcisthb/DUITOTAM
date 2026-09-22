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
    (p) => `- ${p.name} | category: ${p.category} | giá: ${p.price} | màu: ${p.tone} | slug: ${p.slug}`
  ).join("\n");
  return `Bạn là trợ lý thời trang AI của thương hiệu "Maison de Silk" — thương hiệu thời trang cao cấp chuyên về lụa tơ tằm và đũi thủ công Việt Nam. Bạn tên là "Maison AI Stylist".

Nhiệm vụ:
• Tư vấn size, phối đồ, giới thiệu sản phẩm phù hợp.
• Giải đáp chính sách: vận chuyển miễn phí toàn quốc 2-3 ngày, đổi trả 7 ngày.
• Giới thiệu sản phẩm từ danh mục sau:
${productList}

Bảng size:
• S: 42-48 kg, ngực 80-84 cm
• M: 49-54 kg, ngực 85-89 cm
• L: 55-60 kg, ngực 90-94 cm
• XL: 61-67 kg, ngực 95-100 cm

Quy tắc quan trọng về việc trả lời:
1. Luôn dùng tiếng Việt, lịch sự, trả lời NGẮN GỌN, SÚC TÍCH, ĐÚNG TRỌNG TÂM (khoảng 2-4 câu), vừa đủ để giải đáp đúng ý người dùng, tuyệt đối không viết dài dòng lê thê.
2. Khi đề cập đến bất kỳ sản phẩm nào, HÃY ĐẶT TAG [PRODUCT:slug] ngay sau tên sản phẩm đó. Ví dụ: "Chúng tôi gợi ý mẫu Áo dài Mây [PRODUCT:ao-dai-may] cho bạn."
3. Mỗi tin nhắn có thể tag nhiều sản phẩm nếu phù hợp.
4. Chỉ dùng slug có trong danh sách trên, không tự tạo slug ngoài danh mục.
5. GIỚI HẠN PHẠM VI NGHIÊM NGẶT TRONG WEBSITE: Bạn CHỈ ĐƯỢC PHÉP tư vấn về thời trang, trang phục đũi tơ tằm, cách chọn size, phối đồ, cách giặt ủi và các chính sách mua hàng của Maison de Silk. TUYỆT ĐỐI KHÔNG giải toán, làm văn, viết thơ, lập trình, viết code, dịch thuật tổng hợp hay trả lời các câu hỏi kiến thức ngoài phạm vi cửa hàng. Nếu gặp câu hỏi ngoài phạm vi, hãy từ chối lịch sự và ngắn gọn: "Dạ, tôi là trợ lý thời trang của Maison de Silk nên chỉ hỗ trợ tư vấn trang phục lụa đũi và dịch vụ mua sắm của cửa hàng thôi ạ. Quý khách cần tư vấn mẫu trang phục nào hôm nay không ạ?"
6. TUYỆT ĐỐI KHÔNG dùng định dạng markdown: không dùng dấu sao ** hay * để in đậm hoặc in nghiêng, không dùng dấu thăng # cho tiêu đề, không dùng ký tự code block. Chỉ dùng văn bản thuần túy và dấu chấm tròn • để liệt kê danh sách.`;
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

  // Strictly reject out-of-scope queries (math, essays, code, etc.)
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

  if (q.includes("size") || q.includes("kg") || q.includes("nặng") || q.includes("cao")) {
    return { text: "Bảng size Maison:\n• S: 42-48kg (ngực 80-84cm)\n• M: 49-54kg (ngực 85-89cm)\n• L: 55-60kg (ngực 90-94cm)\n• XL: 61-67kg (ngực 95-100cm)\nNếu ở giữa hai size, chọn size lớn hơn ạ!", suggestions: ["Xem Áo dài Mây", "Xem Đầm Nguyệt Quế"] };
  }
  if (q.includes("áo dài") || q.includes("mây")) {
    const p = PRODUCTS_DATA.find((i) => i.category === "Áo dài") ?? fb;
    return { text: `Mẫu "${p.name}" là tuyệt tác áo dài đũi tơ tằm thêu tay nổi bật nhất ạ!`, productLinks: [toLink(p)], suggestions: ["Tư vấn chọn size", "Chính sách vận chuyển"] };
  }
  if (q.includes("đầm") || q.includes("nguyệt quế")) {
    const p = PRODUCTS_DATA.find((i) => i.category === "Đầm") ?? (PRODUCTS_DATA[2] ?? fb);
    return { text: `Dòng đầm "${p.name}" sắc ${p.tone} mềm rủ thanh lịch, tôn da ạ.`, productLinks: [toLink(p)], suggestions: ["Cách giặt vải đũi"] };
  }
  if (q.includes("giặt") || q.includes("bảo quản") || q.includes("ủi")) {
    return { text: "Bảo quản đũi tơ tằm:\n1. Giặt tay nhẹ bằng dầu gội/sữa tắm.\n2. Không vò xoắn hoặc vắt máy.\n3. Phơi bóng râm.\n4. Là nhiệt độ lụa ạ!", suggestions: ["Chính sách đổi trả"] };
  }
  if (q.includes("vận chuyển") || q.includes("ship") || q.includes("đổi trả") || q.includes("giao")) {
    return { text: "Maison miễn phí vận chuyển toàn quốc! Giao 2-3 ngày, đổi size/mẫu trong 7 ngày ạ.", suggestions: ["Tư vấn chọn size"] };
  }
  return { text: "Maison de Silk sẵn lòng tư vấn về chất liệu, size, hoặc phối đồ. Quý khách có thể hỏi cụ thể hơn nhé ạ!", suggestions: QUICK_PROMPTS };
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
