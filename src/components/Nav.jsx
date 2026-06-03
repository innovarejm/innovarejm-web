import { useState, useEffect } from 'react';
import { Wordmark } from '../brand/Wordmark';
import { Icon } from '../icons/Icon';
import { CONTACT, waLink } from '../data/properties';

export function Nav({ navigate, route, transparentTop = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const light = transparentTop && !scrolled;
  const links = [
    { t: "Apartamentos", go: () => navigate({ name: "home" }, "#listado") },
    { t: "Destinos",     go: () => navigate({ name: "home" }, "#destinos") },
    { t: "Experiencia",  go: () => navigate({ name: "home" }, "#experiencia") },
    { t: "Contacto",     go: () => navigate({ name: "home" }, "#contacto") },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "background .4s var(--ease), box-shadow .4s, backdrop-filter .4s",
      background: light ? "transparent" : "rgba(251,252,253,.88)",
      backdropFilter: light ? "none" : "saturate(1.6) blur(16px)",
      boxShadow: light
        ? "none"
        : "0 1px 0 var(--line), inset 0 -2px 0 rgba(43,168,224,.22)",
      "--link-hover-bg": light ? "rgba(255,255,255,.14)" : "var(--paper-2)",
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 78 }}>
        <button onClick={() => navigate({ name: "home" })} style={{ display: "flex" }}>
          <Wordmark light={light} />
        </button>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }} className="nav-links">
          {links.map(l => (
            <button key={l.t} onClick={l.go}
              className="nav-link"
              style={{
                fontSize: 14.5, fontWeight: 500, padding: "9px 15px", borderRadius: 99,
                color: light ? "rgba(255,255,255,.92)" : "var(--ink-2)",
                transition: "background .2s, color .2s",
              }}>
              {l.t}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a className="btn nav-wa-btn" href={waLink("Hola INNOVARE JM, quiero información sobre disponibilidad.")} target="_blank" rel="noopener noreferrer"
            style={{
              padding: "11px 20px", fontSize: 14.5,
              border: light ? "1px solid rgba(255,255,255,.5)" : "1.5px solid var(--line-strong)",
              color: light ? "#fff" : "var(--ink)",
              background: light ? "rgba(255,255,255,.08)" : "#fff",
              backdropFilter: light ? "blur(6px)" : "none",
            }}>
            <Icon name="wa" size={17} /> Escríbenos
          </a>
          <button className="nav-burger" onClick={() => setOpen(o => !o)} style={{
            display: "none", color: light ? "#fff" : "var(--ink)", padding: 6,
          }}>
            <Icon name={open ? "close" : "menu"} size={24} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" style={{
          background: "var(--paper)", borderTop: "1px solid var(--line)", padding: "10px 0 18px",
        }}>
          <div className="wrap" style={{ display: "grid", gap: 2 }}>
            {links.map(l => (
              <button key={l.t} onClick={() => { l.go(); setOpen(false); }} style={{
                textAlign: "left", fontSize: 17, fontWeight: 500, padding: "13px 4px", color: "var(--ink)",
                borderBottom: "1px solid var(--line)",
              }}>{l.t}</button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 880px){
          .nav-links{ display:none !important; }
          .nav-burger{ display:flex !important; }
          .nav-wa-btn{ display:none !important; }
        }
        @media (min-width: 881px){ .mobile-menu{ display:none; } }
        .mobile-menu { animation: menuSlide .28s cubic-bezier(.16,1,.3,1) both; transform-origin: top; }
        @keyframes menuSlide { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </header>
  );
}
