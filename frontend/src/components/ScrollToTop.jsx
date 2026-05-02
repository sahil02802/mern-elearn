import { useEffect } from "react";

import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = prefersReducedMotion ? "auto" : "smooth";
    window.scrollTo({ top: 0, left: 0, behavior });
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior });
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
