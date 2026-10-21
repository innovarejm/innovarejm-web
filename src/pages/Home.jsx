import { useState, useEffect, useRef } from 'react';
import { Icon } from '../icons/Icon';
import { PropImage } from '../components/PropImage';
import { SearchBar } from '../components/SearchBar';
import { useReveal } from '../hooks/useReveal';
import { useCountUp } from '../hooks/useCountUp';
import { useFavorites } from '../hooks/useFavorites';
import { useAvailabilityMap, isRangeAvailable } from '../hooks/useAvailability';
import { PROPERTIES, AMENIDADES, DESTINOS, waLink } from '../data/properties';
import { formatCOP, fmtFecha, huespedesTxt, toISODate } from '../utils/helpers';
import { routeToUrl } from '../router';

/* ============================================================
   HeroBg — Video loop + fallback océano CSS
   ============================================================ */
function pickHeroVideo() {
  // Sin video si el usuario pidió ahorrar datos o reducir el movimiento: queda la foto de portada
  if (navigator.connection?.saveData) return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  // En móvil, versión recortada en vertical (~0,75 MB en vez de ~2 MB)
  return window.matchMedia("(max-width: 760px)").matches ? "/videos/hero-mobile.mp4" : "/videos/hero-desktop.mp4";
}

function HeroBg() {
  const [src] = useState(pickHeroVideo);
  const [ready, setReady]   = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="hero-bg">
      {/* Video: fade-in cuando el browser lo autoriza */}
      {src && (
        <video
          autoPlay loop muted playsInline
          disablePictureInPicture
          preload="auto"
          src={src}
          onCanPlay={() => setReady(true)}
          onPlay={()    => setReady(true)}
          onError={()   => setFailed(true)}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            transform: "translateZ(0)",
            opacity: ready ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        />
      )}

      {/* OceanScene solo si el video falla del todo */}
      {failed && <OceanScene />}

      {/* Overlay gradiente para legibilidad del texto */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(4,14,32,.52) 0%, rgba(4,14,32,.18) 45%, rgba(6,22,50,.58) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

/* ============================================================
   OceanScene — parallax + mouse tracking + partículas + rayos
   (respaldo si el video no carga; estilos en globals.css)
   ============================================================ */
function OceanScene() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => el.style.setProperty("--scroll", window.scrollY + "px");
    const onMouse = (e) => {
      el.style.setProperty("--mx", (e.clientX / window.innerWidth).toFixed(3));
      el.style.setProperty("--my", (e.clientY / window.innerHeight).toFixed(3));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div ref={ref} className="ocean" aria-hidden="true">
      {/* Cielo con parallax */}
      <div className="sky" />

      {/* Rayos de luz desde el sol */}
      <div className="rays-outer"><div className="rays" /></div>

      {/* Sol + corona */}
      <div className="sun" />
      <div className="corona" />

      {/* Brillo horizonte */}
      <div className="glow" />
      <div className="horizon-mist" />

      {/* Mar */}
      <div className="sea">
        <div className="shimmer" />
        <div className="sun-reflection" />
        <svg className="wave wave-back" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path d="M0 50 C 300 20 600 80 900 50 C 1100 30 1300 70 1440 50 L1440 100 L0 100 Z"/>
        </svg>
        <svg className="wave wave-1" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 60 C 240 10 480 110 720 60 C 960 10 1200 110 1440 60 L1440 120 L0 120 Z"/>
        </svg>
        <svg className="wave wave-2" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 70 C 200 30 460 100 720 70 C 980 40 1240 100 1440 70 L1440 120 L0 120 Z"/>
        </svg>
        <svg className="wave wave-3" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0 80 C 320 50 520 100 720 80 C 920 60 1180 100 1440 80 L1440 120 L0 120 Z"/>
        </svg>
        <div className="foam" />
      </div>

      {/* Partículas flotantes sobre el agua */}
      <div className="particles" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="particle" style={{ '--pi': i }} />
        ))}
      </div>

      <div className="grain" />
    </div>
  );
}

/* ============================================================
   Hero — tipografía editorial escalonada
   ============================================================ */
function Hero({ onSearch, initial }) {
  return (
    <section style={{
      position: "relative",
      minHeight: "100svh",
      display: "flex", flexDirection: "column",
      justifyContent: "center",
      color: "#fff",
      /* overflow visible para que el dropdown no quede cortado */
    }}>
      <HeroBg />

      <div className="wrap" style={{ position: "relative", zIndex: 2, paddingTop: 90, textAlign: "center" }}>

        {/* Titular editorial escalonado */}
        <h1 className="hero-rise" style={{
          animationDelay: ".1s",
          textAlign: "center", marginTop: 26,
          textShadow: "0 6px 50px rgba(3,15,40,.6)",
        }}>
          <span style={{
            display: "block",
            fontFamily: "var(--sans)", fontWeight: 800,
            fontSize: "clamp(50px, 10vw, 132px)",
            lineHeight: .91, letterSpacing: "-0.03em",
          }}>
            Despierta
          </span>
          <span style={{
            display: "block",
            fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(42px, 8.2vw, 110px)",
            lineHeight: 1.0, letterSpacing: "-0.015em",
            marginTop: ".06em",
            color: "rgba(255,255,255,.97)",
          }}>
            frente al mar
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="hero-rise" style={{
          animationDelay: ".3s",
          maxWidth: 510, margin: "22px auto 0",
          fontSize: "clamp(15px, 1.5vw, 18px)",
          color: "rgba(255,255,255,.86)", lineHeight: 1.65,
          textShadow: "0 2px 18px rgba(3,15,40,.45)",
        }}>
          Apartamentos frente al mar y fincas para grupos en los mejores destinos de Colombia. Reserva directamente con nosotros, sin intermediarios.
        </p>

        {/* Barra de búsqueda */}
        <div className="hero-rise" style={{ animationDelay: ".44s", display: "flex", justifyContent: "center", marginTop: 38 }}>
          {/* key: al limpiar la búsqueda el buscador vuelve a quedar vacío */}
          <SearchBar variant="hero" onSearch={onSearch} initial={initial}
            key={initial ? `${toISODate(initial.range?.start)}_${toISODate(initial.range?.end)}_${huespedesTxt(initial.guests)}` : "vacio"} />
        </div>

        {/* Chips de confianza */}
        <div className="hero-rise" style={{
          animationDelay: ".6s",
          display: "flex", gap: 22, justifyContent: "center",
          marginTop: 30, flexWrap: "wrap",
          fontSize: 12.5, color: "rgba(255,255,255,.76)",
        }}>
          {[
            ["sea",    "Destinos únicos"],
            ["shield", "Reserva segura"],
            ["key",    "Check-in flexible"],
          ].map(([ic, t]) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <Icon name={ic} size={14} /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <button
        onClick={() => document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" })}
        className="scroll-cue"
        aria-label="Ver alojamientos"
      >
        <Icon name="chevD" size={20} />
      </button>

    </section>
  );
}

/* ============================================================
   PropertyCard — estilo Airbnb adaptado a la marca
   Toda la tarjeta es un enlace real (se puede abrir en otra pestaña);
   corazón, flechas y puntos quedan por encima.
   ============================================================ */
const FOTOS_TARJETA = 5;

function PropertyCard({ p, href, onOpen, index = 0 }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(p.id);
  const [favAnim, setFavAnim] = useState(false);
  const [img, setImg] = useState(0);
  const [ratingVal, ratingRef] = useCountUp(p.rating || 0, 1200, 2);
  const touch = useRef(null);
  const swiped = useRef(false);
  const fotos = p.galeria.slice(0, FOTOS_TARJETA);
  const go = (delta) => setImg(i => (i + delta + fotos.length) % fotos.length);

  // Deslizar el dedo sobre la tarjeta cambia de foto (sin abrir el alojamiento)
  const onTouchStart = (e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; swiped.current = false; };
  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped.current = true; go(dx < 0 ? 1 : -1); }
    touch.current = null;
  };

  function open(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // nueva pestaña: lo maneja el navegador
    e.preventDefault();
    if (swiped.current) { swiped.current = false; return; }
    onOpen();
  }

  const stop = (fn) => (e) => { e.preventDefault(); e.stopPropagation(); fn(); };

  return (
    <article className="reveal prop-card" style={{ transitionDelay: (index * 90) + "ms" }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* Imagen con crossfade al cambiar foto */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "1.04" }} className="card-media">

        {/* key={img} fuerza remount → fade-in + ligero zoom */}
        <div key={img} style={{ position: "absolute", inset: 0, animation: "imgFadeIn .38s ease" }}>
          <PropImage src={fotos[img]} alt={`${p.nombre} - foto ${img + 1}`}
            sizes="(max-width: 560px) 100vw, (max-width: 1180px) 50vw, 300px" />
        </div>

        {/* Overlay de amenidades — aparece al hover */}
        <div className="card-overlay">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.amenities.slice(0, 3).map(a => (
              <span key={a} style={{
                fontSize: 11, fontWeight: 600, color: "#fff",
                display: "inline-flex", gap: 5, alignItems: "center",
                background: "rgba(255,255,255,.15)", backdropFilter: "blur(4px)",
                padding: "4px 10px", borderRadius: 99,
              }}>
                <Icon name={AMENIDADES[a].icon} size={12} /> {AMENIDADES[a].label}
              </span>
            ))}
          </div>
        </div>

        {p.destacado && (
          <span style={{
            position: "absolute", top: 14, left: 14, zIndex: 4, pointerEvents: "none",
            fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em",
            padding: "6px 13px", borderRadius: 99,
            background: "rgba(255,255,255,.94)", color: "var(--blue-deep)",
            display: "inline-flex", gap: 6, alignItems: "center",
            boxShadow: "0 2px 12px rgba(12,38,56,.14)",
          }}>
            <Icon name="sparkle" size={13} style={{ color: "oklch(0.78 0.09 75)" }} />
            Destacado
          </span>
        )}

        {/* Corazón: se guarda en este navegador */}
        <button
          onClick={stop(() => { toggle(p.id); setFavAnim(true); })}
          onAnimationEnd={() => setFavAnim(false)}
          aria-label={fav ? `Quitar ${p.nombre} de guardados` : `Guardar ${p.nombre}`}
          aria-pressed={fav}
          className="card-fav"
          style={{
            background: fav ? "var(--cyan)" : "rgba(12,38,56,.28)",
            transition: favAnim ? "background .2s" : "transform .2s, background .2s",
            animation: favAnim ? "heartPop .42s var(--ease-out) forwards" : "none",
          }}
        >
          <Icon name="heart" size={19} style={{ fill: fav ? "#fff" : "none" }} />
        </button>

        {/* Flechas (solo con mouse) */}
        {fotos.length > 1 && (
          <>
            <button className="card-nav prev" onClick={stop(() => go(-1))} aria-label="Foto anterior"><Icon name="chevL" size={16} stroke={2.2} /></button>
            <button className="card-nav next" onClick={stop(() => go(1))} aria-label="Foto siguiente"><Icon name="chevR" size={16} stroke={2.2} /></button>
          </>
        )}

        {/* Indicadores de galería */}
        <div style={{
          position: "absolute", bottom: 12, left: 0, right: 0,
          display: "flex", justifyContent: "center", gap: 6, zIndex: 4, pointerEvents: "none",
        }}>
          {fotos.map((_, i) => (
            <button key={i} onClick={stop(() => setImg(i))} aria-label={`Ver foto ${i + 1}`} style={{
              width: i === img ? 8 : 6, height: i === img ? 8 : 6,
              minHeight: 0, padding: 0, // anula el min-height táctil global de 44px
              borderRadius: 99, pointerEvents: "auto",
              background: i === img ? "#fff" : "rgba(255,255,255,.52)",
              transition: "all .2s",
            }} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <h3 style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.2 }}>
            <a href={href} onClick={open} className="card-link">{p.nombre}</a>
          </h3>
          {/* Rating con contador animado (o "Nuevo" si aún no tiene reseñas) */}
          {p.rating ? (
            <span ref={ratingRef} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
              <Icon name="star" size={13} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
              {ratingVal.toFixed(2)}
            </span>
          ) : (
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em", padding: "3px 10px", borderRadius: 99, flexShrink: 0, background: "var(--paper-2)", color: "var(--blue-deep)" }}>
              Nuevo
            </span>
          )}
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 5 }}>
          {p.sector}, {p.ciudad}{p.piso ? ` · Piso ${p.piso}` : ""}
        </p>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          {p.hab} hab · {p.banos} baños · {p.huespedes} huésp.
        </p>
        <p style={{ marginTop: 10, fontSize: 14.5, display: "flex", alignItems: "baseline", gap: 5 }}>
          {p.precio ? (
            <>
              <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13.5, color: "var(--muted)" }}>desde</span>
              <strong style={{ fontSize: 17, fontFamily: "var(--mono)", letterSpacing: "-.01em" }}>
                {formatCOP(p.precio)}
              </strong>
              <span style={{ color: "var(--muted)", fontSize: 13 }}> / noche</span>
            </>
          ) : (
            <>
              <strong style={{ fontSize: 15.5 }}>Precio a consultar</strong>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>· según tu grupo</span>
            </>
          )}
        </p>
      </div>
    </article>
  );
}

/* ============================================================
   Home — todas las secciones
   ============================================================ */
export function Home({ navigate, route }) {
  const ref = useReveal();
  const { favorites } = useFavorites();
  const [filter, setFilter] = useState(route?.dest || "Todos");

  // Permite filtrar desde fuera (ej. enlaces de destinos del footer)
  useEffect(() => { if (route?.dest) setFilter(route.dest); }, [route]);
  // Si se vacían los guardados, vuelve a "Todos"
  useEffect(() => { if (filter === "Guardados" && favorites.length === 0) setFilter("Todos"); }, [filter, favorites.length]);

  // Búsqueda del hero sin alojamiento elegido: filtra por capacidad y por fechas libres
  const search = route?.booking || null;
  const sRange = search?.range;
  const hasDates = !!(sRange?.start && sRange?.end);
  const sGuests = search ? search.guests.adultos + search.guests.ninos : 0;
  const { map: avail, loading: loadingAvail } = useAvailabilityMap(PROPERTIES.map(p => p.id), hasDates);

  const ciudades = ["Todos", ...new Set(PROPERTIES.map(p => p.ciudad))];
  let list = filter === "Todos" ? PROPERTIES
    : filter === "Guardados" ? PROPERTIES.filter(p => favorites.includes(p.id))
    : PROPERTIES.filter(p => p.ciudad === filter);
  if (search) {
    list = list.filter(p => p.huespedes >= sGuests);
    // Si no se pudo verificar un calendario, el alojamiento se muestra igual (se confirma por WhatsApp)
    if (hasDates) list = list.filter(p => !avail[p.id] || isRangeAvailable(sRange.start, sRange.end, avail[p.id].blockedRanges));
  }

  const destinos = Object.entries(DESTINOS)
    .map(([c, x]) => ({ c, ...x, n: PROPERTIES.filter(p => p.ciudad === c).length }))
    .filter(x => x.n > 0);

  const openProperty = (p) => navigate({ name: "property", id: p.id, booking: search });
  const clearSearch = () => navigate({ name: "home" }, "#listado");

  return (
    <main ref={ref}>
      <Hero initial={search ? { range: search.range, guests: search.guests } : undefined} onSearch={(s) => {
        const booking = { range: s.range, guests: s.guests };
        if (s.propertyId) {
          // Navega directo al alojamiento elegido, con las fechas y huéspedes ya puestos
          navigate({ name: "property", id: s.propertyId, booking });
        } else {
          // Sin selección: muestra los que tienen cupo y fechas libres
          setFilter("Todos");
          navigate({ name: "home", booking }, "#listado");
        }
      }} />

      {/* ─── LISTADO ─── */}
      <section id="listado" style={{ paddingBlock: "88px 76px", scrollMarginTop: 40 }}>
        <div className="wrap">
          <div className="reveal" style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: search ? 20 : 34,
          }}>
            <div>
              <span className="eyebrow">Nuestros alojamientos</span>
              <h2 style={{ fontSize: "clamp(28px,3.8vw,44px)", marginTop: 10, maxWidth: 520 }}>
                Estancias seleccionadas{" "}
                <span className="serif-it">para tu escapada</span>
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[...ciudades, ...(favorites.length ? ["Guardados"] : [])].map(c => (
                <button key={c} onClick={() => setFilter(c)} className="chip" aria-pressed={filter === c} style={{
                  background: filter === c ? "var(--ink)" : "#fff",
                  color: filter === c ? "#fff" : "var(--ink-2)",
                  borderColor: filter === c ? "var(--ink)" : "var(--line-strong)",
                  padding: "10px 18px", fontWeight: 600,
                }}>
                  {c === "Guardados" && <Icon name="heart" size={14} style={{ fill: "currentColor" }} />}
                  {c === "Guardados" ? `Guardados (${favorites.length})` : c}
                </button>
              ))}
            </div>
          </div>

          {search && (
            <div className="search-summary">
              <Icon name="search" size={16} />
              <span>
                <strong>{hasDates ? `${fmtFecha(sRange.start)} – ${fmtFecha(sRange.end)}` : "Cualquier fecha"}</strong>
                {" · "}{huespedesTxt(search.guests)}
                {loadingAvail && <span style={{ color: "var(--muted)" }}> · verificando disponibilidad…</span>}
              </span>
              <button onClick={clearSearch} className="search-clear">
                Limpiar búsqueda <Icon name="close" size={14} />
              </button>
            </div>
          )}

          {list.length > 0 ? (
            <div className="grid-cards">
              {list.map((p, i) => (
                <PropertyCard key={p.id} p={p} index={i}
                  href={routeToUrl({ name: "property", id: p.id, booking: search })}
                  onOpen={() => openProperty(p)} />
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>No encontramos alojamientos con esos criterios</h3>
              <p style={{ color: "var(--muted)", marginTop: 8 }}>
                Prueba otras fechas o escríbenos y te ayudamos a encontrar una alternativa.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                <a className="btn btn-wa" target="_blank" rel="noopener noreferrer"
                  href={waLink(`Hola INNOVARE JM, busco alojamiento${hasDates ? ` del ${fmtFecha(sRange.start)} al ${fmtFecha(sRange.end)}` : ""} para ${huespedesTxt(search?.guests || { adultos: 2, ninos: 0, bebes: 0 })}. ¿Qué opciones tienen?`)}>
                  <Icon name="wa" size={18} /> Escríbenos
                </a>
                <button className="btn btn-line" onClick={() => { setFilter("Todos"); clearSearch(); }}>Ver todos</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── DESTINOS ─── */}
      <section id="destinos" style={{ paddingBlock: "20px 88px", background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow">Dónde te esperamos</span>
            <h2 style={{ fontSize: "clamp(28px,3.8vw,44px)", marginTop: 10 }}>
              Del Caribe al{" "}
              <span className="serif-it">Lago Calima</span>
            </h2>
          </div>
          <div className="reveal-scale dest-grid" style={{ "--dest-cols": destinos.length }}>
            {destinos.map(x => (
              <button
                key={x.c}
                onClick={() => { setFilter(x.c); document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" }); }}
                className="dest-card"
                style={{ position: "relative", borderRadius: 24, overflow: "hidden", textAlign: "left", color: "#fff" }}
              >
                <PropImage src={x.img} alt={x.label} sizes="(max-width: 900px) 100vw, 420px" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,40,70,0) 35%, rgba(8,40,70,.8))" }} />
                <div style={{ position: "absolute", left: 26, bottom: 24, zIndex: 2 }}>
                  <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 }}>{x.c}</div>
                  <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15, opacity: .88, marginTop: 4 }}>{x.d}</div>
                  <div style={{
                    marginTop: 14, fontSize: 11.5, fontFamily: "var(--mono)",
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "7px 14px", borderRadius: 99,
                    background: "rgba(255,255,255,.14)", backdropFilter: "blur(6px)",
                    letterSpacing: ".06em",
                  }}>
                    {x.n} {x.n > 1 ? "alojamientos" : "alojamiento"} <Icon name="arrow" size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OLA DIVISORA ─── */}
      <div aria-hidden="true" style={{ lineHeight: 0, overflow: "hidden", background: "var(--paper-2)" }}>
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 90 }}>
          <path d="M0 45 C 200 5 420 85 720 40 C 1020 -5 1260 80 1440 45 L1440 90 L0 90 Z" fill="var(--navy)" />
        </svg>
      </div>

      {/* ─── EXPERIENCIA — layout editorial con numeración ─── */}
      <section id="experiencia" style={{ background: "var(--navy)", color: "#fff", paddingBlock: "88px 100px" }}>
        <div className="wrap">
          <div className="exp-layout">
            {/* Columna izquierda: encabezado sticky */}
            <div className="reveal exp-heading">
              <span className="eyebrow" style={{ color: "var(--cyan-soft)" }}>La experiencia INNOVARE</span>
              <h2 style={{ fontSize: "clamp(28px,4vw,52px)", marginTop: 14, lineHeight: 1.04 }}>
                Reservar directo{" "}
                <span className="serif-it" style={{ color: "var(--cyan-soft)" }}>
                  tiene sus ventajas
                </span>
              </h2>
              <p style={{ marginTop: 18, fontSize: 15.5, color: "rgba(255,255,255,.6)", lineHeight: 1.72, maxWidth: 360 }}>
                Sin plataformas de por medio. Tu estancia, directamente con quienes cuidan los alojamientos.
              </p>
              <a
                className="btn btn-wa"
                style={{ marginTop: 32 }}
                href={waLink("Hola INNOVARE JM, quiero saber más sobre disponibilidad.")}
                target="_blank" rel="noopener noreferrer"
              >
                <Icon name="wa" size={18} /> Escríbenos
              </a>
            </div>

            {/* Columna derecha: lista numerada */}
            <div className="exp-list">
              {[
                { n: "01", ic: "key",     t: "Trato directo",     d: "Sin intermediarios ni comisiones ocultas. Hablas con nosotros de principio a fin." },
                { n: "02", ic: "shield",  t: "Reserva segura",    d: "Confirmación inmediata y acompañamiento durante toda tu estancia." },
                { n: "03", ic: "pin",     t: "Ubicación premium",  d: "Seleccionados en los mejores puntos de Cartagena, Santa Marta y el Lago Calima." },
                { n: "04", ic: "sparkle", t: "Listos para vivir", d: "Totalmente amoblados y equipados. Llega con tu maleta y nada más." },
              ].map((x, i) => (
                <div key={x.t} className="reveal-left exp-item" style={{ transitionDelay: (i * 100) + "ms" }}>
                  <span className="exp-num">{x.n}</span>
                  <div className="exp-body">
                    <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{x.t}</h3>
                    <p style={{ color: "rgba(255,255,255,.64)", fontSize: 14.5, lineHeight: 1.72 }}>{x.d}</p>
                  </div>
                  <span className="exp-icon"><Icon name={x.ic} size={24} /></span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ─── CONTACTO / CTA ─── */}
      <section id="contacto" style={{ paddingBlock: 96 }}>
        <div className="wrap-tight reveal-scale">
          <div style={{
            position: "relative", borderRadius: 28, overflow: "hidden",
            padding: "clamp(44px,6vw,80px)",
            background: "var(--grad-brand)", color: "#fff", textAlign: "center",
          }}>
            {/* Brillo decorativo */}
            <div style={{
              position: "absolute", inset: 0, opacity: .45,
              background: "radial-gradient(80% 120% at 78% -10%, rgba(255,255,255,.4), transparent 60%)",
            }} />
            {/* Marca de agua del logo */}
            <div style={{ position: "absolute", right: -20, bottom: -30, opacity: .09, pointerEvents: "none", transform: "rotate(-8deg)" }}>
              <img src="/brand/logo-mark-white.png" alt="" aria-hidden="true" loading="lazy" style={{ width: 300, height: "auto", display: "block" }} />
            </div>
            <div style={{ position: "relative" }}>
              <h2 style={{ fontSize: "clamp(26px,4vw,48px)", lineHeight: 1.05 }}>
                ¿Listo para tu{" "}
                <span className="serif-it">próxima escapada</span>?
              </h2>
              <p style={{ maxWidth: 430, margin: "18px auto 0", fontSize: 16.5, color: "rgba(255,255,255,.9)" }}>
                Escríbenos por WhatsApp y te ayudamos a encontrar fechas y el alojamiento perfecto.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
                <a className="btn btn-wa"
                  href={waLink("Hola INNOVARE JM, quiero hacer una reserva. ¿Me ayudan con la disponibilidad?")}
                  target="_blank" rel="noopener noreferrer">
                  <Icon name="wa" size={19} /> Escríbenos por WhatsApp
                </a>
                <button className="btn" style={{ background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.4)" }}
                  onClick={() => document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" })}>
                  Ver alojamientos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
