export function Mark({ size = 34 }) {
  const id = "mg" + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={size} height={size * 0.74} viewBox="0 0 64 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="48" x2="34" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="#52c2ee"/><stop offset="1" stopColor="#0A5BAE"/>
        </linearGradient>
      </defs>
      <path d="M3 46 L20 4 L32 26 L27 35 L20 21 L13 34 L3 46 Z" fill={`url(#${id})`}/>
      <path d="M44 4 L61 46 L51 46 L44 33 L37 46 L32 38 L44 4 Z" fill="#7e858b"/>
      <path d="M32 18 L36 26 L32 33 L28 26 Z" fill="#0A5BAE"/>
    </svg>
  );
}

export function Wordmark({ light = false, size = 1 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 * size }}>
      <Mark size={34 * size} />
      <span style={{ lineHeight: .96, display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
        <span style={{
          fontWeight: 800, fontSize: 19 * size, letterSpacing: ".02em", whiteSpace: "nowrap",
          color: light ? "#fff" : "var(--ink)",
        }}>
          INNOVARE <span style={{ color: light ? "#fff" : "var(--ink)" }}>JM</span>
        </span>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 9.5 * size, letterSpacing: ".42em",
          color: light ? "rgba(255,255,255,.8)" : "var(--blue)", marginTop: 2, paddingLeft: 1,
        }}>
          INMOBILIER
        </span>
      </span>
    </span>
  );
}
