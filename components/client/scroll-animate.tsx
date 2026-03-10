// components/client/scroll-animate.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-in" | "scale-up";
  delay?: number;
  className?: string;
}

export function ScrollAnimate({ children, animation = "fade-up", delay = 0, className = "" }: ScrollAnimateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) observer.unobserve(ref.current); // Stop observing once it animates in
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const baseClasses = "transition-all duration-[800ms] ease-out will-change-transform";

  let animationClasses = "";
  switch (animation) {
    case "fade-up":
      animationClasses = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12";
      break;
    case "fade-in":
      animationClasses = isVisible ? "opacity-100" : "opacity-0";
      break;
    case "scale-up":
      animationClasses = isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95";
      break;
  }

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${animationClasses} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}