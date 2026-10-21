/*
 * Logo oficial de INNOVARE JM. Las imágenes salen de public/uploads/LOGO INNOVARE.png
 * con scripts/build-logo.mjs (símbolo y texto por separado para la versión horizontal).
 */
const MARK_RATIO = 238 / 132; // ancho / alto de /brand/logo-mark.png
const TEXT_RATIO = 319 / 96;  // ancho / alto de /brand/logo-text*.png

export function Mark({ size = 34, white = false, style }) {
  return (
    <img
      src={white ? "/brand/logo-mark-white.png" : "/brand/logo-mark.png"}
      alt="" aria-hidden="true" decoding="async"
      width={Math.round(size * MARK_RATIO)} height={size}
      style={{ display: "block", height: size, width: "auto", ...style }}
    />
  );
}

/* Versión horizontal: símbolo + "INNOVARE JM / INMOBILIER".
   `light` = texto blanco (sobre el video del hero o fondos oscuros). */
export function Wordmark({ light = false, size = 1 }) {
  const h = 44 * size;          // alto del símbolo
  const th = Math.round(h * 0.78); // alto del bloque de texto
  const tw = Math.round(th * TEXT_RATIO);
  const textImg = (src, visible) => (
    <img src={src} alt="" aria-hidden="true" decoding="async" width={tw} height={th}
      style={{ position: visible === null ? "static" : "absolute", inset: 0, display: "block", height: th, width: tw,
        opacity: visible === false ? 0 : 1, transition: "opacity .4s var(--ease)" }} />
  );
  return (
    <span role="img" aria-label="INNOVARE JM Inmobilier" style={{ display: "inline-flex", alignItems: "center", gap: Math.round(10 * size) }}>
      <Mark size={h} />
      {/* Las dos versiones del texto quedan cargadas y se cruzan con un fundido al hacer scroll */}
      <span style={{ position: "relative", display: "block", width: tw, height: th }}>
        {textImg("/brand/logo-text.png", !light)}
        {textImg("/brand/logo-text-light.png", light)}
      </span>
    </span>
  );
}
