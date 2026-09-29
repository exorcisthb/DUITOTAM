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

export const PRODUCTS_DATA: ProductData[] = [];

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
