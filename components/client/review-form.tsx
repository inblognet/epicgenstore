// components/client/review-form.tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";

interface ReviewFormProps {
  productId: string;
  initialRating?: number;
  initialComment?: string;
  productName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, initialRating = 0, initialComment = "", productName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const res = await submitReview(productId, rating, comment);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || "Failed to submit review.");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-bg border border-theme-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h4 className="font-bold text-sm text-theme-main uppercase tracking-widest">Review {productName}</h4>
        <p className="text-xs text-theme-muted">How was your experience with this product?</p>
      </div>

      {/* Interactive Stars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                (hoveredRating || rating) >= star
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-theme-border"
              } transition-colors duration-200`}
            />
          </button>
        ))}
      </div>

      {/* Comment Box */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tell us what you liked or didn't like..."
        className="w-full bg-surface-card border border-theme-border rounded-lg p-3 text-xs text-theme-main focus:border-brand outline-none min-h-[100px] resize-none transition-colors"
      />

      {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="bg-brand hover:bg-brand-hover text-black font-black uppercase tracking-widest text-[10px] py-3 rounded-lg transition-colors disabled:opacity-50 mt-2"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}