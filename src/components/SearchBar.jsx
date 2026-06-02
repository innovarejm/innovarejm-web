import { useState, useRef, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { RangeCalendar } from './RangeCalendar';
import { GuestPicker } from './GuestPicker';
import { fmtFecha } from '../utils/helpers';

function Popover({ open, onClose, children, align = "left", width = 340 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const on = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 14px)", [align]: 0, width, zIndex: 60,
      background: "#fff", borderRadius: 22, boxShadow: "var(--sh-lg)", border: "1px solid var(--line)",
      padding: 20, animation: "popIn .22s var(--ease-out)",
    }}>{children}</div>
  );
}

export function SearchBar({ variant = "hero", onSearch, initial }) {
  const [field, setField] = useState(null);
  const [dest, setDest] = useState(initial?.dest || "Cualquier destino");
  const [range, setRange] = useState(initial?.range || { start: null, end: null });
  const [guests, setGuests] = useState(initial?.guests || { adultos: 2, ninos: 0, bebes: 0 });

  const destinos = ["Cualquier destino", "Cartagena", "Santa Marta"];
  const totalG = guests.adultos + guests.ninos;
  const close = () => setField(null);
  const dark = variant === "hero";

  function Seg({ id, label, value, grow, children }) {
    const active = field === id;
    return (
      <div style={{ position: "relative", flex: grow ? "1.2 1 0" : "1 1 0", minWidth: 0 }}>
        <button onClick={() => setField(active ? null : id)} style={{
          width: "100%", textAlign: "left", padding: "14px 22px", borderRadius: 999,
          background: active ? "#fff" : "transparent",
          boxShadow: active ? "var(--sh-md)" : "none",
          transition: "background .2s, box-shadow .2s",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".02em", color: "var(--ink)", marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 14, color: value ? "var(--ink-2)" : "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {value || "Agregar"}
          </div>
        </button>
        {children}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      background: "rgba(255,255,255,.94)", backdropFilter: "blur(8px)",
      borderRadius: 999, padding: 6,
      boxShadow: dark ? "0 20px 60px rgba(12,38,56,.28)" : "var(--sh-md)",
      border: "1px solid " + (dark ? "rgba(255,255,255,.6)" : "var(--line)"),
      maxWidth: 880, width: "100%",
    }} className="searchbar">
      <Seg id="dest" label="Destino" value={dest === "Cualquier destino" ? "" : dest}>
        <Popover open={field === "dest"} onClose={close} width={260}>
          <div style={{ display: "grid", gap: 2 }}>
            {destinos.map(d => (
              <button key={d} onClick={() => { setDest(d); setField("in"); }} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderRadius: 12,
                textAlign: "left", background: dest === d ? "var(--paper-2)" : "transparent", transition: "background .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--paper-2)"}
                onMouseLeave={e => e.currentTarget.style.background = dest === d ? "var(--paper-2)" : "transparent"}>
                <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--grad-brand)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 }}>
                  <Icon name={d === "Cualquier destino" ? "sea" : "pin"} size={19} />
                </span>
                <span style={{ fontWeight: 600, fontSize: 14.5 }}>{d}</span>
              </button>
            ))}
          </div>
        </Popover>
      </Seg>

      <Divider />
      <Seg id="in" label="Llegada" value={range.start ? fmtFecha(range.start) : ""}>
        <Popover open={field === "in"} onClose={close} width={340} align="left">
          <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) setField("guests"); }} />
        </Popover>
      </Seg>

      <Divider />
      <Seg id="out" label="Salida" value={range.end ? fmtFecha(range.end) : ""}>
        <Popover open={field === "out"} onClose={close} width={340} align="left">
          <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) setField("guests"); }} />
        </Popover>
      </Seg>

      <Divider />
      <Seg id="guests" label="Huéspedes"
        value={totalG ? `${totalG} huésped${totalG > 1 ? "es" : ""}${guests.bebes ? " · " + guests.bebes + " bebé" + (guests.bebes > 1 ? "s" : "") : ""}` : ""}
        grow>
        <Popover open={field === "guests"} onClose={close} width={320} align="right">
          <GuestPicker value={guests} onChange={setGuests} max={8} />
        </Popover>
      </Seg>

      <button className="btn btn-primary" style={{ padding: "0 26px", height: 56, borderRadius: 999, flexShrink: 0 }}
        onClick={() => { close(); onSearch && onSearch({ dest, range, guests }); }}>
        <Icon name="search" size={19} /> <span className="search-label">Buscar</span>
      </button>

      <style>{`
        @keyframes popIn { from{ opacity:0; transform:translateY(-8px) scale(.98);} to{opacity:1;transform:none;} }
        @media (max-width: 760px){
          .searchbar{ flex-wrap:wrap; border-radius:26px; }
          .searchbar > div{ flex:1 1 45% !important; }
          .searchbar .search-label{ display:inline; }
          .sb-divider{ display:none; }
        }
      `}</style>
    </div>
  );
}

function Divider() {
  return <div className="sb-divider" style={{ width: 1, height: 30, background: "var(--line)", flexShrink: 0 }} />;
}
