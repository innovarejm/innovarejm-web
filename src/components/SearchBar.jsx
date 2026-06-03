import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '../icons/Icon';
import { RangeCalendar } from './RangeCalendar';
import { GuestPicker } from './GuestPicker';
import { fmtFecha } from '../utils/helpers';
import { PROPERTIES } from '../data/properties';

const DEFAULT_RANGE  = { start: null, end: null };
const DEFAULT_GUESTS = { adultos: 2, ninos: 0, bebes: 0 };

function shortName(p) {
  return p.nombre.replace("Apartamento Vacacional ", "");
}

// Defined outside SearchBar so React never sees a new component type between renders
function Seg({ id, label, value, grow, dark, field, onToggle, children }) {
  const active = field === id;
  return (
    <div style={{ position: "relative", flex: grow ? "1.2 1 0" : "1 1 0", minWidth: 0 }}>
      <button onClick={() => onToggle(id)} style={{
        width: "100%", textAlign: "left", padding: "14px 22px", borderRadius: 999,
        background: active
          ? (dark ? "rgba(255,255,255,.2)" : "#fff")
          : "transparent",
        boxShadow: active && !dark ? "var(--sh-md)" : "none",
        transition: "background .22s, box-shadow .22s",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
          color: dark ? "rgba(255,255,255,.72)" : "var(--ink)",
          marginBottom: 3, textTransform: "uppercase",
        }}>{label}</div>
        <div style={{
          fontSize: 14,
          color: value
            ? (dark ? "#fff" : "var(--ink-2)")
            : (dark ? "rgba(255,255,255,.48)" : "var(--muted)"),
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          fontWeight: value ? 500 : 400,
        }}>
          {value || "Agregar"}
        </div>
      </button>
      {children}
    </div>
  );
}

function Popover({ open, onClose, children, align = "left", width = 340 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const on = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", on);
    document.body.style.overflow = window.innerWidth <= 760 ? "hidden" : "";
    return () => {
      document.removeEventListener("mousedown", on);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="popover-backdrop" onClick={onClose} />
      <div ref={ref} className="popover-panel" style={{
        position: "absolute", top: "calc(100% + 14px)", [align]: 0, width, zIndex: 62,
        background: "#fff", borderRadius: 22, boxShadow: "var(--sh-lg)",
        border: "1px solid var(--line)", padding: 20,
        animation: "popIn .22s var(--ease-out)",
      }}>
        <div className="sheet-handle" />
        {children}
      </div>
    </>
  );
}

export function SearchBar({ variant = "hero", onSearch, initial }) {
  const [field, setField]       = useState(null);
  const [selectedId, setSelectedId] = useState(() => initial?.propertyId ?? null);
  const [range, setRange]       = useState(() => initial?.range   ?? DEFAULT_RANGE);
  const [guests, setGuests]     = useState(() => initial?.guests  ?? DEFAULT_GUESTS);

  const selectedProp = PROPERTIES.find(p => p.id === selectedId) || null;
  const totalG = guests.adultos + guests.ninos;
  const dark = variant === "hero";

  const close  = useCallback(() => setField(null), []);
  const toggle = useCallback((id) => setField(f => f === id ? null : id), []);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2,
      background: dark ? "rgba(255,255,255,.10)" : "rgba(255,255,255,.96)",
      backdropFilter: dark
        ? "blur(28px) saturate(1.6) brightness(1.1)"
        : "blur(8px)",
      WebkitBackdropFilter: dark
        ? "blur(28px) saturate(1.6) brightness(1.1)"
        : "blur(8px)",
      borderRadius: 999, padding: dark ? 7 : 6,
      boxShadow: dark
        ? "0 8px 40px rgba(4,16,44,.45), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(255,255,255,.06)"
        : "var(--sh-md)",
      border: "1px solid " + (dark ? "rgba(255,255,255,.22)" : "var(--line)"),
      maxWidth: 880, width: "100%",
    }} className="searchbar">

      <Seg id="dest" label="Alojamiento" value={selectedProp ? shortName(selectedProp) : ""}
           dark={dark} field={field} onToggle={toggle}>
        <Popover open={field === "dest"} onClose={close} width={290}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10, marginTop: 2 }}>
            Elige un apartamento
          </p>
          <div style={{ display: "grid", gap: 4 }}>
            {PROPERTIES.map(p => (
              <button key={p.id} onClick={() => { setSelectedId(p.id); toggle("in"); }}
                className="prop-option"
                style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14,
                  textAlign: "left", width: "100%",
                  background: selectedId === p.id ? "var(--paper-2)" : "transparent",
                  transition: "background .15s",
                }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "var(--grad-brand)", display: "grid", placeItems: "center", color: "#fff", flexShrink: 0 }}>
                  <Icon name="pin" size={20} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", lineHeight: 1.2 }}>{shortName(p)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{p.sector}, {p.ciudad} · Piso {p.piso}</div>
                </div>
              </button>
            ))}
          </div>
        </Popover>
      </Seg>

      <Divider glass={dark} />
      <Seg id="in" label="Llegada" value={range.start ? fmtFecha(range.start) : ""}
           dark={dark} field={field} onToggle={toggle}>
        <Popover open={field === "in"} onClose={close} width={340} align="left">
          <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) toggle("guests"); }} />
        </Popover>
      </Seg>

      <Divider />
      <Seg id="out" label="Salida" value={range.end ? fmtFecha(range.end) : ""}
           dark={dark} field={field} onToggle={toggle}>
        <Popover open={field === "out"} onClose={close} width={340} align="left">
          <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) toggle("guests"); }} />
        </Popover>
      </Seg>

      <Divider />
      <Seg id="guests" label="Huéspedes"
        value={totalG ? `${totalG} huésped${totalG > 1 ? "es" : ""}${guests.bebes ? " · " + guests.bebes + " bebé" + (guests.bebes > 1 ? "s" : "") : ""}` : ""}
        grow dark={dark} field={field} onToggle={toggle}>
        <Popover open={field === "guests"} onClose={close} width={320} align="right">
          <GuestPicker value={guests} onChange={setGuests} max={8} />
        </Popover>
      </Seg>

      <button className="btn btn-primary" style={{ padding: "0 26px", height: 56, borderRadius: 999, flexShrink: 0 }}
        onClick={() => { close(); onSearch && onSearch({ propertyId: selectedId, range, guests }); }}>
        <Icon name="search" size={19} /> <span className="search-label">Buscar</span>
      </button>
    </div>
  );
}

function Divider({ glass }) {
  return (
    <div className="sb-divider" style={{
      width: 1, height: 30, flexShrink: 0,
      background: glass ? "rgba(255,255,255,.22)" : "var(--line)",
    }} />
  );
}
