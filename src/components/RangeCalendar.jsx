import { useState } from 'react';
import { Icon } from '../icons/Icon';
import { MESES } from '../utils/helpers';

export function RangeCalendar({ range, onChange, months = 1, minDate }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const min = minDate || today;
  const [view, setView] = useState(() => new Date(min.getFullYear(), min.getMonth(), 1));
  const [hover, setHover] = useState(null);

  function pick(d) {
    const { start, end } = range;
    if (!start || (start && end)) { onChange({ start: d, end: null }); }
    else if (d < start) { onChange({ start: d, end: null }); }
    else { onChange({ start, end: d }); }
  }

  function Month({ offset }) {
    const base = new Date(view.getFullYear(), view.getMonth() + offset, 1);
    const y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1);
    const startDay = (first.getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));

    const { start, end } = range;
    return (
      <div style={{ flex: 1, minWidth: 246 }}>
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
            const disabled = d < min;
            const isStart = start && +d === +start;
            const isEnd = end && +d === +end;
            const eff = end || hover;
            const inRange = start && eff && d > start && d < eff;
            const selected = isStart || isEnd;
            return (
              <button key={i} disabled={disabled}
                onMouseEnter={() => !disabled && start && !end && setHover(d)}
                onClick={() => !disabled && pick(d)}
                style={{
                  aspectRatio: "1", borderRadius: 9, fontSize: 13.5, fontWeight: selected ? 700 : 500,
                  color: disabled ? "#c8ced3" : selected ? "#fff" : "var(--ink)",
                  background: selected ? "var(--blue)" : inRange ? "rgba(43,168,224,.14)" : "transparent",
                  cursor: disabled ? "default" : "pointer",
                  transition: "background .15s",
                }}
                onMouseOver={e => { if (!disabled && !selected) e.currentTarget.style.background = inRange ? "rgba(43,168,224,.22)" : "var(--paper-2)"; }}
                onMouseOut={e => { if (!disabled && !selected) e.currentTarget.style.background = inRange ? "rgba(43,168,224,.14)" : "transparent"; }}
              >{d.getDate()}</button>
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
          style={{ opacity: canPrev ? 1 : .3, padding: 8, color: "var(--ink)" }} disabled={!canPrev}>
          <Icon name="chevL" size={18} />
        </button>
        <button onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          style={{ padding: 8, color: "var(--ink)" }}>
          <Icon name="chevR" size={18} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 28 }} className="cal-months">
        <Month offset={0} />
        {months === 2 && <Month offset={1} />}
      </div>
      <style>{`@media (max-width:560px){ .cal-months > div:nth-child(2){ display:none; } }`}</style>
    </div>
  );
}
