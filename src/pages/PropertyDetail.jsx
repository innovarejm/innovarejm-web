import { useState, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { Placeholder } from '../components/Placeholder';
import { PropImage } from '../components/PropImage';
import { RangeCalendar } from '../components/RangeCalendar';
import { GuestPicker } from '../components/GuestPicker';
import { useReveal } from '../hooks/useReveal';
import { useAvailability } from '../hooks/useAvailability';
import { PROPERTIES, AMENIDADES, waLink } from '../data/properties';
import { formatCOP, nightsBetween, fmtFecha, calcSubtotal } from '../utils/helpers';

/* ---------- Galería ---------- */
function Gallery({ p }) {
  const [lightbox, setLightbox] = useState(null);
  return (
    <>
      <div className="gallery">
        <button className="g-main" onClick={() => setLightbox(0)}>
          <PropImage src={p.galeria[0]} alt={`${p.nombre} - foto principal`} priority />
        </button>
        {p.galeria.slice(1, 5).map((g, i) => (
          <button key={i} className="g-cell" onClick={() => setLightbox(i + 1)}>
            <PropImage src={g} alt={`${p.nombre} - foto ${i + 2}`} />
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
            <PropImage src={p.galeria[lightbox]} alt={`${p.nombre} - foto ${lightbox + 1}`} />
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
    </>
  );
}

/* ---------- Mapa real (OpenStreetMap) con zona aproximada ---------- */
function LocationMap({ p }) {
  const [lat, lng] = p.geo;
  // Caja de ~2 km centrada en el punto, con la proporción del contenedor
  const dLat = 0.009, dLng = dLat * 2.4 / Math.cos(lat * Math.PI / 180);
  const bbox = [lng - dLng, lat - dLat, lng + dLng, lat + dLat].map(n => n.toFixed(5)).join(",");
  return (
    <div style={{ position: "absolute", inset: 0, background: "#e8eef2" }}>
      <iframe
        title={`Mapa de ${p.sector}, ${p.ciudad}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
        loading="lazy"
        style={{ border: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none", filter: "saturate(.85)" }}
      />
      {/* Zona aproximada: Airbnb solo publica coordenadas aproximadas */}
      <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", width: 130, height: 130, transform: "translate(-50%,-50%)",
        borderRadius: 999, background: "rgba(21,119,194,.16)", border: "2px solid rgba(21,119,194,.5)" }} />
      <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        width: 44, height: 44, borderRadius: 99, background: "var(--grad-brand)", display: "grid", placeItems: "center",
        color: "#fff", boxShadow: "var(--sh-md)", border: "3px solid #fff" }}>
        <Icon name={p.ciudad === "Darién" ? "tree" : "sea"} size={20} />
      </div>
      <span style={{ position: "absolute", left: 14, bottom: 14, fontSize: 12, fontWeight: 600,
        color: "var(--blue-deep)", background: "rgba(255,255,255,.92)", padding: "6px 12px", borderRadius: 99, boxShadow: "var(--sh-sm)" }}>
        Ubicación aproximada
      </span>
      <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
        style={{ position: "absolute", right: 14, bottom: 14, fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
          background: "#fff", padding: "8px 14px", borderRadius: 99, boxShadow: "var(--sh-md)", display: "inline-flex", gap: 6, alignItems: "center" }}>
        <Icon name="map" size={15} /> Abrir en Google Maps
      </a>
    </div>
  );
}

/* ---------- Widget de reserva ---------- */
function BookingWidget({ p, navigate }) {
  const [range, setRange] = useState({ start: null, end: null });
  const [guests, setGuests] = useState({ adultos: 2, ninos: 0, bebes: 0 });
  const [openCal, setOpenCal] = useState(false);
  const [openG, setOpenG] = useState(false);
  const { blockedRanges, loading: loadingAvail } = useAvailability(p.id);

  const nights = nightsBetween(range.start, range.end);
  const { subtotal, rows: priceRows } = calcSubtotal(range.start, range.end, p.precio, p.precioFinde);
  const total = subtotal;
  const totalG = guests.adultos + guests.ninos;
  // Sin precio fijo → el flujo es cotizar por WhatsApp en lugar de ir al checkout
  const quote = !p.precio;
  const fechasTxt = nights ? ` del ${fmtFecha(range.start)} al ${fmtFecha(range.end)} (${nights} noche${nights > 1 ? "s" : ""})` : "";
  const waMsg = quote
    ? `Hola INNOVARE JM, quiero cotizar "${p.nombre}" para ${totalG} persona${totalG > 1 ? "s" : ""}${fechasTxt}. ¿Me envían precio y disponibilidad?`
    : `Hola INNOVARE JM, me interesa "${p.nombre}"${nights ? ` del ${fmtFecha(range.start)} al ${fmtFecha(range.end)} (${nights} noches, ${totalG} huéspedes)` : ""}. ¿Disponibilidad?`;

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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <div>
          {quote ? (
            <>
              <span style={{ display: "block", fontSize: 22, fontWeight: 700 }}>Precio a consultar</span>
              <span style={{ display: "block", fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>Según número de personas y fechas</span>
            </>
          ) : (
            <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)" }}>desde</span>
              <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "-.01em" }}>{formatCOP(p.precio)}</span>
              <span style={{ color: "var(--muted)", fontSize: 15 }}> / noche</span>
            </span>
          )}
        </div>
        {p.rating ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, flexShrink: 0 }}>
            <Icon name="star" size={14} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
            {p.rating} · <span style={{ color: "var(--muted)" }}>{p.resenas} reseñas</span>
          </span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", padding: "4px 11px", borderRadius: 99, flexShrink: 0, background: "var(--paper-2)", color: "var(--blue-deep)" }}>
            Nuevo
          </span>
        )}
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
            {loadingAvail && (
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Cargando disponibilidad…</p>
            )}
            <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) setOpenCal(false); }} blockedRanges={blockedRanges} />
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

      {!quote && (
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 14, height: 54, fontSize: 16 }} onClick={reservar}>
          {nights ? "Reservar" : "Comprobar disponibilidad"}
        </button>
      )}
      <a className="btn btn-wa" style={{ width: "100%", justifyContent: "center", marginTop: quote ? 14 : 10, height: quote ? 54 : 50, fontSize: quote ? 16 : undefined }}
        href={waLink(waMsg)}
        target="_blank" rel="noopener noreferrer">
        <Icon name="wa" size={18} /> {quote ? "Cotizar por WhatsApp" : "Consultar por WhatsApp"}
      </a>

      {quote ? (
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
          El valor depende del número de personas. Elige fechas y huéspedes y te enviamos la cotización por WhatsApp.
        </p>
      ) : nights > 0 ? (
        <div style={{ marginTop: 22, display: "grid", gap: 12, fontSize: 14.5 }}>
          {priceRows.map((r, i) => (
            <PriceRow key={i} l={`${formatCOP(r.price)} × ${r.count} noche${r.count > 1 ? "s" : ""}${r.label ? ` (${r.label})` : ""}`} r={formatCOP(r.price * r.count)} />
          ))}
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 16.5 }}>
            <span>Total</span><span>{formatCOP(total)}</span>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 16, textAlign: "center", fontSize: 13.5, color: "var(--muted)" }}>
          Selecciona tus fechas para ver el total. Aún no se hará ningún cobro.
        </p>
      )}
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
          <Icon name="arrowL" size={16} /> Todos los alojamientos
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: "clamp(26px,3.4vw,40px)", fontWeight: 700 }}>{p.nombre}</h1>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 14.5, color: "var(--ink-2)", flexWrap: "wrap" }}>
              {p.rating ? (
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                  <Icon name="star" size={15} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
                  {p.rating} · {p.resenas} reseñas
                </span>
              ) : (
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                  <Icon name="sparkle" size={15} style={{ color: "oklch(0.78 0.09 75)" }} /> Nuevo en INNOVARE
                </span>
              )}
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
              {p.hab} habitaciones · {p.camas ? `${p.camas} camas · ` : ""}{p.banos} baños · hasta {p.huespedes} huéspedes{p.piso ? ` · Piso ${p.piso}` : ""}
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
            <div className="map-box" style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
              <LocationMap p={p} />
            </div>
            <p style={{ marginTop: 14, color: "var(--ink-2)", fontSize: 15 }}>
              <strong>{p.sector}, {p.ciudad}</strong> — {p.ubicacion || "a pasos del mar Caribe."}
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
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(otras.length, 3)}, 1fr)`, gap: 28 }} className="otras-grid">
            {otras.map((o, i) => (
              <article key={o.id} className="reveal" style={{ transitionDelay: (i * 90) + "ms", cursor: "pointer" }}
                onClick={() => navigate({ name: "property", id: o.id })}>
                <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "1.04" }}>
                  <PropImage src={o.galeria[0]} alt={o.nombre} />
                </div>
                <div style={{ paddingTop: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>{o.nombre}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>{o.sector}, {o.ciudad}</p>
                  <p style={{ marginTop: 6, fontSize: 14.5 }}>
                    {o.precio ? (
                      <>
                        <strong>{formatCOP(o.precio)}</strong>
                        <span style={{ color: "var(--muted)" }}> / noche</span>
                      </>
                    ) : (
                      <strong>Precio a consultar</strong>
                    )}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
