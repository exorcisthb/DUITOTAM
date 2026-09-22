import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";
import silkDetail from "@/assets/silk-detail.jpg";

export interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  variation: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  sellerReply?: string;
}

export interface ProductData {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  priceNumber: number;
  originalPrice: string;
  discount: string;
  image: string;
  gallery: string[];
  tone: string;
  tag?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  shortDesc: string;
  description: string[];
  specifications: { label: string; value: string }[];
  reviews: ReviewItem[];
}

export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PRODUCTS_DATA: ProductData[] = [
  {
    id: "ao-dai-may",
    slug: "ao-dai-may",
    name: "Áo dài Mây",
    category: "Áo dài",
    price: "3.890.000₫",
    priceNumber: 3890000,
    originalPrice: "4.500.000₫",
    discount: "-14%",
    image: ivory,
    gallery: [ivory, silkDetail, green, charcoal],
    tone: "Ngà nguyên bản",
    tag: "Mới",
    rating: 5.0,
    reviewCount: 128,
    soldCount: 450,
    stock: 24,
    shortDesc: "Áo dài đũi tơ tằm thêu tay tỉ mỉ, bề mặt mộc mạc và mềm rủ tự nhiên.",
    description: [
      "Áo dài Mây là sự kết tinh của nghệ thuật dệt đũi cổ truyền và phom dáng áo dài thanh tao đương đại. Từng thớ sợi được rút từ kén tơ thô, giữ trọn vẹn lớp keo sericin tự nhiên giúp vải có độ xốp nhẹ và thoáng mát kỳ diệu.",
      "Cổ áo đứng 2.5cm truyền thống tôn vinh nét kín đáo, thanh thoát của người phụ nữ Việt. Hàng cúc bọc vải đũi đồng điệu và đường may giấu chỉ tinh xảo bởi các nghệ nhân lành nghề.",
      "Vải nhuộm màu ngà tự nhiên không tẩy hoá chất, thân thiện tuyệt đối với làn da nhạy cảm và ngày càng mềm mại theo thời gian sử dụng."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm tự nhiên" },
      { label: "Kỹ thuật dệt", value: "Dệt khung cửi thủ công truyền thống" },
      { label: "Nơi sản xuất", value: "Làng nghề tơ tằm Nha Xá, Hà Nam, Việt Nam" },
      { label: "Kiểu dáng", value: "Áo dài truyền thống cách tân nhẹ, tay raglan suông" },
      { label: "Mùa phù hợp", value: "Mặc 4 mùa, thoáng mát mùa hè, ấm áp mùa thu đông" },
      { label: "Bảo quản", value: "Giặt tay nhẹ nhàng với dầu gội/sữa tắm, phơi trong bóng râm" }
    ],
    reviews: [
      {
        id: "rev-1",
        userName: "thuha_hanoi***",
        rating: 5,
        date: "2026-09-15 14:32",
        variation: "Màu: Ngà nguyên bản, Size: M",
        comment: "Áo đẹp xuất sắc ngoài mong đợi! Chất đũi sờ vào mát rượi, có độ xốp bồng bềnh rất sang. Mặc đi tiệc ai cũng khen nét truyền thống mà vẫn hiện đại. Shop tư vấn size cực kỳ chuẩn.",
        images: [ivory, silkDetail],
        helpfulCount: 24,
        sellerReply: "Maison de Silk chân thành cảm ơn chị Thu Hà đã tin tưởng lựa chọn tơ tằm Việt! Chúc chị luôn rạng ngời và an yên trong nếp áo đũi."
      },
      {
        id: "rev-2",
        userName: "lananh_saigon***",
        rating: 5,
        date: "2026-09-10 09:18",
        variation: "Màu: Ngà nguyên bản, Size: L",
        comment: "Đóng gói như một món quà nghệ thuật, mở hộp ra thơm mùi thảo mộc dễ chịu. Từng đường kim mũi chỉ rất đều và kỹ. Đáng từng đồng bỏ ra.",
        helpfulCount: 16
      },
      {
        id: "rev-3",
        userName: "myduyen_hue***",
        rating: 5,
        date: "2026-08-28 17:45",
        variation: "Màu: Ngà nguyên bản, Size: S",
        comment: "Mình là người kỹ tính về vải tự nhiên nhưng thực sự bị thuyết phục bởi chất đũi tơ của Maison. Rất nhẹ, mặc không bị bí như tơ pha ni lông.",
        helpfulCount: 9
      }
    ]
  },
  {
    id: "bo-lam-an",
    slug: "bo-lam-an",
    name: "Bộ Lam An",
    category: "Trang phục hằng ngày",
    price: "2.490.000₫",
    priceNumber: 2490000,
    originalPrice: "2.900.000₫",
    discount: "-14%",
    image: charcoal,
    gallery: [charcoal, silkDetail, ivory],
    tone: "Than tre",
    tag: "Bán chạy",
    rating: 4.9,
    reviewCount: 96,
    soldCount: 380,
    stock: 18,
    shortDesc: "Set đồ mặc thường nhật đũi tơ thô nhuộm màu than tre trầm ấm, phong cách tối giản thiền vị.",
    description: [
      "Bộ Lam An được thiết kế với tâm niệm mang lại sự an yên tối đa cho người mặc trong cuộc sống bận rộn. Phom áo buông lơi tự nhiên phối cùng quần ống suông rộng rãi.",
      "Màu sắc được xử lý bằng bột than tre tự nhiên và sắc thảo mộc, tạo nên gam màu trầm ấm, mộc mạc và bền bỉ theo năm tháng.",
      "Chất vải đũi tơ tằm có khả năng điều hoà nhiệt độ cơ thể, thấm hút mồ hôi vượt trội."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm thiên nhiên" },
      { label: "Màu nhuộm", value: "Thảo mộc tự nhiên & Than tre" },
      { label: "Kiểu dáng", value: "Áo suông vạt lửng + Quần ống rộng cạp chun" },
      { label: "Xuất xứ", value: "Việt Nam" }
    ],
    reviews: [
      {
        id: "rev-b1",
        userName: "quynhtrang***",
        rating: 5,
        date: "2026-09-12 11:20",
        variation: "Màu: Than tre, Size: M",
        comment: "Mặc đi thiền hoặc dạo phố đều cực kỳ thoải mái và sang. Màu than tre rất tôn da.",
        helpfulCount: 12
      }
    ]
  },
  {
    id: "dam-nguyet-que",
    slug: "dam-nguyet-que",
    name: "Đầm Nguyệt Quế",
    category: "Đầm",
    price: "3.290.000₫",
    priceNumber: 3290000,
    originalPrice: "3.800.000₫",
    discount: "-13%",
    image: green,
    gallery: [green, silkDetail, ivory],
    tone: "Lá dâu",
    tag: "Độc bản",
    rating: 5.0,
    reviewCount: 64,
    soldCount: 210,
    stock: 12,
    shortDesc: "Đầm suông xẻ tà đũi tơ sắc lá dâu thanh nhã, tôn lên nét thanh lịch quý phái.",
    description: [
      "Lấy cảm hứng từ những nương dâu xanh mướt bên dòng sông Hồng, Đầm Nguyệt Quế mang sắc xanh dịu mắt được chắt lọc từ lá tự nhiên.",
      "Dáng đầm suông dài thanh thoát với điểm nhấn đường cắt vai mềm mại và dây thắt nhẹ eo tùy chỉnh.",
      "Từng thước đũi tơ tằm được tuyển chọn kỹ càng từ những kén tằm vụ thu cho thớ vải óng ả và độ rủ hoàn mỹ."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm" },
      { label: "Sắc thái", value: "Xanh lá dâu non tự nhiên" },
      { label: "Kiểu dáng", value: "Đầm suông dài xẻ tà nhẹ nhàng" },
      { label: "Xuất xứ", value: "Làng dệt Nam Cao, Thái Bình" }
    ],
    reviews: [
      {
        id: "rev-d1",
        userName: "hoangyen***",
        rating: 5,
        date: "2026-09-08 20:10",
        variation: "Màu: Lá dâu, Size: S",
        comment: "Màu xanh lá dâu bên ngoài đẹp hơn trong ảnh nhiều, sắc xanh rất đỗi thanh tao và quý phái.",
        helpfulCount: 18
      }
    ]
  },
  {
    id: "ao-an-nhien",
    slug: "ao-an-nhien",
    name: "Áo An Nhiên",
    category: "Áo kiểu",
    price: "1.590.000₫",
    priceNumber: 1590000,
    originalPrice: "1.890.000₫",
    discount: "-16%",
    image: ivory,
    gallery: [ivory, silkDetail],
    tone: "Mộc",
    tag: "",
    rating: 4.8,
    reviewCount: 45,
    soldCount: 190,
    stock: 20,
    shortDesc: "Áo kiểu cổ tròn vạt chéo đũi tơ mộc, dễ phối với chân váy hoặc quần suông.",
    description: [
      "Áo An Nhiên tối giản mọi chi tiết cầu kỳ để tôn vinh trọn vẹn kết cấu tự nhiên của vải đũi tơ tằm.",
      "Cúc gỗ mộc thủ công, đường xẻ tà bên hông tạo sự linh hoạt khi cử động."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm mộc" },
      { label: "Kiểu dáng", value: "Áo kiểu cổ tròn vạt chéo" },
      { label: "Xuất xứ", value: "Việt Nam" }
    ],
    reviews: []
  },
  {
    id: "quan-hien",
    slug: "quan-hien",
    name: "Quần Hiên",
    category: "Quần",
    price: "1.890.000₫",
    priceNumber: 1890000,
    originalPrice: "2.200.000₫",
    discount: "-14%",
    image: charcoal,
    gallery: [charcoal, silkDetail],
    tone: "Mực",
    tag: "",
    rating: 4.9,
    reviewCount: 52,
    soldCount: 230,
    stock: 22,
    shortDesc: "Quần ống suông rộng đũi tơ sắc mực, cạp chun thoải mái với độ rủ tuyệt đẹp.",
    description: [
      "Quần Hiên là món đồ không thể thiếu cho tủ đồ tinh giản. Độ rủ tự nhiên của tơ tằm giúp kéo dài đôi chân và tạo sự thong dong trong từng bước đi."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm" },
      { label: "Kiểu dáng", value: "Quần suông rộng cạp chun sau" },
      { label: "Xuất xứ", value: "Việt Nam" }
    ],
    reviews: []
  },
  {
    id: "dam-thanh-diep",
    slug: "dam-thanh-diep",
    name: "Đầm Thanh Diệp",
    category: "Đầm",
    price: "2.990.000₫",
    priceNumber: 2990000,
    originalPrice: "3.500.000₫",
    discount: "-15%",
    image: green,
    gallery: [green, silkDetail],
    tone: "Rêu non",
    tag: "Mới",
    rating: 5.0,
    reviewCount: 38,
    soldCount: 140,
    stock: 15,
    shortDesc: "Đầm chữ A đũi tơ tằm sắc rêu non dịu mát, điểm xuyết thêu tay cành lá tinh khôi.",
    description: [
      "Đầm Thanh Diệp mang sắc rêu non mộc mạc, đường thêu tay tỉ mỉ từ những người thợ thêu cố đô Huế."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm dệt tay" },
      { label: "Xuất xứ", value: "Việt Nam" }
    ],
    reviews: []
  },
  {
    id: "ao-dai-tinh",
    slug: "ao-dai-tinh",
    name: "Áo dài Tĩnh",
    category: "Áo dài",
    price: "4.190.000₫",
    priceNumber: 4190000,
    originalPrice: "4.900.000₫",
    discount: "-14%",
    image: ivory,
    gallery: [ivory, silkDetail],
    tone: "Trắng gạo",
    tag: "Đặt trước",
    rating: 5.0,
    reviewCount: 41,
    soldCount: 95,
    stock: 8,
    shortDesc: "Áo dài đũi tơ thượng hạng sắc trắng gạo thanh khiết, may đo giới hạn số lượng.",
    description: [
      "Áo dài Tĩnh được làm từ những kén tằm vàng óng cao cấp nhất, mật độ dệt dày dặn hơn nhưng vẫn giữ được độ xốp mềm tuyệt mỹ."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm thượng hạng" },
      { label: "Xuất xứ", value: "Việt Nam" }
    ],
    reviews: []
  },
  {
    id: "bo-mac-nhien",
    slug: "bo-mac-nhien",
    name: "Bộ Mặc Nhiên",
    category: "Trang phục hằng ngày",
    price: "2.690.000₫",
    priceNumber: 2690000,
    originalPrice: "3.100.000₫",
    discount: "-13%",
    image: charcoal,
    gallery: [charcoal, silkDetail],
    tone: "Đen đũi",
    tag: "",
    rating: 4.9,
    reviewCount: 33,
    soldCount: 160,
    stock: 14,
    shortDesc: "Set đồ đen đũi phóng khoáng, bề mặt sần đặc trưng tạo phong thái chững chạc tự tại.",
    description: [
      "Bộ Mặc Nhiên mang phong vị thiền đương đại, bền đẹp theo năm tháng."
    ],
    specifications: [
      { label: "Chất liệu", value: "100% Đũi Tơ Tằm" },
      { label: "Xuất xứ", value: "Việt Nam" }
    ],
    reviews: []
  },
  {
    id: "dam-binh-minh",
    slug: "dam-binh-minh",
    name: "Đầm Bình Minh",
    category: "Đầm",
    price: "3.490.000₫",
    priceNumber: 3490000,
    originalPrice: "4.000.000₫",
    discount: "-13%",
    image: ivory,
    gallery: [ivory, silkDetail],
    tone: "Hồng đất",
    tag: "",
    rating: 4.9,
    reviewCount: 29,
    soldCount: 110,
    stock: 10,
    shortDesc: "Đầm lụa đũi sắc hồng đất ấm áp, bay bổng và đầy sức sống.",
    description: ["Sắc màu nhuộm từ củ nâu và rễ cây tự nhiên, ấm áp và đằm thắm."],
    specifications: [{ label: "Chất liệu", value: "100% Đũi Tơ Tằm" }],
    reviews: []
  },
  {
    id: "ao-dai-suong",
    slug: "ao-dai-suong",
    name: "Áo dài Sương",
    category: "Áo dài",
    price: "4.590.000₫",
    priceNumber: 4590000,
    originalPrice: "5.200.000₫",
    discount: "-12%",
    image: green,
    gallery: [green, silkDetail],
    tone: "Sương mai",
    tag: "Mới",
    rating: 5.0,
    reviewCount: 22,
    soldCount: 80,
    stock: 6,
    shortDesc: "Áo dài dáng tà bay bổng sắc xanh sương sớm, tuyệt tác nghệ nhân dệt lụa.",
    description: ["Mẫu áo dài cao cấp bậc nhất của Maison de Silk, dệt từ sợi tơ tằm kép hảo hạng."],
    specifications: [{ label: "Chất liệu", value: "100% Đũi Tơ Tằm kép" }],
    reviews: []
  },
  {
    id: "ao-lang-yen",
    slug: "ao-lang-yen",
    name: "Áo Lặng Yên",
    category: "Áo kiểu",
    price: "1.790.000₫",
    priceNumber: 1790000,
    originalPrice: "2.100.000₫",
    discount: "-15%",
    image: charcoal,
    gallery: [charcoal, silkDetail],
    tone: "Bóng tối",
    tag: "",
    rating: 4.8,
    reviewCount: 19,
    soldCount: 130,
    stock: 15,
    shortDesc: "Áo kiểu cổ thuyền tà vát, sắc đen huyền bí của đêm trăng.",
    description: ["Đơn giản mà đầy sức hút, dễ phối với mọi loại trang phục."],
    specifications: [{ label: "Chất liệu", value: "100% Đũi Tơ Tằm" }],
    reviews: []
  },
  {
    id: "quan-nhan",
    slug: "quan-nhan",
    name: "Quần Nhàn",
    category: "Quần",
    price: "1.690.000₫",
    priceNumber: 1690000,
    originalPrice: "1.990.000₫",
    discount: "-15%",
    image: ivory,
    gallery: [ivory, silkDetail],
    tone: "Lụa cháo",
    tag: "Bán chạy",
    rating: 4.9,
    reviewCount: 67,
    soldCount: 290,
    stock: 25,
    shortDesc: "Quần đũi suông màu trắng cháo truyền thống, thanh nhã và mộc mạc.",
    description: ["Vải mộc nguyên bản không qua nhuộm tẩy, mang lại sự tinh khôi tối đa."],
    specifications: [{ label: "Chất liệu", value: "100% Đũi Tơ Tằm mộc" }],
    reviews: []
  }
];

export function getProductById(idOrSlug: string): ProductData | undefined {
  if (!idOrSlug) return undefined;
  const target = idOrSlug.toLowerCase().trim();
  return PRODUCTS_DATA.find(
    (p) =>
      p.id.toLowerCase() === target ||
      p.slug.toLowerCase() === target ||
      toSlug(p.name) === target ||
      p.name.toLowerCase() === target
  );
}
