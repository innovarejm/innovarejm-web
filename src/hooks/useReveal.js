import { useEffect, useRef } from 'react';

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    // Observa todas las variantes: reveal, reveal-left, reveal-right, reveal-scale
    el.querySelectorAll("[class*='reveal']").forEach(n => io.observe(n));
    if (el.className && el.className.includes("reveal")) io.observe(el);

    return () => io.disconnect();
  }, []);
  return ref;
}
