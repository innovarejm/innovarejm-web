import { useState } from 'react';
import { Placeholder } from './Placeholder';

// Versiones WebP generadas por scripts/optimize-images.mjs (01.jpg → 01-640.webp, 01-1200.webp)
function webpSrcSet(src) {
  if (!/^\/images\/.+\.jpe?g$/i.test(src)) return null;
  const base = src.replace(/\.jpe?g$/i, "");
  return `${base}-640.webp 640w, ${base}-1200.webp 1200w`;
}

/**
 * `sizes` indica qué tan ancha se muestra la foto, para que el navegador
 * descargue la versión justa (640 o 1200 px) en vez de siempre la grande.
 */
export function PropImage({ src, alt = "Foto del alojamiento", style, className, priority = false, sizes = "100vw" }) {
  // 0 = WebP, 1 = JPG original (si falta el WebP), 2 = placeholder.
  // Se guarda junto al src para reiniciarse si cambia la foto (ej. en el visor).
  const [err, setErr] = useState({ src: null, stage: 0 });
  const stage = err.src === src ? err.stage : 0;
  const setStage = (next) => setErr({ src, stage: next(stage) });
  const srcSet = webpSrcSet(src);

  if (stage === 2 || !src) {
    return <Placeholder label={alt} style={style} className={className} />;
  }

  const img = (
    <img
      src={src}
      alt={alt}
      onError={() => setStage(s => (s === 0 && srcSet ? 1 : 2))}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        objectFit: "cover",
        display: "block",
        ...style,
      }}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchpriority={priority ? "high" : "auto"}
    />
  );

  if (stage === 1 || !srcSet) return img;
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      {img}
    </picture>
  );
}
