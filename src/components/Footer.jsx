import { Wordmark } from '../brand/Wordmark';
import { Icon } from '../icons/Icon';
import { CONTACT, PROPERTIES, waLink } from '../data/properties';
import { routeToUrl } from '../router';

const CIUDADES = [...new Set(PROPERTIES.map(p => p.ciudad))];

export function Footer({ navigate }) {
  return (
    <footer style={{ background: "var(--navy)", color: "rgba(255,255,255,.74)", paddingTop: 72, position: "relative", overflow: "hidden" }}>
      {/* Marca de agua decorativa del logo */}
      <div style={{
        position: "absolute", right: -80, bottom: -70,
        opacity: .045, pointerEvents: "none",
        transform: "rotate(12deg)",
      }}>
        <img src="/brand/logo-mark-white.png" alt="" aria-hidden="true" loading="lazy" style={{ width: 520, height: "auto", display: "block" }} />
      </div>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 40 }} className="foot-grid">
          <div>
            <Wordmark light />
            <p style={{ marginTop: 20, maxWidth: 320, fontSize: 14.5, lineHeight: 1.7 }}>
              Apartamentos frente al mar en Cartagena y Santa Marta, y una finca para grupos junto al Lago Calima.
              Estancias pensadas para que solo te preocupes por disfrutar.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="foot-soc">
                <Icon name="insta" size={19} />
              </a>
              <a href={waLink("Hola INNOVARE JM 👋")} target="_blank" rel="noopener noreferrer" className="foot-soc">
                <Icon name="wa" size={19} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="foot-h">Explorar</h4>
            <FootLink onClick={() => navigate({ name: "home" }, "#listado")}>Alojamientos</FootLink>
            <FootLink onClick={() => navigate({ name: "home" }, "#destinos")}>Destinos</FootLink>
            <FootLink onClick={() => navigate({ name: "home" }, "#experiencia")}>La experiencia</FootLink>
          </div>
          <div>
            <h4 className="foot-h">Destinos</h4>
            {CIUDADES.map(c => (
              <FootLink key={c} onClick={() => navigate({ name: "home", dest: c }, "#listado")}>{c}</FootLink>
            ))}
          </div>
          <div>
            <h4 className="foot-h">Contacto</h4>
            <a className="foot-link" href={waLink("Hola INNOVARE JM 👋")} target="_blank" rel="noopener noreferrer">
              {CONTACT.whatsappDisplay}
            </a>
            <a className="foot-link" href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer">
              @{CONTACT.instagram}
            </a>
            <a className="foot-link" href={routeToUrl({ name: "privacy" })}
              onClick={e => { e.preventDefault(); navigate({ name: "privacy" }); }}>
              Política de datos
            </a>
          </div>
        </div>

        <div style={{
          marginTop: 56, paddingBlock: 26, borderTop: "1px solid rgba(255,255,255,.12)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          fontSize: 12.5, color: "rgba(255,255,255,.5)",
        }}>
          <span>© {new Date().getFullYear()} INNOVARE JM Inmobiliaria · Colombia</span>
          {/* Registro Nacional de Turismo de cada alojamiento (obligatorio en su publicidad) */}
          <span>RNT {PROPERTIES.filter(p => p.rnt).map(p => p.rnt).join(" · ")}</span>
          <span style={{ fontFamily: "var(--mono)", letterSpacing: ".08em" }}>Hecho con vista al mar</span>
        </div>
      </div>

      <style>{`
        .foot-h{ color:#fff; font-size:13px; letter-spacing:.04em; margin-bottom:16px; font-weight:600; }
        .foot-link{ display:block; font-size:14px; color:rgba(255,255,255,.7); padding:6px 0; transition:color .2s; }
        .foot-link:hover{ color:var(--cyan); }
        .foot-soc{ width:42px; height:42px; border-radius:99px; display:grid; place-items:center;
          border:1px solid rgba(255,255,255,.18); color:#fff; transition:all .25s var(--ease); }
        .foot-soc:hover{ background:var(--cyan); border-color:var(--cyan); transform:translateY(-3px); }
        @media (max-width: 820px){ .foot-grid{ grid-template-columns:1fr 1fr !important; } }
        @media (max-width: 520px){ .foot-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </footer>
  );
}

function FootLink({ onClick, children }) {
  return (
    <button className="foot-link" onClick={onClick} style={{ textAlign: "left" }}>
      {children}
    </button>
  );
}
