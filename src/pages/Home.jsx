import { useState, useEffect, useRef } from 'react';
import { Icon } from '../icons/Icon';
import { Placeholder } from '../components/Placeholder';
import { PropImage } from '../components/PropImage';
import { SearchBar } from '../components/SearchBar';
import { useReveal } from '../hooks/useReveal';
import { useCountUp } from '../hooks/useCountUp';
import { PROPERTIES, AMENIDADES, waLink } from '../data/properties';
import { formatCOP } from '../utils/helpers';

/* ============================================================
   HeroBg — Video loop + fallback océano CSS
   ============================================================ */
function HeroBg() {
  const [ready, setReady] = useState(false);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>

      {/* Océano CSS — siempre visible como fondo/fallback */}
      <OceanScene />

      {/* Video encima: empieza invisible, fade-in cuando el browser lo autoriza */}
      <video
        autoPlay loop muted playsInline
        disablePictureInPicture
        preload="auto"
        poster="/images/hero-poster.jpg"
        onCanPlay={() => setReady(true)}
        onPlay={()    => setReady(true)}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          transform: "translateZ(0)",
          opacity: ready ? 1 : 0,
          transition: "opacity 1s ease",
        }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

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
   (activo mientras no haya video en /public/videos/hero.mp4)
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

      <style>{`
        /* ── Base ── */
        .ocean {
          position: absolute; inset: 0; overflow: hidden;
          animation: oceanReveal 2s var(--ease-out) both;
        }
        @keyframes oceanReveal { from { opacity:0; } to { opacity:1; } }

        /* ── Cielo (parallax en scroll + suave con mouse) ── */
        .ocean .sky {
          position: absolute; top: -25%; left: 0; right: 0; bottom: 0;
          background: linear-gradient(180deg,
            #020b18 0%, #062540 8%, #0a3a63 22%, #0f5d97 38%,
            #2a8cc4 54%, #6fc0e6 72%, #bfe6f6 88%, #eaf6fc 100%
          );
          transform: translateY(calc(var(--scroll, 0px) * 0.28));
        }

        /* ── Rayos de luz solares ── */
        .rays-outer {
          position: absolute;
          left: 50%; top: -12%;
          width: 220%; height: 80%;
          transform: translateX(-50%) translateY(calc(var(--scroll, 0px) * 0.12));
          pointer-events: none;
        }
        .ocean .rays {
          position: absolute; inset: 0;
          transform-origin: 50% 40%;
          background: repeating-conic-gradient(
            from 0deg at 50% 40%,
            rgba(255,240,180,.02) 0deg 5deg,
            transparent 5deg 22deg
          );
          -webkit-mask-image: radial-gradient(ellipse 65% 65% at 50% 40%, black 5%, transparent 68%);
          mask-image: radial-gradient(ellipse 65% 65% at 50% 40%, black 5%, transparent 68%);
          animation: raysRotate 90s linear infinite;
        }
        @keyframes raysRotate { to { transform: rotate(360deg); } }

        /* ── Sol con tracking de mouse ── */
        .ocean .sun {
          position: absolute;
          left: 50%; top: 29%;
          width: 380px; height: 380px;
          /* CSS translate independiente: no interfiere con la animación */
          translate: -50% -50%;
          margin-left: calc((var(--mx, .5) - .5) * 30px);
          margin-top: calc((var(--my, .5) - .5) * 14px);
          background: radial-gradient(circle,
            #fffff5 0%, rgba(255,248,215,.96) 7%,
            rgba(255,236,170,.72) 22%, rgba(255,220,140,.28) 42%, transparent 65%
          );
          filter: blur(2px);
          animation: sunPulse 10s ease-in-out infinite;
        }

        /* ── Corona del sol ── */
        .ocean .corona {
          position: absolute;
          left: 50%; top: 29%;
          width: 560px; height: 560px;
          translate: -50% -50%;
          margin-left: calc((var(--mx, .5) - .5) * 30px);
          margin-top: calc((var(--my, .5) - .5) * 14px);
          background: radial-gradient(circle,
            transparent 17%, rgba(255,236,160,.055) 27%,
            transparent 38%, rgba(255,220,130,.04) 50%, transparent 64%
          );
          animation: coronaPulse 14s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes sunPulse {
          0%,100% { opacity:.88; filter:blur(2px); }
          50%      { opacity:1;   filter:blur(1px) brightness(1.09); }
        }
        @keyframes coronaPulse {
          0%,100% { transform:scale(1);    opacity:.55; }
          50%     { transform:scale(1.18); opacity:1;   }
        }

        /* ── Brillo en el horizonte ── */
        .ocean .glow {
          position: absolute; left:0; right:0; top:50%; height:180px;
          background: radial-gradient(65% 100% at 50% 0%, rgba(255,190,80,.14), transparent 70%);
          transform: translateY(calc(var(--scroll, 0px) * 0.14));
          pointer-events: none;
        }
        .ocean .horizon-mist {
          position: absolute; left:0; right:0; top:51%; height:55px;
          background: linear-gradient(180deg, rgba(255,210,140,.08), transparent);
          pointer-events: none;
        }

        /* ── Mar ── */
        .ocean .sea {
          position: absolute; left:0; right:0; bottom:0; height:44%;
          background: linear-gradient(180deg,
            #5bbddd 0%, #2285bb 18%, #116098 40%, #0a4680 66%, #051530 100%
          );
          overflow: hidden;
          transform: translateY(calc(var(--scroll, 0px) * 0.04));
        }

        /* ── Destello del agua ── */
        .ocean .shimmer {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            180deg, rgba(255,255,255,.11) 0 1.5px, rgba(255,255,255,0) 1.5px 8px
          );
          -webkit-mask-image: linear-gradient(180deg, black, transparent 65%);
          mask-image: linear-gradient(180deg, black, transparent 65%);
          animation: shimmer 5s linear infinite;
          opacity: .5;
        }
        @keyframes shimmer { from { background-position:0 0; } to { background-position:0 20px; } }

        /* ── Reflejo solar en el agua (sigue mouse) ── */
        .ocean .sun-reflection {
          position: absolute;
          left: calc(50% + (var(--mx, .5) - .5) * 55px);
          top: 0; bottom: 0;
          width: 190px;
          transform: translateX(-50%);
          background: linear-gradient(180deg,
            rgba(255,230,120,.24) 0%, rgba(255,230,120,.11) 40%,
            rgba(255,230,120,.04) 70%, transparent
          );
          filter: blur(16px);
          animation: reflectionWaver 9s ease-in-out infinite;
        }
        @keyframes reflectionWaver {
          0%,100% { width:160px; opacity:.8; }
          50%     { width:240px; opacity:1;  }
        }

        /* ── Olas ── */
        .ocean .wave { position:absolute; left:-5%; width:110%; height:120px; }
        .ocean .wave-back { top:0; height:100px; }
        .ocean .wave-back path { fill: rgba(100,180,225,.06); }
        .ocean .wave-1 { top:2%; animation: drift 14s ease-in-out infinite alternate; }
        .ocean .wave-1 path { fill: rgba(255,255,255,.12); }
        .ocean .wave-2 { top:9%; animation: drift 20s ease-in-out infinite alternate-reverse; }
        .ocean .wave-2 path { fill: rgba(255,255,255,.09); }
        .ocean .wave-3 { top:18%; animation: drift 26s ease-in-out infinite alternate; }
        .ocean .wave-3 path { fill: rgba(5,25,50,.48); }
        @keyframes drift { from{ transform:translateX(-4%); } to{ transform:translateX(4%); } }

        /* ── Espuma en la orilla de las olas ── */
        .ocean .foam {
          position: absolute; left:-5%; width:110%; top:17%; height:12px;
          background: repeating-linear-gradient(90deg,
            transparent 0 18px, rgba(255,255,255,.13) 18px 44px,
            transparent 44px 68px, rgba(255,255,255,.07) 68px 94px,
            transparent 94px 128px
          );
          filter: blur(5px);
          animation: drift 11s ease-in-out infinite alternate-reverse;
        }

        /* ── Partículas flotando desde el mar ── */
        .ocean .particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .ocean .particle {
          position: absolute;
          width: 2px; height: 2px; border-radius: 50%;
          background: rgba(255,255,255,.75);
          bottom: calc(44% + 3%);
          left: calc(var(--pi, 0) * 7.1% + 3%);
          animation: particleFloat calc(4.5s + var(--pi, 0) * 0.65s) ease-in-out calc(var(--pi, 0) * 0.55s) infinite;
          opacity: 0;
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) scale(1); opacity:0; }
          15%  { opacity:.7; }
          65%  { opacity:.3; }
          100% { transform: translateY(-58px) translateX(calc((var(--pi, 0) - 7) * 2.5px)) scale(.35); opacity:0; }
        }

        /* ── Textura de grano ── */
        .ocean .grain {
          position:absolute; inset:0; opacity:.075; pointer-events:none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        @media (prefers-reduced-motion: reduce) {
          .ocean * { animation:none !important; transition:none !important; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   Hero — tipografía editorial escalonada
   ============================================================ */
function Hero({ onSearch }) {
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
          Apartamentos amoblados con vista al Caribe. Reserva directamente con nosotros, sin intermediarios.
        </p>

        {/* Barra de búsqueda */}
        <div className="hero-rise" style={{ animationDelay: ".44s", display: "flex", justifyContent: "center", marginTop: 38 }}>
          <SearchBar variant="hero" onSearch={onSearch} />
        </div>

        {/* Chips de confianza */}
        <div className="hero-rise" style={{
          animationDelay: ".6s",
          display: "flex", gap: 22, justifyContent: "center",
          marginTop: 30, flexWrap: "wrap",
          fontSize: 12.5, color: "rgba(255,255,255,.76)",
        }}>
          {[
            ["sea",    "Vista directa al mar"],
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
        aria-label="Ver apartamentos"
      >
        <Icon name="chevD" size={20} />
      </button>

      <style>{`
        .hero-rise { opacity:0; animation: heroRise 1.1s var(--ease-out) forwards; }
        @keyframes heroRise {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:none; }
        }
        .scroll-cue {
          position:absolute; bottom:26px; left:50%; transform:translateX(-50%); z-index:3;
          width:48px; height:48px; border-radius:99px; color:#fff;
          display:grid; place-items:center;
          border:1px solid rgba(255,255,255,.32);
          background:rgba(255,255,255,.08); backdrop-filter:blur(8px);
          animation: bob 2.6s ease-in-out infinite;
          transition: background .25s;
        }
        .scroll-cue:hover { background:rgba(255,255,255,.18); }
        @keyframes bob {
          0%,100%{ transform:translateX(-50%) translateY(0); }
          50%    { transform:translateX(-50%) translateY(8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise { opacity:1; animation:none; }
          .scroll-cue { animation:none; }
        }
        @media (max-width:480px) {
          .scroll-cue { bottom:18px; width:42px; height:42px; }
        }
      `}</style>
    </section>
  );
}

/* ============================================================
   PropertyCard — estilo Airbnb adaptado a la marca
   ============================================================ */
function PropertyCard({ p, navigate, index = 0 }) {
  const [fav, setFav] = useState(false);
  const [img, setImg] = useState(0);
  const [ratingVal, ratingRef] = useCountUp(p.rating, 1200, 2);

  return (
    <article className="reveal" style={{ transitionDelay: (index * 90) + "ms" }}>
      <div onClick={() => navigate({ name: "property", id: p.id })} style={{ cursor: "pointer" }}>

        {/* Imagen con crossfade al cambiar foto */}
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "1.04" }} className="card-media">

          {/* key={img} fuerza remount → fade-in + ligero zoom */}
          <div key={img} style={{ position: "absolute", inset: 0, animation: "imgFadeIn .38s ease" }}>
            <PropImage src={p.galeria[img]} alt={`${p.nombre} - foto ${img + 1}`} />
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
              position: "absolute", top: 14, left: 14, zIndex: 4,
              fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em",
              padding: "6px 13px", borderRadius: 99,
              background: "rgba(255,255,255,.94)", color: "var(--blue-deep)",
              display: "inline-flex", gap: 6, alignItems: "center",
              boxShadow: "0 2px 12px rgba(12,38,56,.14)",
            }}>
              <Icon name="sparkle" size={13} style={{ color: "oklch(0.78 0.09 75)" }} />
              Favorito de huéspedes
            </span>
          )}

          {/* Corazón */}
          <button
            onClick={e => { e.stopPropagation(); setFav(f => !f); }}
            style={{
              position: "absolute", top: 12, right: 12, zIndex: 4,
              width: 38, height: 38, borderRadius: 99,
              display: "grid", placeItems: "center", color: "#fff",
              background: fav ? "var(--cyan)" : "rgba(12,38,56,.28)",
              backdropFilter: "blur(4px)",
              transition: "transform .2s, background .2s",
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(.82)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <Icon name="heart" size={19} style={{ fill: fav ? "#fff" : "none" }} />
          </button>

          {/* Indicadores de galería */}
          <div style={{
            position: "absolute", bottom: 12, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 6, zIndex: 4,
          }}>
            {p.galeria.slice(0, 5).map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setImg(i); }} style={{
                width: i === img ? 8 : 6, height: i === img ? 8 : 6,
                borderRadius: 99,
                background: i === img ? "#fff" : "rgba(255,255,255,.52)",
                transition: "all .2s",
              }} />
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ paddingTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <h3 style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.2 }}>{p.nombre}</h3>
            {/* Rating con contador animado */}
            <span ref={ratingRef} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13.5, fontWeight: 600, flexShrink: 0, marginTop: 1 }}>
              <Icon name="star" size={13} style={{ fill: "oklch(0.78 0.09 75)", stroke: "oklch(0.78 0.09 75)", strokeWidth: 0 }} />
              {ratingVal.toFixed(2)}
            </span>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 5 }}>
            {p.sector}, {p.ciudad} · Piso {p.piso}
          </p>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            {p.hab} hab · {p.banos} baños · {p.huespedes} huésp.
          </p>
          <p style={{ marginTop: 10, fontSize: 14.5, display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13.5, color: "var(--muted)" }}>desde</span>
            <strong style={{ fontSize: 17, fontFamily: "var(--mono)", letterSpacing: "-.01em" }}>
              {formatCOP(p.precio)}
            </strong>
            <span style={{ color: "var(--muted)", fontSize: 13 }}> / noche</span>
          </p>
        </div>
      </div>

      <style>{`
        article .card-media {
          transition: transform .42s var(--ease), box-shadow .42s var(--ease);
        }
        @media (hover: hover) {
          article:hover .card-media {
            transform: translateY(-6px);
            box-shadow: var(--sh-lg);
          }
        }
      `}</style>
    </article>
  );
}

/* ============================================================
   Botón flotante de WhatsApp
   ============================================================ */
function FloatingWA() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // En móvil (sin botón en nav) siempre visible; en desktop aparece tras scroll
    const isMobile = () => window.innerWidth <= 880;
    const check = () => setVisible(isMobile() || window.scrollY > window.innerHeight * 0.8);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  if (!visible) return null;
  return (
    <>
      <a
        href={waLink("Hola INNOVARE JM 👋")}
        target="_blank" rel="noopener"
        aria-label="Contactar por WhatsApp"
        className="floating-wa"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 90,
          width: 58, height: 58, borderRadius: 99,
          background: "#25D366", color: "#06371b",
          display: "grid", placeItems: "center",
          boxShadow: "0 6px 22px rgba(37,211,102,.5), 0 2px 8px rgba(0,0,0,.18)",
          animation: "waFadeIn .4s var(--ease-out)",
          transition: "transform .25s var(--ease), box-shadow .25s var(--ease)",
          textDecoration: "none",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.1) translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,211,102,.55), 0 3px 10px rgba(0,0,0,.2)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 6px 22px rgba(37,211,102,.5), 0 2px 8px rgba(0,0,0,.18)";
        }}
      >
        <Icon name="wa" size={26} />
      </a>
      <style>{`@keyframes waFadeIn { from { opacity:0; transform:scale(.75); } to { opacity:1; transform:scale(1); } }`}</style>
    </>
  );
}

/* ============================================================
   Home — todas las secciones
   ============================================================ */
export function Home({ navigate, search }) {
  const ref = useReveal();
  const [filter, setFilter] = useState(
    search?.dest && search.dest !== "Cualquier destino" ? search.dest : "Todos"
  );

  const ciudades = ["Todos", "Cartagena", "Santa Marta"];
  const list = filter === "Todos" ? PROPERTIES : PROPERTIES.filter(p => p.ciudad === filter);

  return (
    <main ref={ref}>
      <Hero onSearch={(s) => {
        if (s.propertyId) {
          // Navega directo al apartamento seleccionado
          navigate({ name: "property", id: s.propertyId });
        } else {
          // Sin selección: muestra todos y baja al listado
          navigate({ name: "home" });
          setFilter("Todos");
          setTimeout(() => document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" }), 60);
        }
      }} />

      {/* ─── LISTADO ─── */}
      <section id="listado" style={{ paddingBlock: "88px 76px" }}>
        <div className="wrap">
          <div className="reveal" style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 34,
          }}>
            <div>
              <span className="eyebrow">Nuestros apartamentos</span>
              <h2 style={{ fontSize: "clamp(28px,3.8vw,44px)", marginTop: 10, maxWidth: 520 }}>
                Estancias seleccionadas{" "}
                <span className="serif-it">con el mar de fondo</span>
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ciudades.map(c => (
                <button key={c} onClick={() => setFilter(c)} className="chip" style={{
                  background: filter === c ? "var(--ink)" : "#fff",
                  color: filter === c ? "#fff" : "var(--ink-2)",
                  borderColor: filter === c ? "var(--ink)" : "var(--line-strong)",
                  padding: "10px 18px", fontWeight: 600,
                }}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid-cards">
            {list.map((p, i) => <PropertyCard key={p.id} p={p} navigate={navigate} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── DESTINOS ─── */}
      <section id="destinos" style={{ paddingBlock: "20px 88px", background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="eyebrow">Dónde te esperamos</span>
            <h2 style={{ fontSize: "clamp(28px,3.8vw,44px)", marginTop: 10 }}>
              Dos joyas del Caribe
            </h2>
          </div>
          <div className="reveal-scale dest-grid">
            {[
              { c: "Cartagena",   d: "El Laguito · frente a la bahía", n: 2, label: "Skyline de Cartagena" },
              { c: "Santa Marta", d: "Donde la sierra abraza el mar",   n: 1, label: "Bahía de Santa Marta" },
            ].map(x => (
              <button
                key={x.c}
                onClick={() => { setFilter(x.c); document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" }); }}
                className="dest-card"
                style={{ position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "1.75", textAlign: "left", color: "#fff" }}
              >
                <PropImage
                  src={x.c === "Cartagena" ? "/images/cartagena-1/01.jpg" : "/images/santamarta/01.jpg"}
                  alt={x.label}
                />
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
                    {x.n} {x.n > 1 ? "apartamentos" : "apartamento"} <Icon name="arrow" size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <style>{`
          .dest-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
          .dest-card { cursor:pointer; transition: transform .4s var(--ease), box-shadow .4s var(--ease); }
          .dest-card .ph::after { display:none; }
          @media (hover: hover) {
            .dest-card:hover { transform: translateY(-4px); box-shadow: var(--sh-lg); }
          }
          @media (max-width:620px) { .dest-grid { grid-template-columns:1fr; } }
        `}</style>
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
                Sin plataformas de por medio. Tu estancia, directamente con quienes cuidan los apartamentos.
              </p>
              <a
                className="btn btn-wa"
                style={{ marginTop: 32 }}
                href={waLink("Hola INNOVARE JM, quiero saber más sobre disponibilidad.")}
                target="_blank" rel="noopener"
              >
                <Icon name="wa" size={18} /> Escríbenos
              </a>
            </div>

            {/* Columna derecha: lista numerada */}
            <div className="exp-list">
              {[
                { n: "01", ic: "key",     t: "Trato directo",     d: "Sin intermediarios ni comisiones ocultas. Hablas con nosotros de principio a fin." },
                { n: "02", ic: "shield",  t: "Reserva segura",    d: "Confirmación inmediata y acompañamiento durante toda tu estancia." },
                { n: "03", ic: "sea",     t: "Vista garantizada", d: "Todos nuestros apartamentos miran directo al mar Caribe." },
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

        <style>{`
          .exp-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 80px;
            align-items: start;
          }
          .exp-heading {
            position: sticky;
            top: 110px;
          }
          .exp-item {
            display: grid;
            grid-template-columns: 44px 1fr 32px;
            gap: 0 20px;
            padding: 26px 0;
            border-top: 1px solid rgba(255,255,255,.11);
            align-items: flex-start;
          }
          .exp-num {
            font-family: var(--mono);
            font-size: 11px;
            letter-spacing: .14em;
            color: var(--cyan-soft);
            padding-top: 4px;
          }
          .exp-body { flex: 1; }
          .exp-icon {
            color: rgba(255,255,255,.12);
            padding-top: 3px;
          }

          @media (max-width: 860px) {
            .exp-layout { grid-template-columns: 1fr !important; gap: 44px 0 !important; }
            .exp-heading { position: static !important; }
          }
          @media (max-width: 480px) {
            .exp-item { grid-template-columns: 38px 1fr !important; }
            .exp-icon { display: none !important; }
          }
        `}</style>
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
              <svg width="260" height="194" viewBox="0 0 64 48" fill="none">
                <path d="M3 46 L20 4 L32 26 L27 35 L20 21 L13 34 L3 46 Z" fill="white"/>
                <path d="M44 4 L61 46 L51 46 L44 33 L37 46 L32 38 L44 4 Z" fill="white"/>
                <path d="M32 18 L36 26 L32 33 L28 26 Z" fill="white"/>
              </svg>
            </div>
            <div style={{ position: "relative" }}>
              <h2 style={{ fontSize: "clamp(26px,4vw,48px)", lineHeight: 1.05 }}>
                ¿Listo para tu escapada{" "}
                <span className="serif-it">frente al mar</span>?
              </h2>
              <p style={{ maxWidth: 430, margin: "18px auto 0", fontSize: 16.5, color: "rgba(255,255,255,.9)" }}>
                Escríbenos por WhatsApp y te ayudamos a encontrar fechas y el apartamento perfecto.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
                <a className="btn btn-wa"
                  href={waLink("Hola INNOVARE JM, quiero reservar un apartamento frente al mar. ¿Me ayudan con la disponibilidad?")}
                  target="_blank" rel="noopener">
                  <Icon name="wa" size={19} /> Escríbenos por WhatsApp
                </a>
                <button className="btn" style={{ background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.4)" }}
                  onClick={() => document.getElementById("listado")?.scrollIntoView({ behavior: "smooth" })}>
                  Ver apartamentos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botón flotante de WhatsApp */}
      <FloatingWA />

      <style>{`
        .grid-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
        @media (max-width:900px)  { .grid-cards { grid-template-columns:1fr 1fr; gap:20px; } }
        @media (max-width:560px)  { .grid-cards { grid-template-columns:1fr; gap:22px; } }
      `}</style>
    </main>
  );
}
