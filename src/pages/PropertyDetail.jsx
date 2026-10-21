import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '../icons/Icon';
import { PropImage } from '../components/PropImage';
import { RangeCalendar } from '../components/RangeCalendar';
import { GuestPicker } from '../components/GuestPicker';
import { useReveal } from '../hooks/useReveal';
import { useAvailability, isRangeAvailable } from '../hooks/useAvailability';
import { PROPERTIES, AMENIDADES, findProperty, airbnbReviewsUrl, waLink } from '../data/properties';
import { formatCOP, nightsBetween, fmtFecha, calcSubtotal, huespedesTxt } from '../utils/helpers';
import { routeToUrl, replaceUrl } from '../router';
import { NotFound } from './Privacy';

const DEFAULT_GUESTS = { adultos: 2, ninos: 0, bebes: 0 };
const EMPTY_RANGE = { start: null, end: null };

/* ---------- Visor de fotos ---------- */
function Lightbox({ p, index, setIndex, onClose }) {
  const n = p.galeria.length;
  const closeRef = useRef(null);
  const touch = useRef(null);
  const prev = useCallback(() => setIndex(i => (i - 1 + n) % n), [n, setIndex]);
  const next = useCallback(() => setIndex(i => (i + 1) % n), [n, setIndex]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // la página no se mueve detrás
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; window.removeEventListener("keydown", onKey); };
  }, [onClose, prev, next]);

  // Mantiene visible la miniatura activa
  useEffect(() => {
    document.querySelector(`.lb-thumbs [data-i="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Fotos de ${p.nombre}`} onClick={onClose}
      onTouchStart={e => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touch.current = null;
      }}>
      <button ref={closeRef} className="lb-btn lb-close" onClick={stop(onClose)} aria-label="Cerrar fotos">
        <Icon name="close" size={24} />
      </button>
      <button className="lb-btn lb-prev" onClick={stop(prev)} aria-label="Foto anterior">
        <Icon name="chevL" size={28} />
      </button>
      <div className="lb-stage" onClick={e => e.stopPropagation()}>
        <PropImage src={p.galeria[index]} alt={`${p.nombre} - foto ${index + 1} de ${n}`} style={{ objectFit: "contain" }} sizes="92vw" priority />
      </div>
      <button className="lb-btn lb-next" onClick={stop(next)} aria-label="Foto siguiente">
        <Icon name="chevR" size={28} />
      </button>
      <div className="lb-count" aria-live="polite">{index + 1} / {n}</div>
      <div className="lb-thumbs" onClick={e => e.stopPropagation()}>
        {p.galeria.map((g, i) => (
          <button key={g} data-i={i} onClick={() => setIndex(i)} aria-label={`Ver foto ${i + 1}`} className={i === index ? "on" : ""}>
            <PropImage src={g} alt="" sizes="64px" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Galería ---------- */
function Gallery({ p }) {
  const [lightbox, setLightbox] = useState(null);
  const close = useCallback(() => setLightbox(null), []);
  return (
    <>
      <div className="gallery">
        <button className="g-main" onClick={() => setLightbox(0)} aria-label="Ver fotos">
          <PropImage src={p.galeria[0]} alt={`${p.nombre} - foto principal`} priority sizes="(max-width: 760px) 100vw, 50vw" />
        </button>
        {p.galeria.slice(1, 5).map((g, i) => (
          <button key={i} className="g-cell" onClick={() => setLightbox(i + 1)} aria-label={`Ver foto ${i + 2}`}>
            <PropImage src={g} alt={`${p.nombre} - foto ${i + 2}`} sizes="(max-width: 760px) 50vw, 25vw" />
            {i === 3 && (
              <span style={{ position: "absolute", right: 14, bottom: 14, zIndex: 3, fontSize: 13, fontWeight: 600,
                padding: "9px 16px", borderRadius: 99, background: "rgba(255,255,255,.94)", color: "var(--ink)",
                display: "inline-flex", gap: 7, alignItems: "center", boxShadow: "var(--sh-sm)" }}>
                <Icon name="grid" size={15} /> {p.galeria.length} fotos
              </span>
            )}
          </button>
        ))}
        {/* En móvil solo se ven 3 fotos: botón para abrir todas */}
        <button className="g-all" onClick={() => setLightbox(0)}>
          <Icon name="grid" size={15} /> Ver las {p.galeria.length} fotos
        </button>
      </div>

      {lightbox !== null && <Lightbox p={p} index={lightbox} setIndex={setLightbox} onClose={close} />}
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
      {/* Arriba, para no tapar la atribución de OpenStreetMap (abajo) */}
      <span style={{ position: "absolute", left: 14, top: 14, fontSize: 12, fontWeight: 600,
        color: "var(--blue-deep)", background: "rgba(255,255,255,.92)", padding: "6px 12px", borderRadius: 99, boxShadow: "var(--sh-sm)" }}>
        Ubicación aproximada
      </span>
      <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
        style={{ position: "absolute", right: 14, top: 14, fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
          background: "#fff", padding: "8px 14px", borderRadius: 99, boxShadow: "var(--sh-md)", display: "inline-flex", gap: 6, alignItems: "center" }}>
        <Icon name="map" size={15} /> Abrir en Google Maps
      </a>
    </div>
  );
}

/* ---------- Widget de reserva ---------- */
function BookingWidget({ p, navigate, range, setRange, guests, setGuests, openSignal, widgetRef }) {
  const [openCal, setOpenCal] = useState(false);
  const [openG, setOpenG] = useState(false);
  const [notice, setNotice] = useState(null);
  const { blockedRanges, loading: loadingAvail, error: availError } = useAvailability(p.id);

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

  // Fechas que llegan por la URL o desde el buscador: si ya no están libres, se borran con aviso
  useEffect(() => {
    if (loadingAvail || !range.start || !range.end) return;
    if (!isRangeAvailable(range.start, range.end, blockedRanges)) {
      setRange(EMPTY_RANGE);
      setNotice("Las fechas que elegiste ya no están disponibles en este alojamiento. Elige otras.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAvail, blockedRanges]);

  // La barra móvil pide abrir el calendario
  useEffect(() => {
    if (!openSignal) return;
    if (!nights) { setOpenCal(true); setOpenG(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSignal]);

  function reservar() {
    if (!nights) { setOpenCal(true); setOpenG(false); return; }
    navigate({ name: "checkout", id: p.id, booking: { range, guests } });
  }

  const fieldStyle = (rb) => ({
    textAlign: "left", padding: "12px 16px",
    borderRight: rb ? "1px solid var(--line-strong)" : "none", display: "block",
  });
  const lblStyle = { display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)" };
  const valStyle = (v) => ({ display: "block", fontSize: 14, marginTop: 2, color: v ? "var(--ink-2)" : "var(--muted)" });

  return (
    <div className="bw" ref={widgetRef} id="reservar">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "6px 12px", marginBottom: 16 }}>
        <div>
          {quote ? (
            <>
              <span style={{ display: "block", fontSize: 22, fontWeight: 700 }}>Precio a consultar</span>
              <span style={{ display: "block", fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>Según número de personas y fechas</span>
            </>
          ) : (
            <span style={{ display: "flex", alignItems: "baseline", gap: 5, whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 14, color: "var(--muted)" }}>desde</span>
              <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "-.01em" }}>{formatCOP(p.precio)}</span>
              <span style={{ color: "var(--muted)", fontSize: 15 }}> / noche</span>
            </span>
          )}
        </div>
        {p.rating ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 14, flexShrink: 0 }}>
            <Icon name="star" size={14} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
            {p.rating} · <span style={{ color: "var(--muted)" }}>{p.resenas} reseña{p.resenas === 1 ? "" : "s"}</span>
          </span>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".04em", padding: "4px 11px", borderRadius: 99, flexShrink: 0, background: "var(--paper-2)", color: "var(--blue-deep)" }}>
            Nuevo
          </span>
        )}
      </div>

      {notice && (
        <p role="status" style={{ fontSize: 13, color: "#9a3b3b", background: "rgba(220,60,60,.07)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
          {notice}
        </p>
      )}

      <div style={{ border: "1px solid var(--line-strong)", borderRadius: 14, overflow: "visible", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <button onClick={() => { setOpenCal(o => !o); setOpenG(false); setNotice(null); }} style={fieldStyle(true)} aria-expanded={openCal}>
            <span style={lblStyle}>Llegada</span>
            <span style={valStyle(range.start)}>{range.start ? fmtFecha(range.start) : "Agregar"}</span>
          </button>
          <button onClick={() => { setOpenCal(o => !o); setOpenG(false); setNotice(null); }} style={fieldStyle(false)} aria-expanded={openCal}>
            <span style={lblStyle}>Salida</span>
            <span style={valStyle(range.end)}>{range.end ? fmtFecha(range.end) : "Agregar"}</span>
          </button>
        </div>
        <button onClick={() => { setOpenG(o => !o); setOpenCal(false); }} aria-expanded={openG}
          style={{ ...fieldStyle(true), width: "100%", borderTop: "1px solid var(--line-strong)", borderRight: "none" }}>
          <span style={lblStyle}>Huéspedes</span>
          <span style={valStyle(true)}>{huespedesTxt(guests)}</span>
        </button>

        {openCal && (
          <div className="bw-pop" style={{ left: 0, width: 340 }}>
            {loadingAvail && (
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Cargando disponibilidad…</p>
            )}
            {!loadingAvail && availError && (
              <p style={{ fontSize: 12.5, color: "var(--blue-deep)", background: "var(--paper-2)", borderRadius: 10, padding: "8px 10px", marginBottom: 10 }}>
                No pudimos verificar la disponibilidad en línea. Te la confirmamos por WhatsApp.
              </p>
            )}
            <RangeCalendar range={range} onChange={(r) => { setRange(r); if (r.start && r.end) setOpenCal(false); }} blockedRanges={blockedRanges} />
            <button onClick={() => setRange(EMPTY_RANGE)} style={{ marginTop: 6, fontSize: 13, fontWeight: 600, textDecoration: "underline", color: "var(--ink-2)" }}>
              Borrar fechas
            </button>
          </div>
        )}
        {openG && (
          <div className="bw-pop" style={{ right: 0, width: 300 }}>
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

/* ---------- Barra de reserva fija (móvil) ---------- */
function MobileBookBar({ p, range, visible, onOpen }) {
  const hasDates = range.start && range.end;
  return (
    <div className={"mbar" + (visible ? " show" : "")} aria-hidden={!visible}>
      <div style={{ minWidth: 0 }}>
        {p.precio ? (
          <div><strong style={{ fontFamily: "var(--mono)", fontSize: 16 }}>{formatCOP(p.precio)}</strong> <span style={{ color: "var(--muted)", fontSize: 13 }}>/ noche</span></div>
        ) : (
          <strong style={{ fontSize: 15.5 }}>Precio a consultar</strong>
        )}
        <div style={{ fontSize: 12.5, color: "var(--muted)", textDecoration: hasDates ? "underline" : "none" }}>
          {hasDates ? `${fmtFecha(range.start)} – ${fmtFecha(range.end)}` : p.rating ? `★ ${p.rating} · ${p.resenas} reseña${p.resenas === 1 ? "" : "s"}` : "Nuevo en INNOVARE"}
        </div>
      </div>
      <button className="btn btn-primary" onClick={onOpen} tabIndex={visible ? 0 : -1} style={{ height: 48, padding: "0 22px", flexShrink: 0 }}>
        {p.precio ? (hasDates ? "Reservar" : "Ver fechas") : "Cotizar"}
      </button>
    </div>
  );
}

/* ---------- Página de detalle ---------- */
export function PropertyDetail({ id, booking, navigate }) {
  const p = findProperty(id);
  const ref = useReveal();
  const widgetRef = useRef(null);
  const [range, setRange] = useState(() => booking?.range?.start ? booking.range : EMPTY_RANGE);
  const [guests, setGuests] = useState(() => {
    const g = booking?.guests || DEFAULT_GUESTS;
    const max = p?.huespedes || 99;
    const adultos = Math.min(g.adultos, max);
    return { adultos, ninos: Math.min(g.ninos, max - adultos), bebes: g.bebes };
  });
  const [barVisible, setBarVisible] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);

  // La URL refleja las fechas y huéspedes elegidos (se puede compartir o recargar)
  useEffect(() => {
    if (!p) return;
    const isDefault = !range.start && !range.end && guests.adultos === 2 && !guests.ninos && !guests.bebes;
    replaceUrl({ name: "property", id: p.id, booking: isDefault ? null : { range, guests } });
  }, [p, range, guests]);

  // Barra móvil: visible mientras el widget de reserva no está en pantalla
  useEffect(() => {
    const el = widgetRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarVisible(!e.isIntersecting), { rootMargin: "0px 0px -80px 0px" });
    io.observe(el);
    document.body.classList.add("has-mbar");
    return () => { io.disconnect(); document.body.classList.remove("has-mbar", "mbar-on"); };
  }, []);
  // El botón flotante de WhatsApp sube solo mientras la barra está visible
  useEffect(() => { document.body.classList.toggle("mbar-on", barVisible); }, [barVisible]);

  if (!p) return <NotFound navigate={navigate} />;

  const otras = PROPERTIES.filter(x => x.id !== p.id);

  function openFromBar() {
    widgetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (p.precio && range.start && range.end) {
      navigate({ name: "checkout", id: p.id, booking: { range, guests } });
    } else {
      setOpenSignal(s => s + 1);
    }
  }

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
                <a href="#resenas" onClick={e => { e.preventDefault(); document.getElementById("resenas")?.scrollIntoView({ behavior: "smooth" }); }}
                  style={{ display: "inline-flex", gap: 5, alignItems: "center", textDecoration: "underline", textDecorationColor: "var(--line-strong)" }}>
                  <Icon name="star" size={15} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
                  {p.rating} · {p.resenas} reseña{p.resenas === 1 ? "" : "s"}
                </a>
              ) : (
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                  <Icon name="sparkle" size={15} style={{ color: "oklch(0.78 0.09 75)" }} /> Nuevo en INNOVARE
                </span>
              )}
              <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                <Icon name="pin" size={15} /> {p.sector}, {p.ciudad}
              </span>
              {p.rnt && (
                <span title="Registro Nacional de Turismo" style={{ display: "inline-flex", gap: 5, alignItems: "center", color: "var(--muted)" }}>
                  <Icon name="shield" size={15} /> RNT {p.rnt}
                </span>
              )}
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
                  <Icon name={AMENIDADES[a].icon} size={22} style={{ color: "var(--ink)", flexShrink: 0 }} /> {AMENIDADES[a].label}
                </div>
              ))}
            </div>
          </div>

          <div id="resenas" className="reveal" style={{ paddingBlock: 30, borderBottom: "1px solid var(--line)", scrollMarginTop: 100 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Reseñas</h2>
            {p.rating ? (
              <div className="reviews-box">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="star" size={30} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
                  <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.02em" }}>{p.rating.toFixed(2)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <strong style={{ fontSize: 16 }}>{p.resenas} reseña{p.resenas === 1 ? "" : "s"} en Airbnb</strong>
                  <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 2 }}>Calificación promedio de huéspedes que se alojaron aquí.</p>
                </div>
                <a className="btn btn-line" href={airbnbReviewsUrl(p)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14 }}>
                  Leer reseñas <Icon name="arrow" size={15} />
                </a>
              </div>
            ) : (
              <p style={{ color: "var(--ink-2)", fontSize: 15.5 }}>
                Este alojamiento es nuevo en INNOVARE y todavía no tiene reseñas.{" "}
                <span style={{ color: "var(--muted)" }}>Sé de los primeros en disfrutarlo.</span>
              </p>
            )}
          </div>

          <div className="reveal" style={{ paddingTop: 30 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Dónde estarás</h2>
            <div className="map-box" style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
              <LocationMap p={p} />
            </div>
            <p style={{ marginTop: 14, color: "var(--ink-2)", fontSize: 15 }}>
              <strong>{p.sector}, {p.ciudad}</strong> — {p.ubicacion || "a pasos del mar Caribe."}
              <span style={{ color: "var(--muted)" }}> La dirección exacta se comparte al confirmar la reserva.</span>
            </p>
          </div>
        </div>

        <aside className="detail-side">
          <div style={{ position: "sticky", top: 96 }}>
            <BookingWidget p={p} navigate={navigate} widgetRef={widgetRef} openSignal={openSignal}
              range={range} setRange={setRange} guests={guests} setGuests={setGuests} />
          </div>
        </aside>
      </div>

      <section style={{ background: "var(--paper-2)", paddingBlock: 70 }}>
        <div className="wrap">
          <h2 className="reveal" style={{ fontSize: 26, fontWeight: 700, marginBottom: 26 }}>También te puede gustar</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(otras.length, 3)}, 1fr)`, gap: 28 }} className="otras-grid">
            {otras.map((o, i) => (
              <a key={o.id} href={routeToUrl({ name: "property", id: o.id })} className="reveal otra-card" style={{ transitionDelay: (i * 90) + "ms", display: "block" }}
                onClick={e => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                  e.preventDefault();
                  navigate({ name: "property", id: o.id });
                }}>
                <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "1.04" }}>
                  <PropImage src={o.galeria[0]} alt={o.nombre} sizes="(max-width: 980px) 100vw, 400px" />
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
              </a>
            ))}
          </div>
        </div>
      </section>

      <MobileBookBar p={p} range={range} visible={barVisible} onOpen={openFromBar} />
    </main>
  );
}
