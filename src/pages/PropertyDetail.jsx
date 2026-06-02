import { useState, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { Placeholder } from '../components/Placeholder';
import { RangeCalendar } from '../components/RangeCalendar';
import { GuestPicker } from '../components/GuestPicker';
import { useReveal } from '../hooks/useReveal';
import { PROPERTIES, AMENIDADES, waLink } from '../data/properties';
import { formatCOP, nightsBetween, fmtFecha } from '../utils/helpers';

/* ---------- Galería ---------- */
function Gallery({ p }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <>
      <div className="gallery">
        <button className="g-main" onClick={() => setLightbox(0)}>
          <Placeholder label={p.galeria[0]} style={{ position: "absolute", inset: 0 }} />
        </button>
        {p.galeria.slice(1, 5).map((g, i) => (
          <button key={i} className="g-cell" onClick={() => setLightbox(i + 1)}>
            <Placeholder label={g} style={{ position: "absolute", inset: 0 }} />
            {i === 3 && (
              <span style={{ position: "absolute", right: 14, bottom: 14, zIndex: 3, fontSize: 13, fontWeight: 600,
                padding: "9px 16px", borderRadius: 99, background: "rgba(255,255,255,.94)", color: "var(--ink)",
                display: "inline-flex", gap: 7, alignItems: "center", boxShadow: "var(--sh-sm)" }}>
                <Icon name="grid" size={15} /> {p.galeria.length} fotos
              </span>
            )}
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,24,38,.94)",
          display: "grid", placeItems: "center", animation: "fade .25s" }}>
          <button style={{ position: "absolute", top: 22, right: 22, color: "#fff", padding: 8 }}>
            <Icon name="close" size={26} />
          </button>
          <button onClick={e => { e.stopPropagation(); setLightbox(l => (l - 1 + p.galeria.length) % p.galeria.length); }}
            style={{ position: "absolute", left: 18, color: "#fff", padding: 12 }}>
            <Icon name="chevL" size={30} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ width: "min(1000px, 90vw)", aspectRatio: "1.5", borderRadius: 18, overflow: "hidden", position: "relative" }}>
            <Placeholder label={p.galeria[lightbox]} style={{ position: "absolute", inset: 0 }} />
          </div>
          <button onClick={e => { e.stopPropagation(); setLightbox(l => (l + 1) % p.galeria.length); }}
            style={{ position: "absolute", right: 18, color: "#fff", padding: 12 }}>
            <Icon name="chevR" size={30} />
          </button>
          <div style={{ position: "absolute", bottom: 26, color: "rgba(255,255,255,.8)", fontFamily: "var(--mono)", fontSize: 13 }}>
            {lightbox + 1} / {p.galeria.length}
          </div>
        </div>
      )}
      <style>{`
        .gallery{ display:grid; grid-template-columns:1.5fr 1fr 1fr; grid-template-rows:1fr 1fr; gap:10px;
          height:min(58vh,520px); border-radius:24px; overflow:hidden; }
        .gallery button{ position:relative; overflow:hidden; cursor:pointer; }
        .gallery .g-main{ grid-row:1/3; }
        .gallery .ph{ transition: transform .5s var(--ease); }
        .gallery button:hover .ph{ transform:scale(1.05); }
        .gallery button:hover::after{ content:""; position:absolute; inset:0; background:rgba(12,38,56,.08); z-index:2; }
        @keyframes fade{ from{opacity:0;} to{opacity:1;} }
        @media (max-width:760px){ .gallery{ grid-template-columns:1fr 1fr; grid-template-rows:1.4fr 1fr; height:auto; }
          .gallery .g-main{ grid-column:1/3; grid-row:1; aspect-ratio:1.6; }
          .gallery .g-cell:nth-child(4),.gallery .g-cell:nth-child(5){ display:none; }
          .gallery .g-cell{ aspect-ratio:1.3; } }
      `}</style>
    </>
  );
}

/* ---------- Mapa minimalista ---------- */
function MapMini({ p }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#eaf3f8,#dfeef5)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .5,
        backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
        backgroundSize: "44px 44px" }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: "46%",
        background: "linear-gradient(180deg, rgba(43,168,224,.22), rgba(21,119,194,.30))" }} />
      <div style={{ position: "absolute", left: `${p.lng * 70 + 12}%`, top: `${p.lat * 50 + 20}%`, transform: "translate(-50%,-100%)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 99, background: "var(--grad-brand)", display: "grid", placeItems: "center",
          color: "#fff", boxShadow: "var(--sh-md)", border: "3px solid #fff", animation: "pinPulse 2.4s ease-in-out infinite" }}>
          <Icon name="pin" size={22} />
        </div>
      </div>
      <span style={{ position: "absolute", left: 16, bottom: 14, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".1em",
        color: "var(--blue-deep)", background: "rgba(255,255,255,.7)", padding: "5px 10px", borderRadius: 99 }}>
        mapa · {p.ciudad}
      </span>
      <style>{`@keyframes pinPulse{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-6px);} }`}</style>
    </div>
  );
}

/* ---------- Widget de reserva ---------- */
function BookingWidget({ p, navigate }) {
  const [range, setRange] = useState({ start: null, end: null });
  const [guests, setGuests] = useState({ adultos: 2, ninos: 0, bebes: 0 });
  const [openCal, setOpenCal] = useState(false);
  const [openG, setOpenG] = useState(false);

  const nights = nightsBetween(range.start, range.end);
  const subtotal = nights * p.precio;
  const servicio = Math.round(subtotal * p.servicioPct);
  const total = subtotal + (nights ? p.aseo : 0) + servicio;
  const totalG = guests.adultos + guests.ninos;

  function reservar() {
    if (!nights) { setOpenCal(true); return; }
    navigate({ name: "checkout", id: p.id, booking: { range: { start: +range.start, end: +range.end }, guests } });
  }

  const fieldStyle = (rb) => ({
    textAlign: "left", padding: "12px 16px",
    borderRight: rb ? "1px solid var(--line-strong)" : "none", display: "block",
  });
  const lblStyle = { display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)" };
  const valStyle = (v) => ({ display: "block", fontSize: 14, marginTop: 2, color: v ? "var(--ink-2)" : "var(--muted)" });

  return (
    <div className="bw">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)" }}>desde</span>
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "-.01em" }}>{formatCOP(p.precio)}</span>
            <span style={{ color: "var(--muted)", fontSize: 15 }}> / noche</span>
          </span>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14 }}>
          <Icon name="star" size={14} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
          {p.rating} · <span style={{ color: "var(--muted)" }}>{p.resenas} reseñas</span>
        </span>
      </div>

      <div style={{ border: "1px solid var(--line-strong)", borderRadius: 14, overflow: "visible", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <button onClick={() => { setOpenCal(o => !o); setOpenG(false); }} style={fieldStyle(true)}>
            <span style={lblStyle}>Llegada</span>
            <span style={valStyle(range.start)}>{range.start ? fmtFecha(range.start) : "Agregar"}</span>
          </button>
          <button onClick={() => { setOpenCal(o => !o); setOpenG(false); }} style={fieldStyle(false)}>
            <span style={lblStyle}>Salida</span>
            <span style={valStyle(range.end)}>{range.end ? fmtFecha(range.end) : "Agregar"}</span>
          </button>
        </div>
        <button onClick={() => { setOpenG(o => !o); setOpenCal(false); }} style={{ ...fieldStyle(true), width: "100%", borderTop: "1px solid var(--line-strong)", borderRight: "none" }}>
          <span style={lblStyle}>Huéspedes</span>
          <span style={valStyle(true)}>{totalG} huésped{totalG > 1 ? "es" : ""}{guests.bebes ? `, ${guests.bebes} bebé${guests.bebes > 1 ? "s" : ""}` : ""}</span>
        </button>

        {openCal && (
          <div style={{ position: "absolute", top: "calc(100% + 14px)", left: 0, width: 340, zIndex: 60,
            background: "#fff", borderRadius: 22, boxShadow: "var(--sh-lg)", border: "1px solid var(--line)", padding: 20 }}>
            <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) setOpenCal(false); }} />
            <button onClick={() => setRange({ start: null, end: null })} style={{ marginTop: 6, fontSize: 13, fontWeight: 600, textDecoration: "underline", color: "var(--ink-2)" }}>
              Borrar fechas
            </button>
          </div>
        )}
        {openG && (
          <div style={{ position: "absolute", top: "calc(100% + 14px)", right: 0, width: 300, zIndex: 60,
            background: "#fff", borderRadius: 22, boxShadow: "var(--sh-lg)", border: "1px solid var(--line)", padding: 20 }}>
            <GuestPicker value={guests} onChange={setGuests} max={p.huespedes} />
            <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10 }}>Capacidad máxima: {p.huespedes} huéspedes.</p>
          </div>
        )}
      </div>

      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 14, height: 54, fontSize: 16 }} onClick={reservar}>
        {nights ? "Reservar" : "Comprobar disponibilidad"}
      </button>
      <a className="btn btn-wa" style={{ width: "100%", justifyContent: "center", marginTop: 10, height: 50 }}
        href={waLink(`Hola INNOVARE JM, me interesa "${p.nombre}"${nights ? ` del ${fmtFecha(range.start)} al ${fmtFecha(range.end)} (${nights} noches, ${totalG} huéspedes)` : ""}. ¿Disponibilidad?`)}
        target="_blank" rel="noopener">
        <Icon name="wa" size={18} /> Consultar por WhatsApp
      </a>

      {nights > 0 ? (
        <div style={{ marginTop: 22, display: "grid", gap: 12, fontSize: 14.5 }}>
          <PriceRow l={`${formatCOP(p.precio)} × ${nights} noche${nights > 1 ? "s" : ""}`} r={formatCOP(subtotal)} />
          <PriceRow l="Tarifa de limpieza" r={formatCOP(p.aseo)} />
          <PriceRow l="Tarifa de servicio" r={formatCOP(servicio)} />
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16.5 }}>
            <span>Total</span><span>{formatCOP(total)}</span>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
          Selecciona tus fechas para ver el total. Aún no se hará ningún cobro.
        </p>
      )}
      <style>{`.bw{ background:#fff; border:1px solid var(--line); border-radius:22px; padding:24px; box-shadow:var(--sh-lg); }`}</style>
    </div>
  );
}

function PriceRow({ l, r }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-2)" }}>
      <span style={{ textDecoration: "underline", textDecorationColor: "var(--line-strong)" }}>{l}</span>
      <span>{r}</span>
    </div>
  );
}

/* ---------- Página de detalle ---------- */
export function PropertyDetail({ id, navigate }) {
  const p = PROPERTIES.find(x => x.id === id) || PROPERTIES[0];
  const ref = useReveal();
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const otras = PROPERTIES.filter(x => x.id !== p.id);

  return (
    <main ref={ref} style={{ paddingTop: 78 }}>
      <div className="wrap" style={{ paddingTop: 26 }}>
        <button onClick={() => navigate({ name: "home" }, "#listado")} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: "var(--ink-2)", fontWeight: 500, marginBottom: 16 }}>
          <Icon name="arrowL" size={16} /> Todos los apartamentos
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: "clamp(26px,3.4vw,40px)", fontWeight: 700 }}>{p.nombre}</h1>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 14.5, color: "var(--ink-2)", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                <Icon name="star" size={15} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
                {p.rating} · {p.resenas} reseñas
              </span>
              <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                <Icon name="pin" size={15} /> {p.sector}, {p.ciudad}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap"><Gallery p={p} /></div>

      <div className="wrap detail-grid" style={{ paddingTop: 44, paddingBottom: 90 }}>
        <div className="detail-main">
          <div className="reveal" style={{ paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700 }}>{p.tagline}</h2>
            <p style={{ marginTop: 8, color: "var(--ink-2)", fontSize: 15.5 }}>
              {p.hab} habitaciones · {p.banos} baños · hasta {p.huespedes} huéspedes · Piso {p.piso}
            </p>
          </div>

          <div className="reveal" style={{ display: "grid", gap: 22, paddingBlock: 30, borderBottom: "1px solid var(--line)" }}>
            {p.highlights.map(h => (
              <div key={h.t} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ color: "var(--blue)", flexShrink: 0, marginTop: 2 }}><Icon name={h.icon} size={26} /></span>
                <div>
                  <h3 style={{ fontSize: 16.5, fontWeight: 600 }}>{h.t}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 2 }}>{h.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="reveal" style={{ paddingBlock: 30, borderBottom: "1px solid var(--line)" }}>
            <p style={{ fontSize: 16.5, lineHeight: 1.75, color: "var(--ink-2)" }}>{p.descripcion}</p>
          </div>

          <div className="reveal" style={{ paddingBlock: 30, borderBottom: "1px solid var(--line)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 22 }}>Lo que este lugar ofrece</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }} className="amen-grid">
              {p.amenities.map(a => (
                <div key={a} style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 15.5, color: "var(--ink-2)" }}>
                  <Icon name={AMENIDADES[a].icon} size={22} style={{ color: "var(--ink)" }} /> {AMENIDADES[a].label}
                </div>
              ))}
            </div>
          </div>

          <div className="reveal" style={{ paddingTop: 30 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Dónde estarás</h2>
            <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", aspectRatio: "2.4" }}>
              <MapMini p={p} />
            </div>
            <p style={{ marginTop: 14, color: "var(--ink-2)", fontSize: 15 }}>
              <strong>{p.sector}, {p.ciudad}</strong> — a pasos del mar Caribe.
            </p>
          </div>
        </div>

        <aside className="detail-side">
          <div style={{ position: "sticky", top: 96 }}>
            <BookingWidget p={p} navigate={navigate} />
          </div>
        </aside>
      </div>

      <section style={{ background: "var(--paper-2)", paddingBlock: 70 }}>
        <div className="wrap">
          <h2 className="reveal" style={{ fontSize: 26, fontWeight: 700, marginBottom: 26 }}>También te puede gustar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="otras-grid">
            {otras.map((o, i) => (
              <article key={o.id} className="reveal" style={{ transitionDelay: (i * 90) + "ms", cursor: "pointer" }}
                onClick={() => navigate({ name: "property", id: o.id })}>
                <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "1.04" }}>
                  <Placeholder label={o.galeria[0]} style={{ position: "absolute", inset: 0 }} />
                </div>
                <div style={{ paddingTop: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{o.nombre}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>{o.sector}, {o.ciudad}</p>
                  <p style={{ marginTop: 6, fontSize: 14.5 }}>
                    <strong>{formatCOP(o.precio)}</strong>
                    <span style={{ color: "var(--muted)" }}> / noche</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .detail-grid{ display:grid; grid-template-columns:1fr 380px; gap:64px; align-items:start; }
        @media (max-width:980px){ .detail-grid{ grid-template-columns:1fr; gap:30px; }
          .detail-side{ order:-1; } .detail-side > div{ position:static !important; }
          .otras-grid{ grid-template-columns:1fr !important; } }
        @media (max-width:520px){ .amen-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </main>
  );
}
