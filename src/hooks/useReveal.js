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

    const tryObserve = (node) => {
      if (node.nodeType !== 1) return;
      const cn = node.className;
      if (typeof cn === 'string' && cn.includes("reveal") && !node.classList.contains("in")) {
        io.observe(node);
      }
    };

    // Observación inicial
    el.querySelectorAll("[class*='reveal']:not(.in)").forEach(n => io.observe(n));
    tryObserve(el);

    // Detecta elementos nuevos (e.g. cuando cambia el filtro de ciudad)
    const mo = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          tryObserve(node);
          if (node.querySelectorAll) {
            node.querySelectorAll("[class*='reveal']:not(.in)").forEach(n => io.observe(n));
          }
        });
      });
    });

    mo.observe(el, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
  return ref;
}
