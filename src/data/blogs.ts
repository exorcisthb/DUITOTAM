import silkDetail from "@/assets/silk-detail.jpg";
import ivory from "@/assets/product-ivory.jpg";
import charcoal from "@/assets/product-charcoal.jpg";
import green from "@/assets/product-green.jpg";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string[];
  quote?: {
    text: string;
    author: string;
  } | undefined;
  category: "Nghề thủ công" | "Phong cách sống" | "Chuyện làng nghề" | "Chăm sóc vải" | "Bộ sưu tập";
  author: {
    name: string;
    role: string;
    avatar: string;
    id?: string | number | undefined;
    email?: string | undefined;
  };
  publishedAt: string;
  readTime: string;
  image: string;
  tags: string[];
  likes: number;
  featured?: boolean | undefined;
  isUserPost?: boolean | undefined;
  comments?: Array<{
    id: string;
    author: string;
    text: string;
    time: string;
  }> | undefined;
}

export const STORAGE_KEY_BLOGS = "maison_community_blogs_v1";

export function getStoredBlogs(): BlogPost[] {
  if (typeof window === "undefined") return BLOG_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLOGS);
    if (!raw) return BLOG_POSTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : BLOG_POSTS;
  } catch {
    return BLOG_POSTS;
  }
}

export function saveStoredBlogs(blogs: BlogPost[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(blogs));
  } catch (e) {
    console.error("Failed to save blogs to localStorage", e);
  }
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "nghe-thuat-det-to-tam-viet-nam",
    title: "Nghệ thuật dệt đũi tơ tằm — Khi từng ngón tay chạm vào hồn cốt đất Việt",
    subtitle: "Hành trình từ những nong tằm ăn rỗi đến thước lụa mộc mạc thơm hương thảo mộc",
    excerpt: "Mỗi thước đũi tơ tằm nguyên bản không đơn thuần là vải vóc; đó là nhịp thở của làng nghề, là sự giao hoà giữa bàn tay người thợ se sợi thô và chất liệu tự nhiên thuần khiết.",
    content: [
      "Có một nghịch lý êm đềm trong từng thớ đũi: người ta tìm đến nó khi đã quá mệt mỏi với những chất liệu công nghiệp thẳng tắp và hoàn hảo đến vô cảm. Đũi tơ tằm không bóng bẩy như satin, không phẳng lì như lụa dệt máy. Nó thô mộc, có những nốt sần lăn tăn như hạt cát ven sông Hồng, và trên hết — nó có linh hồn.",
      "Để làm nên một tấm đũi tơ tằm thủ công, người thợ phải qua hơn 14 công đoạn tỉ mỉ. Bắt đầu từ kén tằm vụ cuối, sau khi kéo hết lớp tơ mịn ngoài cùng để dệt lụa bóng, phần ruột tơ thô bên trong được ngâm mềm, se bằng tay từng búi sợi một. Chính cách se sợi bất quy tắc này tạo nên nếp vân gợn đặc trưng — thứ mà không một cỗ máy hiện đại nào có thể sao chép được.",
      "Khi mặc một chiếc áo đũi tơ tằm, cảm giác đầu tiên là sự nhẹ bẫng như mây. Nhưng điều kỳ diệu nằm ở khả năng 'thở' của sợi tơ tự nhiên: mùa hè thấm hút mồ hôi và tản nhiệt thoáng mát, mùa đông giữ ấm nhờ cấu trúc rỗng vi mô của protein tơ tằm.",
      "Ở Maison de Silk, chúng tôi không xem những nốt gút trên mặt vải là khuyết tật. Đó là chứng chỉ xuất xứ từ đôi bàn tay nghệ nhân, là minh chứng cho một lối sống tôn trọng tự nhiên và giá trị lao động truyền thống."
    ],
    quote: {
      text: "Đũi tơ tằm giống như người phụ nữ Việt: mộc mạc, kín đáo nhưng bền bỉ và càng qua năm tháng càng toát lên sự đằm thắm khó lẫn.",
      author: "Nghệ nhân ưu tú Nguyễn Thị Sen — Làng dệt Nha Xá"
    },
    category: "Nghề thủ công",
    author: {
      name: "Phương Linh",
      role: "Giám đốc Nghệ thuật & Thiết kế",
      avatar: "PL"
    },
    publishedAt: "16 Tháng 9, 2026",
    readTime: "6 phút đọc",
    image: silkDetail,
    tags: ["Tơ tằm thủ công", "Di sản Việt", "Chất liệu tự nhiên", "Nghệ nhân"],
    likes: 184,
    featured: true
  },
  {
    id: "blog-2",
    slug: "mac-ao-dai-trong-nhip-song-hien-dai",
    title: "Mặc áo dài trong nhịp sống hôm nay — Đẹp để sống, không chỉ để ngắm",
    subtitle: "Đưa tà áo truyền thống trở lại tủ đồ thường nhật của người phụ nữ thành thị",
    excerpt: "Áo dài cách tân từ chất liệu đũi tơ mộc mang đến sự tự do trong từng cử động: bạn có thể mặc đi làm, ngồi quán cà phê ven hồ hay dạo phố chiều thu mà không hề thấy gò bó.",
    content: [
      "Đã từng có thời gian tà áo dài chỉ xuất hiện vào dịp lễ Tết, hội hè hay đám cưới. Cổ áo cao siết chặt, eo chiết nghẹt thở và chất liệu nhân tạo dễ nhăn nhúm khiến phụ nữ hiện đại e dè khi nghĩ đến việc mặc áo dài ngày thường.",
      "Maison de Silk khởi đầu với một trăn trở: Làm sao để tà áo dài trở lại nhịp sống thường nhật như chính tổ tiên ta từng mặc nó với vẻ tự nhiên, phóng khoáng nhất? Câu trả lời nằm ở form dáng suông nhẹ và chất liệu đũi tơ tằm mềm rủ.",
      "Không cần nhấn eo gắt gao, vẻ đẹp của chiếc áo dài đũi đến từ độ rơi tự nhiên của tơ tằm. Khi bước đi, tà áo lay động theo nhịp bước, mang lại vẻ thanh thoát an nhiên mà vẫn chuẩn mực, trang nhã giữa chốn công sở hiện đại."
    ],
    quote: {
      text: "Sự thanh lịch cao nhất không phải là khiến người khác choáng ngợp, mà là để người mặc cảm thấy tự do và hoà hợp nhất với chính mình.",
      author: "Maison Editorial Desk"
    },
    category: "Phong cách sống",
    author: {
      name: "Minh Thư",
      role: "Fashion Curator",
      avatar: "MT"
    },
    publishedAt: "10 Tháng 9, 2026",
    readTime: "5 phút đọc",
    image: ivory,
    tags: ["Áo dài", "Phong cách sống", "Hiện đại & Truyền thống"],
    likes: 142
  },
  {
    id: "blog-3",
    slug: "sac-mau-tu-co-cay-thao-moc",
    title: "Nhuộm màu từ cỏ cây — Khi thiên nhiên hào phóng ban tặng sắc thái",
    subtitle: "Củ nâu, lá chàm, vỏ bàng và hành trình tìm về bảng màu bền vững",
    excerpt: "Không chất tẩy công nghiệp, không hoá chất độc hại. Màu của Maison de Silk là màu trầm tĩnh của đất mẹ, dịu dàng nâng niu làn da nhạy cảm nhất.",
    content: [
      "Trong xưởng nhuộm nép mình bên dòng sông Châu Giang, mùi thảo mộc thơm hăng thoang thoảng trong nắng sớm. Những củ nâu già vỏ sần được nghiền nhuyễn, lá chàm ngâm ủ trong chum sành để lên men cho ra sắc xanh thẳm như mặt hồ sau cơn mưa.",
      "Quy trình nhuộm tự nhiên đòi hỏi sự kiên nhẫn vô hạn. Một tấm vải đũi cần nhúng nước nhuộm, phơi nắng gió tự nhiên tới hàng chục lần để màu thấm sâu vào từng lõi sợi. Màu nhuộm tự nhiên có tính sống: nó đổi màu nhẹ theo thời gian và ánh sáng mặt trời, tựa như đang ghi lại nhật ký cùng người mặc.",
      "Sở hữu một tấm vải nhuộm thảo mộc là bạn đang chọn cho mình sự lành tính tối đa: không gây kích ứng da, an toàn tuyệt đối cho sức khoẻ và hoàn toàn phân huỷ sinh học thân thiện với môi trường."
    ],
    category: "Nghề thủ công",
    author: {
      name: "Bảo Châu",
      role: "Nghiên cứu Chất liệu Bền vững",
      avatar: "BC"
    },
    publishedAt: "02 Tháng 9, 2026",
    readTime: "7 phút đọc",
    image: green,
    tags: ["Nhuộm tự nhiên", "Bền vững", "Thảo mộc", "Eco-fashion"],
    likes: 96
  },
  {
    id: "blog-4",
    slug: "chuyen-ve-nhung-nguoi-giu-lua-lang-nghe",
    title: "Chuyện về những người giữ thoi đưa bên dòng sông Đáy",
    subtitle: "Ký sự ba ngày sống cùng gia đình cụ Đỗ Bá tại làng dệt cổ",
    excerpt: "Giữa thời đại máy dệt công nghiệp gầm rú ngày đêm, tiếng kẽo kẹt của khung dệt gỗ cổ truyền vẫn vang lên kiên định, như một lời hẹn thầm kín với thời gian.",
    content: [
      "Cụ Đỗ Bá năm nay đã bước sang tuổi 78. Đôi bàn tay cụ chai sần nhưng khi luồn sợi tơ qua khe thoi lại mềm mại lạ kỳ. Cụ bảo: 'Sợi tơ nó có tính nết của nó con à. Trời ẩm nó dãn, trời hanh nó co. Mình phải lắng nghe nó, lựa tay nhẹ nhàng thì vải mới đều tăm tắp'.",
      "Cả làng giờ chỉ còn vài gia đình duy trì khung dệt thủ công theo đúng lối xưa. Từng tấm vải đũi dệt ra mất vài ba ngày, sản lượng chẳng thấm tháp so với nhà máy hiện đại, nhưng giá trị của cái đẹp từ sự nhẫn nại thì không một dây chuyền công nghiệp nào có thể tạo nên.",
      "Maison de Silk vinh dự được đồng hành cùng các hộ gia đình nghệ nhân, cam kết bao tiêu sản phẩm tơ thủ công với mức giá trân trọng nhất để ngọn lửa làng nghề không bao giờ lụi tàn."
    ],
    quote: {
      text: "Vải dệt máy chỉ có số đo. Vải dệt tay có cả mồ hôi và nhịp đập trái tim người thợ.",
      author: "Cụ Đỗ Bá — Làng lụa cổ truyền"
    },
    category: "Chuyện làng nghề",
    author: {
      name: "Hồng Nhung",
      role: "Trưởng ban Cộng đồng Maison",
      avatar: "HN"
    },
    publishedAt: "24 Tháng 8, 2026",
    readTime: "8 phút đọc",
    image: charcoal,
    tags: ["Làng nghề", "Nghệ nhân", "Di sản văn hoá", "Ký sự"],
    likes: 215
  },
  {
    id: "blog-5",
    slug: "bi-quyet-cham-soc-lua-dui-to-tam",
    title: "Cẩm nang chăm sóc đũi tơ tằm — Để tấm áo sống cùng năm tháng",
    subtitle: "Những quy tắc vàng từ giặt giũ, phơi phóng đến ủi ủi giúp lụa đũi luôn óng mượt",
    excerpt: "Đũi tơ tằm không khó chăm sóc như bạn nghĩ. Chỉ cần hiểu được tính nết tự nhiên của sợi protein, trang phục đũi sẽ ngày càng mềm mại và quý phái sau mỗi lần mặc.",
    content: [
      "Nhiều khách hàng ngần ngại khi mua trang phục đũi tơ tằm vì sợ công đoạn giặt là phức tạp. Thực tế, chăm sóc đũi tơ tằm là một nghi thức chậm rãi để bạn gắn kết hơn với tủ đồ của mình.",
      "1. Giặt bằng nước lạnh và dầu gội dịu nhẹ: Sợi tơ tằm có cấu tạo protein tương tự như tóc người. Đừng dùng bột giặt chứa chất tẩy mạnh; thay vào đó, một chút dầu gội đầu dịu nhẹ hoặc nước bồ hòn là lựa chọn lý tưởng nhất.",
      "2. Không vắt xoắn mạnh: Sau khi giặt xả nhẹ nhàng, hãy cuộn áo trong một chiếc khăn bông khô để thấm bớt nước rồi phơi trong bóng râm, tránh ánh nắng gắt trực tiếp làm giòn xơ tơ.",
      "3. Ủi khi vải còn hơi ẩm: Ủi ở mặt trái ở nhiệt độ vừa phải (chế độ Silk). Khi vải còn ẩm nhẹ, các nếp nhăn tự nhiên sẽ giãn ra êm ái mà vẫn giữ nguyên độ xốp phồng duyên dáng."
    ],
    category: "Chăm sóc vải",
    author: {
      name: "Phương Linh",
      role: "Giám đốc Nghệ thuật & Thiết kế",
      avatar: "PL"
    },
    publishedAt: "15 Tháng 8, 2026",
    readTime: "4 phút đọc",
    image: silkDetail,
    tags: ["Mẹo chăm sóc", "Bảo quản lụa", "Hướng dẫn giặt là", "Tips hữu ích"],
    likes: 128
  },
  {
    id: "blog-6",
    slug: "bo-suu-tap-thu-dong-khoanh-khac-tinh-lang",
    title: "Bộ sưu tập Thu Đông 2026 — Khi sự tĩnh lặng cất lời",
    subtitle: "Cảm hứng từ sương sớm non cao và nét thâm trầm của kiến trúc Việt cổ",
    excerpt: "Maison de Silk giới thiệu các thiết kế mới nhất với sắc độ ngà nguyên bản, xám than tre và xanh lá dâu trầm ấm, tạo nên phong thái an yên cho mùa trở gió.",
    content: [
      "Mùa thu đông phương Bắc luôn mang một phong vị hoài niệm rất riêng. Gió heo may se lạnh, tán bàng chuyển màu đồng cổ, và những buổi chiều vàng êm ru bên hiên nhà gỗ lim.",
      "Bộ sưu tập mới lấy tông màu trầm tĩnh làm chủ đạo: màu trắng ngà của kén tằm chưa qua tẩy trắng, màu đen than tre trầm mặc, và màu xanh rêu phong của mái ngói cổ. Từng đường cắt may tối giản tôn lên tối đa chất liệu đũi xốp dày dặn giữ nhiệt tốt.",
      "Đây là lời mời gọi người phụ nữ hãy chậm lại một nhịp, lắng nghe bản thân và tìm thấy sự an trú trong trang phục mình khoác lên người."
    ],
    category: "Bộ sưu tập",
    author: {
      name: "Minh Thư",
      role: "Fashion Curator",
      avatar: "MT"
    },
    publishedAt: "01 Tháng 8, 2026",
    readTime: "5 phút đọc",
    image: ivory,
    tags: ["Bộ sưu tập", "Thu Đông 2026", "Lookbook", "Thiết kế mới"],
    likes: 173
  }
];

export const COMMUNITY_DISCUSSIONS = [
  {
    id: "post-1",
    author: {
      name: "Thuỷ Tiên",
      location: "Hà Nội",
      avatar: "TT",
      badge: "Thành viên thân thiết"
    },
    time: "2 giờ trước",
    content: "Hôm nay diện chiếc đầm Thanh Diệp màu rêu non đi triển lãm tranh, ai cũng khen chất vải đũi nhìn sang mà mộc quá đỗi. Cảm giác nhẹ bẫng và thoáng mát cả ngày dù đi bộ nhiều. Rất mê cách xử lý đường may của Maison de Silk!",
    image: green,
    likes: 34,
    dislikes: 2,
    commentsCount: 6,
    tags: ["OutfitOfTheDay", "ĐầmThanhDiệp", "LụaĐũi"],
    comments: [
      { author: "Hồng Nhung (Maison)", text: "Cảm ơn chị Thuỷ Tiên đã tin yêu sản phẩm! Màu rêu non rất hợp với phong thái thanh lịch của chị ạ 🌿", time: "1 giờ trước" },
      { author: "Bảo Trâm", text: "Chị ơi mẫu này có bị nhăn nhiều khi ngồi lâu không ạ?", time: "45 phút trước" },
      { author: "Thuỷ Tiên", text: "@Bảo Trâm Đũi xịn nhăn dạng nếp sóng tự nhiên rất duyên dáng chứ không bị gãy gập xấu đâu bạn nhé!", time: "30 phút trước" }
    ]
  },
  {
    id: "post-2",
    author: {
      name: "Ngọc Bích",
      location: "TP. Hồ Chí Minh",
      avatar: "NB",
      badge: "Yêu đũi tơ"
    },
    time: "Hôm qua lúc 15:30",
    content: "Có chị em nào đã thử nhuộm lại áo đũi cũ bằng củ nâu hay vỏ bàng chưa ạ? Mình có chiếc áo Mộc mặc 3 năm rồi vẫn bền tốt, muốn thử tự tay 'khoác áo mới' bằng màu thảo mộc cuối tuần này. Xin kinh nghiệm từ mọi người!",
    likes: 52,
    dislikes: 3,
    commentsCount: 9,
    tags: ["DIY", "NhuộmThảoMộc", "BềnVững", "HỏiĐáp"],
    comments: [
      { author: "Bảo Châu (Chất liệu)", text: "Chào bạn Bích! Bạn nhớ rửa sạch áo bằng nước ấm trước khi nhuộm để xơ vải nở đều nhé. Đọc thêm bài blog 'Sắc màu từ cỏ cây' của bên mình để nắm tỉ lệ củ nâu chuẩn nè!", time: "Hôm qua" }
    ]
  },
  {
    id: "post-3",
    author: {
      name: "Trần Anh Khoa",
      location: "Đà Nẵng",
      avatar: "AK",
      badge: "Khách hàng mới"
    },
    time: "3 ngày trước",
    content: "Vừa nhận bộ Mặc Nhiên tặng mẹ nhân dịp mừng thọ 60. Mẹ khen vải đũi tơ tằm mặc êm như nhung mà không bị bí bách. Đóng gói hộp quà gỗ kèm thiệp viết tay cũng rất chỉn chu. Cảm ơn Maison de Silk!",
    image: charcoal,
    likes: 68,
    dislikes: 1,
    commentsCount: 8,
    tags: ["QuàTặngMẹ", "BộMặcNhiên", "ChămSócYêuThương"],
    comments: []
  }
];
