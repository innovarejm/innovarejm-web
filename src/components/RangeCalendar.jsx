import { useState } from 'react';
import { Icon } from '../icons/Icon';
import { MESES } from '../utils/helpers';
import { isDateBlocked, firstBlockedAfter } from '../hooks/useAvailability';

export function RangeCalendar({ range, onChange, months = 1, minDate, blockedRanges = [] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const min = minDate || today;
  const [view, setView] = useState(() => {
    const base = range.start || min;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [hover, setHover] = useState(null);

  const { start, end } = range;
  const selectingEnd = !!start && !end;
  // Mientras se elige la salida: no se puede pasar por encima de una reserva,
  // pero sí salir el mismo día en que entra el siguiente huésped.
  const maxEnd = selectingEnd ? firstBlockedAfter(start, blockedRanges) : null;

  function dayState(d) {
    const past = d < min;
    const blocked = isDateBlocked(d, blockedRanges);
    if (selectingEnd && d > start) {
      const tooFar = maxEnd && d > maxEnd;
      const checkoutOnly = blocked && maxEnd && +d === +maxEnd;
      return { disabled: !!tooFar, blocked: blocked && !checkoutOnly, checkoutOnly };
    }
    return { disabled: past || blocked, blocked, checkoutOnly: false };
  }

  function pick(d) {
    if (!start || end) { onChange({ start: d, end: null }); setHover(null); }
    else if (+d === +start) return;
    else if (d < start) onChange({ start: d, end: null });
    else { onChange({ start, end: d }); setHover(null); }
  }

  function renderMonth(offset) {
    const base = new Date(view.getFullYear(), view.getMonth() + offset, 1);
    const y = base.getFullYear(), m = base.getMonth();
    const startDay = (new Date(y, m, 1).getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));

    return (
      <div key={offset} style={{ flex: 1, minWidth: 246 }}>
        <div style={{ textAlign: "center", fontWeight: 600, fontSize: 15, marginBottom: 12, textTransform: "capitalize" }}>
          {MESES[m]} {y}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, fontSize: 11,
          color: "var(--muted)", fontFamily: "var(--mono)", marginBottom: 6 }}>
          {["lu","ma","mi","ju","vi","sá","do"].map(d => <div key={d} style={{ textAlign: "center" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const { disabled, blocked, checkoutOnly } = dayState(d);
            const isStart  = start && +d === +start;
            const isEnd    = end && +d === +end;
            const eff      = end || hover;
            const inRange  = start && eff && d > start && d < eff;
            const selected = isStart || isEnd;

            return (
              <button key={i} disabled={disabled}
                onMouseEnter={() => !disabled && selectingEnd && d > start && setHover(d)}
                onClick={() => !disabled && pick(d)}
                title={checkoutOnly ? "Solo salida (ese día entra otro huésped)" : blocked ? "No disponible (reservado)" : undefined}
                aria-label={`${d.getDate()} de ${MESES[m]}${blocked ? ", no disponible" : ""}${checkoutOnly ? ", solo salida" : ""}`}
                className={"cal-day" + (selected ? " sel" : "")}
                style={{
                  aspectRatio: "1", borderRadius: 9,
                  fontSize: 13.5, fontWeight: selected ? 700 : 500,
                  color: selected ? "#fff"
                    : blocked ? "#e08080"
                    : disabled ? "#c8ced3"
                    : "var(--ink)",
                  background: selected
                    ? "var(--blue)"
                    : blocked   ? "rgba(220,60,60,.08)"
                    : inRange   ? "rgba(43,168,224,.14)"
                    : "transparent",
                  textDecoration: blocked ? "line-through" : "none",
                  cursor: disabled ? "not-allowed" : "pointer",
                  transition: "background .15s",
                  position: "relative",
                  "--day-hover": inRange ? "rgba(43,168,224,.22)" : "var(--paper-2)",
                }}
              >
                {d.getDate()}
                {/* Punto rojo debajo del número para días bloqueados */}
                {(blocked || checkoutOnly) && (
                  <span style={{
                    position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)",
                    width: 4, height: 4, borderRadius: "50%", background: checkoutOnly ? "var(--blue)" : "#e08080", display: "block",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const canPrev = new Date(view.getFullYear(), view.getMonth(), 1) > new Date(min.getFullYear(), min.getMonth(), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <button onClick={() => canPrev && setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          aria-label="Mes anterior"
          style={{ opacity: canPrev ? 1 : .3, padding: 8, color: "var(--ink)" }} disabled={!canPrev}>
          <Icon name="chevL" size={18} />
        </button>
        <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          aria-label="Mes siguiente"
          style={{ padding: 8, color: "var(--ink)" }}>
          <Icon name="chevR" size={18} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 28 }} className="cal-months">
        {renderMonth(0)}
        {months === 2 && renderMonth(1)}
      </div>

      {selectingEnd && (
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>Ahora elige la fecha de salida.</p>
      )}

      {/* Leyenda */}
      {blockedRanges.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11.5, color: "var(--muted)", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--blue)", display: "inline-block" }} />
            Seleccionado
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(220,60,60,.15)", display: "inline-block" }} />
            No disponible
          </span>
        </div>
      )}

      <style>{`
        .cal-day:not(:disabled):not(.sel):hover{ background: var(--day-hover) !important; }
        @media (max-width:560px){ .cal-months > div:nth-child(2){ display:none; } }
      `}</style>
    </div>
  );
}
