import { Wordmark } from '../brand/Wordmark';
import { Icon } from '../icons/Icon';
import { CONTACT, waLink } from '../data/properties';

export function Footer({ navigate }) {
  return (
    <footer style={{ background: "var(--navy)", color: "rgba(255,255,255,.74)", paddingTop: 72, position: "relative", overflow: "hidden" }}>
      {/* Marca de agua decorativa del logo */}
      <div style={{
        position: "absolute", right: -80, bottom: -70,
        opacity: .045, pointerEvents: "none",
        transform: "rotate(12deg)",
      }}>
        <svg width="520" height="385" viewBox="0 0 64 48" fill="none" aria-hidden="true">
          <path d="M3 46 L20 4 L32 26 L27 35 L20 21 L13 34 L3 46 Z" fill="white"/>
          <path d="M44 4 L61 46 L51 46 L44 33 L37 46 L32 38 L44 4 Z" fill="white"/>
          <path d="M32 18 L36 26 L32 33 L28 26 Z" fill="white"/>
        </svg>
      </div>
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 40 }} className="foot-grid">
          <div>
            <Wordmark light />
            <p style={{ marginTop: 20, maxWidth: 320, fontSize: 14.5, lineHeight: 1.7 }}>
              Apartamentos amoblados frente al mar en Cartagena y Santa Marta.
              Estancias pensadas para que solo te preocupes por disfrutar.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener" className="foot-soc">
                <Icon name="insta" size={19} />
              </a>
              <a href={waLink("Hola INNOVARE JM 👋")} target="_blank" rel="noopener" className="foot-soc">
                <Icon name="wa" size={19} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="foot-h">Explorar</h4>
            <FootLink onClick={() => navigate({ name: "home" }, "#listado")}>Apartamentos</FootLink>
            <FootLink onClick={() => navigate({ name: "home" }, "#destinos")}>Destinos</FootLink>
            <FootLink onClick={() => navigate({ name: "home" }, "#experiencia")}>La experiencia</FootLink>
          </div>
          <div>
            <h4 className="foot-h">Destinos</h4>
            <FootLink onClick={() => navigate({ name: "home" }, "#listado")}>Cartagena</FootLink>
            <FootLink onClick={() => navigate({ name: "home" }, "#listado")}>Santa Marta</FootLink>
          </div>
          <div>
            <h4 className="foot-h">Contacto</h4>
            <a className="foot-link" href={waLink("Hola INNOVARE JM 👋")} target="_blank" rel="noopener">
              {CONTACT.whatsappDisplay}
            </a>
            <a className="foot-link" href={CONTACT.instagramUrl} target="_blank" rel="noopener">
              @{CONTACT.instagram}
            </a>
          </div>
        </div>

        <div style={{
          marginTop: 56, paddingBlock: 26, borderTop: "1px solid rgba(255,255,255,.12)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          fontSize: 12.5, color: "rgba(255,255,255,.5)",
        }}>
          <span>© {new Date().getFullYear()} INNOVARE JM Inmobiliaria · Colombia</span>
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
