import { useState, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { PropImage } from '../components/PropImage';
import { RangeCalendar } from '../components/RangeCalendar';
import { GuestPicker } from '../components/GuestPicker';
import { useAvailability, isRangeAvailable } from '../hooks/useAvailability';
import { PROPERTIES, AMENIDADES } from '../data/properties';
import { TEMPORADA, TARIFAS, minNochesPara } from '../data/temporada';
import { formatCOP, nightsBetween, fmtFecha, huespedesTxt } from '../utils/helpers';
import { track } from '../analytics';

/*
 * Landing de temporada (/temporada). Pensada como destino de las campañas de Meta:
 * la persona ve condiciones, capacidad y tarifa de referencia ANTES de escribir,
 * elige fechas en el calendario real y deja sus datos en el checkout, que guarda
 * el lead en el CRM y abre WhatsApp con la solicitud completa.
 */

const DEFAULT_GUESTS = { adultos: 2, ninos: 0, bebes: 0 };
const EMPTY_RANGE = { start: null, end: null };

/** Tarifa "desde" para mostrar: la menor de temporada si existe, si no la base. */
function tarifaDesde(p) {
  const t = (TARIFAS[p.id] || []).map(x => x.precio).filter(Boolean);
  if (t.length) return { precio: Math.min(...t), temporada: true };
  return p.precio ? { precio: p.precio, temporada: false } : null;
}

function BookingPanel({ p, navigate }) {
  const [range, setRange] = useState(EMPTY_RANGE);
  const [guests, setGuests] = useState(DEFAULT_GUESTS);
  const [msg, setMsg] = useState(null);
  const { blockedRanges, loading, error } = useAvailability(p.id);
  const nights = nightsBetween(range.start, range.end);
  const minNoches = minNochesPara(p.id, range.start);

  function continuar() {
    if (!nights) { setMsg("Elige la fecha de llegada y la de salida."); return; }
    if (nights < minNoches) { setMsg(`Para esas fechas la estadía mínima es de ${minNoches} noches.`); return; }
    if (!isRangeAvailable(range.start, range.end, blockedRanges)) { setMsg("Esas fechas ya no están disponibles. Elige otras."); return; }
    track("season_select_dates", { content_ids: [p.id], nights, guests: guests.adultos + guests.ninos });
    navigate({ name: "checkout", id: p.id, booking: { range, guests } });
  }

  return (
    <div className="tp-panel">
      <div className="tp-panel-grid">
        <div>
          <h4 className="tp-h4">1. Elige tus fechas</h4>
          {loading && <p className="tp-note">Cargando disponibilidad…</p>}
          {!loading && error && (
            <p className="tp-note tp-note-info">Este alojamiento confirma disponibilidad por WhatsApp. Elige tus fechas y te respondemos.</p>
          )}
          <RangeCalendar range={range} months={2} blockedRanges={blockedRanges}
            onChange={(r) => { setRange(r); setMsg(null); }} />
        </div>
        <div>
          <h4 className="tp-h4">2. ¿Cuántos viajan?</h4>
          <GuestPicker value={guests} onChange={setGuests} max={p.huespedes} />
          <p className="tp-note">Capacidad máxima: {p.huespedes} personas.</p>
          <div className="tp-summary">
            <span>{range.start ? `${fmtFecha(range.start)} → ${range.end ? fmtFecha(range.end) : "…"}` : "Sin fechas"}</span>
            <span>{nights ? `${nights} noche${nights > 1 ? "s" : ""} · ` : ""}{huespedesTxt(guests)}</span>
          </div>
          {msg && <p role="status" className="tp-note tp-note-warn">{msg}</p>}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", height: 52, marginTop: 12 }} onClick={continuar}>
            Continuar con mi solicitud <Icon name="arrow" size={17} />
          </button>
          <p className="tp-note" style={{ textAlign: "center" }}>Sin cobros en este paso. Te atendemos por WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}

function SeasonCard({ p, navigate, open, onToggle }) {
  const desde = tarifaDesde(p);
  const amen = p.amenities.slice(0, 6).map(k => AMENIDADES[k]).filter(Boolean);
  return (
    <article className="tp-card" id={`t-${p.id}`}>
      <div className="tp-card-top">
        <div className="tp-card-img">
          <PropImage src={p.galeria[0]} alt={p.nombre} sizes="(max-width: 860px) 100vw, 420px" />
        </div>
        <div className="tp-card-body">
          <p className="eyebrow">{p.sector} · {p.ciudad}</p>
          <h3 className="tp-card-title">{p.nombre}</h3>
          <p className="tp-card-tag">{p.tagline}</p>

          <ul className="tp-facts">
            <li><Icon name="users" size={16} /> Hasta {p.huespedes} personas</li>
            <li><Icon name="bed" size={16} /> {p.hab} habitaciones</li>
            <li><Icon name="bath" size={16} /> {p.banos} baños</li>
            {p.piso && <li><Icon name="elevator" size={16} /> Piso {p.piso}</li>}
          </ul>

          <ul className="tp-amen">
            {amen.map(a => <li key={a.label}><Icon name={a.icon} size={15} /> {a.label}</li>)}
          </ul>

          <div className="tp-price">
            {desde ? (
              <>
                <span className="tp-price-from">desde</span>
                <span className="tp-price-val">{formatCOP(desde.precio)}</span>
                <span className="tp-price-unit">/ noche</span>
                <span className="tp-price-note">Tarifa de referencia{desde.temporada ? " de temporada" : ""} · valor final por WhatsApp</span>
              </>
            ) : (
              <>
                <span className="tp-price-val" style={{ fontSize: 19 }}>Cotización según tu grupo</span>
                <span className="tp-price-note">El valor depende del número de personas y servicios adicionales</span>
              </>
            )}
          </div>

          <div className="tp-card-actions">
            <button className="btn btn-primary" onClick={onToggle} aria-expanded={open}>
              <Icon name="cal" size={17} /> {open ? "Ocultar calendario" : "Ver fechas disponibles"}
            </button>
            <button className="btn btn-line" onClick={() => navigate({ name: "property", id: p.id })}>
              Ver fotos y detalles
            </button>
          </div>
          {p.rnt && <p className="tp-rnt">RNT {p.rnt}{p.rating ? ` · ★ ${p.rating} en Airbnb (${p.resenas} reseña${p.resenas === 1 ? "" : "s"})` : ""}</p>}
        </div>
      </div>
      {open && <BookingPanel p={p} navigate={navigate} />}
    </article>
  );
}

export function Temporada({ navigate }) {
  const [openId, setOpenId] = useState(null);

  useEffect(() => { track("season_landing_view", { season: TEMPORADA.slug }); }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="tp">
      {!TEMPORADA.confirmado && (
        <div className="tp-preview" role="note">
          Vista previa: condiciones y tarifas de temporada pendientes de confirmar por INNOVARE JM.
        </div>
      )}

      <header className="tp-hero">
        <PropImage src="/images/cartagena-1601/01.jpg" alt="Vista al mar Caribe desde Bocagrande" priority sizes="100vw"
          style={{ position: "absolute", inset: 0 }} />
        <div className="tp-hero-shade" />
        <div className="wrap tp-hero-in">
          <p className="eyebrow" style={{ color: "#bfeaff" }}>{TEMPORADA.nombre}</p>
          <h1 className="tp-h1">{TEMPORADA.titular}</h1>
          <p className="tp-lead">{TEMPORADA.intro}</p>
          <p className="tp-deadline"><Icon name="cal" size={16} /> Condiciones de temporada para reservas hasta el {TEMPORADA.cierre}</p>
          <div className="tp-hero-cta">
            <button className="btn btn-primary" onClick={() => scrollTo("alojamientos")}>Ver alojamientos y fechas</button>
            <button className="btn btn-ghost" onClick={() => scrollTo("condiciones")}>Condiciones</button>
          </div>
        </div>
      </header>

      <section className="wrap tp-steps" aria-label="Cómo reservar">
        {[
          ["cal", "Elige alojamiento y fechas", "El calendario muestra en tiempo real las noches ocupadas."],
          ["users", "Déjanos tus datos", "Nombre, WhatsApp y en qué punto está tu viaje. Toma un minuto."],
          ["wa", "Recibe tu cotización", "Tu asesora te escribe por WhatsApp con el valor final y cómo apartar."],
        ].map(([icon, t, d], i) => (
          <div key={t} className="tp-step">
            <span className="tp-step-n">{i + 1}</span>
            <div>
              <h3 className="tp-step-t"><Icon name={icon} size={17} /> {t}</h3>
              <p className="tp-step-d">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="condiciones" className="wrap tp-section">
        <p className="eyebrow">Antes de reservar</p>
        <h2 className="tp-h2">Condiciones de temporada</h2>
        <div className="tp-cond">
          {TEMPORADA.condiciones.map(c => (
            <div key={c.t} className="tp-cond-item">
              <span className="tp-cond-icon"><Icon name={c.icon} size={19} /></span>
              <div>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="tp-noinc"><strong>No incluye:</strong> {TEMPORADA.noIncluye.join(" · ")}.</p>
      </section>

      <section id="alojamientos" className="wrap tp-section">
        <p className="eyebrow">Alojamientos</p>
        <h2 className="tp-h2">Elige dónde pasar la temporada</h2>
        <div className="tp-list">
          {PROPERTIES.map(p => (
            <SeasonCard key={p.id} p={p} navigate={navigate} open={openId === p.id}
              onToggle={() => {
                const next = openId === p.id ? null : p.id;
                setOpenId(next);
                if (next) track("season_open_calendar", { content_ids: [p.id] });
              }} />
          ))}
        </div>
      </section>

      <style>{`
        .tp{ background: var(--paper); }
        .tp-preview{ position: relative; z-index: 5; margin-top: 70px; background: #fff6d6; color: #6b5300; font-size: 13.5px;
          text-align: center; padding: 10px 16px; border-bottom: 1px solid #f0dc9a; }
        .tp-hero{ position: relative; min-height: 560px; display: flex; align-items: flex-end; color: #fff; overflow: hidden; }
        .tp-preview + .tp-hero{ min-height: 520px; }
        .tp-hero-shade{ position: absolute; inset: 0; background: linear-gradient(180deg, rgba(12,38,56,.25) 0%, rgba(12,38,56,.82) 100%); }
        .tp-hero-in{ position: relative; padding: 140px 0 56px; }
        .tp-h1{ font-family: var(--serif); font-weight: 500; font-size: clamp(34px, 5vw, 60px); line-height: 1.05; max-width: 820px; margin-top: 10px; }
        .tp-lead{ font-size: 17.5px; line-height: 1.6; max-width: 640px; margin-top: 16px; color: rgba(255,255,255,.9); }
        .tp-deadline{ display: inline-flex; gap: 8px; align-items: center; margin-top: 18px; font-size: 14px; font-weight: 600;
          background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.3); border-radius: 99px; padding: 8px 14px; }
        .tp-hero-cta{ display: flex; gap: 12px; margin-top: 26px; flex-wrap: wrap; }

        .tp-steps{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: -34px; position: relative; z-index: 2; }
        .tp-step{ display: flex; gap: 14px; background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 20px; box-shadow: var(--sh-md); }
        .tp-step-n{ width: 32px; height: 32px; border-radius: 99px; background: var(--grad-brand); color: #fff; display: grid; place-items: center; font-weight: 700; flex-shrink: 0; }
        .tp-step-t{ font-size: 16px; font-weight: 700; display: flex; gap: 7px; align-items: center; }
        .tp-step-d{ font-size: 14px; color: var(--muted); margin-top: 4px; line-height: 1.5; }

        .tp-section{ padding-top: 72px; }
        .tp-h2{ font-family: var(--serif); font-weight: 500; font-size: clamp(28px, 3.4vw, 40px); margin-top: 8px; margin-bottom: 26px; }
        .tp-cond{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
        .tp-cond-item{ display: flex; gap: 14px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 18px; }
        .tp-cond-item h3{ font-size: 15.5px; font-weight: 700; }
        .tp-cond-item p{ font-size: 14px; color: var(--muted); margin-top: 4px; line-height: 1.5; }
        .tp-cond-icon{ width: 40px; height: 40px; border-radius: 11px; background: var(--paper-2); color: var(--blue); display: grid; place-items: center; flex-shrink: 0; }
        .tp-noinc{ font-size: 14px; color: var(--ink-2); margin-top: 16px; }

        .tp-list{ display: grid; gap: 22px; padding-bottom: 90px; }
        .tp-card{ background: #fff; border: 1px solid var(--line); border-radius: 22px; overflow: hidden; box-shadow: var(--sh-sm); }
        .tp-card-top{ display: grid; grid-template-columns: 420px 1fr; }
        .tp-card-img{ position: relative; min-height: 300px; }
        .tp-card-body{ padding: 26px 28px; }
        .tp-card-title{ font-size: 24px; font-weight: 700; margin-top: 6px; }
        .tp-card-tag{ color: var(--muted); font-size: 15px; margin-top: 4px; }
        .tp-facts{ display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 16px; font-size: 14.5px; font-weight: 600; }
        .tp-facts li, .tp-amen li{ display: inline-flex; gap: 6px; align-items: center; }
        .tp-amen{ display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 12px; font-size: 13.5px; color: var(--ink-2); }
        .tp-price{ display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 6px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); }
        .tp-price-from{ font-family: var(--serif); font-style: italic; color: var(--muted); }
        .tp-price-val{ font-family: var(--mono); font-size: 24px; font-weight: 700; }
        .tp-price-unit{ color: var(--muted); }
        .tp-price-note{ flex-basis: 100%; font-size: 12.5px; color: var(--muted); }
        .tp-card-actions{ display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
        .tp-rnt{ font-size: 12px; color: var(--muted); margin-top: 12px; }

        .tp-panel{ border-top: 1px solid var(--line); background: var(--paper); padding: 24px 28px; }
        .tp-panel-grid{ display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 34px; }
        .tp-h4{ font-size: 15px; font-weight: 700; margin-bottom: 10px; }
        .tp-note{ font-size: 12.5px; color: var(--muted); margin-top: 8px; }
        .tp-note-info{ color: var(--blue-deep); background: var(--paper-2); border-radius: 10px; padding: 8px 10px; margin-bottom: 8px; }
        .tp-note-warn{ color: #9a3b3b; background: rgba(220,60,60,.07); border-radius: 10px; padding: 9px 11px; }
        .tp-summary{ display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; font-size: 14px; font-weight: 600;
          background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; margin-top: 12px; }

        @media (max-width: 860px){
          .tp-steps{ grid-template-columns: 1fr; margin-top: 18px; }
          .tp-card-top{ grid-template-columns: 1fr; }
          .tp-card-img{ min-height: 220px; }
          .tp-card-body{ padding: 20px 18px; }
          .tp-panel{ padding: 20px 16px; }
          .tp-panel-grid{ grid-template-columns: 1fr; gap: 22px; }
          .tp-hero{ min-height: 520px; }
          .tp-hero-in{ padding: 120px 0 40px; }
          .tp-section{ padding-top: 52px; }
        }
      `}</style>
    </main>
  );
}
