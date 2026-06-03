import { useState, useEffect, useRef } from 'react';

export function useCountUp(target, duration = 1000, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respeta prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setValue(parseFloat((eased * target).toFixed(decimals)));
        if (t < 1) requestAnimationFrame(animate);
        else setValue(target);
      };
      requestAnimationFrame(animate);
    }, { threshold: 0.6 });

    io.observe(el);
    return () => io.disconnect();
  }, [target, duration, decimals]);

  return [value, ref];
}
