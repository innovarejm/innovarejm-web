import { Icon } from '../icons/Icon';

export function GuestPicker({ value, onChange, max = 8 }) {
  const rows = [
    { key: "adultos", t: "Adultos", d: "13 años o más" },
    { key: "ninos",   t: "Niños",   d: "De 2 a 12 años" },
    { key: "bebes",   t: "Bebés",   d: "Menores de 2" },
  ];
  const total = value.adultos + value.ninos;

  function set(key, delta) {
    const next = { ...value, [key]: Math.max(key === "adultos" ? 1 : 0, value[key] + delta) };
    if ((next.adultos + next.ninos) > max && delta > 0) return;
    onChange(next);
  }

  return (
    <div style={{ display: "grid", gap: 4 }}>
      {rows.map(r => {
        const atMax = (r.key !== "bebes" && total >= max);
        return (
          <div key={r.key} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 2px",
            borderBottom: r.key !== "bebes" ? "1px solid var(--line)" : "none",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{r.t}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{r.d}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Stepper
                dir="minus"
                onClick={() => set(r.key, -1)}
                disabled={value[r.key] <= (r.key === "adultos" ? 1 : 0)}
              />
              {/* Número explícito con color y tamaño claros */}
              <span style={{
                minWidth: 28, textAlign: "center",
                fontWeight: 700, fontSize: 17,
                color: "var(--ink)",
                display: "inline-block", lineHeight: 1,
              }}>
                {value[r.key]}
              </span>
              <Stepper
                dir="plus"
                onClick={() => set(r.key, +1)}
                disabled={atMax}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stepper({ dir, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        /* 44×44 para cumplir el mínimo de área táctil en móvil */
        width: 44, height: 44, borderRadius: 99,
        border: "1.5px solid " + (disabled ? "var(--line)" : "var(--line-strong)"),
        color: disabled ? "#cdd3d8" : "var(--ink-2)",
        display: "grid", placeItems: "center",
        cursor: disabled ? "default" : "pointer",
        transition: "border-color .2s, color .2s, background .2s",
        background: "transparent",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = "var(--ink)"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = "var(--line-strong)"; }}
    >
      <Icon name={dir} size={16} />
    </button>
  );
}
