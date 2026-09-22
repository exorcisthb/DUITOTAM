import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReviewItem } from "@/data/products";

const REVIEWS_STORAGE_KEY = "maison_de_silk_reviews_v1";

interface UserReview extends ReviewItem {
  productId: string;
}

interface ReviewsContextType {
  getUserReviews: (productId: string) => ReviewItem[];
  addReview: (productId: string, review: ReviewItem) => void;
  hasReviewed: (productId: string) => boolean;
  pendingReviews: string[]; // productIds chờ đánh giá sau mua
  addPendingReview: (productId: string) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [allReviews, setAllReviews] = useState<UserReview[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [pendingReviews, setPendingReviews] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("maison_pending_reviews_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(allReviews));
    } catch {
      // ignore
    }
  }, [allReviews]);

  useEffect(() => {
    try {
      localStorage.setItem("maison_pending_reviews_v1", JSON.stringify(pendingReviews));
    } catch {
      // ignore
    }
  }, [pendingReviews]);

  const getUserReviews = (productId: string): ReviewItem[] => {
    return allReviews
      .filter((r) => r.productId === productId)
      .map(({ productId: _pid, ...rest }) => rest);
  };

  const addReview = (productId: string, review: ReviewItem) => {
    setAllReviews((prev) => [...prev, { ...review, productId }]);
    // Xóa khỏi pending sau khi đã đánh giá
    setPendingReviews((prev) => prev.filter((id) => id !== productId));
  };

  const hasReviewed = (productId: string): boolean => {
    return allReviews.some((r) => r.productId === productId);
  };

  const addPendingReview = (productId: string) => {
    setPendingReviews((prev) => {
      if (prev.includes(productId)) return prev;
      return [...prev, productId];
    });
  };

  return (
    <ReviewsContext.Provider
      value={{
        getUserReviews,
        addReview,
        hasReviewed,
        pendingReviews,
        addPendingReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
}
