import { useState, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { PropImage } from '../components/PropImage';
import { useAvailability, isRangeAvailable } from '../hooks/useAvailability';
import { findProperty, waLink } from '../data/properties';
import { formatCOP, nightsBetween, fmtFecha, calcSubtotal, huespedesTxt } from '../utils/helpers';
import { routeToUrl } from '../router';
import { NotFound } from './Privacy';

const DEFAULT_GUESTS = { adultos: 2, ninos: 0, bebes: 0 };
const telOk = (t) => t.replace(/\D/g, "").length >= 7;
const emailOk = (e) => !e.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

function Panel({ n, t, children }) {
  return (
    <section style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 18, padding: 24 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: 99, background: "var(--ink)", color: "#fff", display: "grid", placeItems: "center", fontSize: 14, flexShrink: 0 }}>{n}</span>
        {t}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, full, error, ...inputProps }) {
  return (
    <label style={{ display: "block", gridColumn: full ? "1 / -1" : "auto" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="co-input"
        aria-invalid={!!error} {...inputProps}
        style={{ borderColor: error ? "#d05a5a" : undefined }} />
      {error && <span style={{ display: "block", fontSize: 12.5, color: "#b54848", marginTop: 5 }}>{error}</span>}
    </label>
  );
}

function MethodOption({ active, onClick, icon, title, desc, badge, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} aria-disabled={disabled} style={{
      display: "flex", gap: 14, alignItems: "flex-start", textAlign: "left", padding: "16px 18px", borderRadius: 14,
      border: "1.6px solid " + (active ? "var(--blue)" : "var(--line-strong)"),
      background: active ? "rgba(43,168,224,.06)" : "#fff", transition: "all .2s var(--ease)", width: "100%",
      opacity: disabled ? .6 : 1, cursor: disabled ? "not-allowed" : "pointer",
    }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0,
        background: active ? "var(--grad-brand)" : "var(--paper-2)", color: active ? "#fff" : "var(--ink-2)" }}>
        <Icon name={icon} size={20} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15.5 }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", padding: "3px 9px", borderRadius: 99,
              background: disabled ? "var(--paper-2)" : "var(--cyan)", color: disabled ? "var(--muted)" : "#fff" }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>{desc}</p>
      </div>
      <span style={{ width: 22, height: 22, borderRadius: 99, border: "2px solid " + (active ? "var(--blue)" : "var(--line-strong)"),
        display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
        {active && <span style={{ width: 11, height: 11, borderRadius: 99, background: "var(--blue)" }} />}
      </span>
    </button>
  );
}

function SumRow({ l, r }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "var(--muted)" }}>{l}</span>
      <span style={{ fontWeight: 600 }}>{r}</span>
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

/* Tarjeta para los casos en que no se puede reservar desde aquí */
function Notice({ icon = "cal", title, children, actions }) {
  return (
    <div style={{ maxWidth: 560, background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 36, boxShadow: "var(--sh-md)" }}>
      <span style={{ width: 56, height: 56, borderRadius: 99, background: "var(--paper-2)", color: "var(--blue)", display: "grid", placeItems: "center", marginBottom: 18 }}>
        <Icon name={icon} size={26} />
      </span>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>{title}</h2>
      <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15.5, lineHeight: 1.6 }}>{children}</p>
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>{actions}</div>
    </div>
  );
}

function DoneCard({ p, navigate, waMsg }) {
  return (
    <div style={{ maxWidth: 560, background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 40, textAlign: "center", boxShadow: "var(--sh-md)" }}>
      <div style={{ width: 72, height: 72, borderRadius: 99, background: "#25D366", color: "#06371b", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Icon name="wa" size={36} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700 }}>Solo falta enviar el mensaje</h2>
      <p style={{ color: "var(--muted)", marginTop: 10, fontSize: 15.5, lineHeight: 1.6 }}>
        Abrimos WhatsApp con tu solicitud para <strong>{p.nombre}</strong> ya escrita. Envíala y te confirmamos
        disponibilidad y forma de pago muy pronto. Si WhatsApp no se abrió, usa el botón de abajo.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
        <a className="btn btn-wa" href={waLink(waMsg)} target="_blank" rel="noopener noreferrer">
          <Icon name="wa" size={18} /> Abrir WhatsApp
        </a>
        <button className="btn btn-line" onClick={() => navigate({ name: "home" })}>Volver al inicio</button>
      </div>
    </div>
  );
}

export function Checkout({ id, booking, navigate }) {
  const p = findProperty(id);
  const start = booking?.range?.start || null;
  const end = booking?.range?.end || null;
  const guests = booking?.guests || DEFAULT_GUESTS;
  const nights = nightsBetween(start, end);
  const totalG = guests.adultos + guests.ninos;

  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", tel: "", acepta: false });
  const [showErrors, setShowErrors] = useState(false);
  const { blockedRanges, loading: loadingAvail } = useAvailability(p?.id || null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [done]);

  if (!p) return <NotFound navigate={navigate} />;

  const backToProperty = () => navigate({ name: "property", id: p.id, booking });
  const { subtotal, rows: priceRows } = calcSubtotal(start, end, p.precio, p.precioFinde);
  const aseo = p.aseo || 0;
  const total = subtotal + aseo;
  const conflict = !loadingAvail && nights > 0 && !isRangeAvailable(start, end, blockedRanges);

  const errors = {
    nombre: !form.nombre.trim() && "Escribe tu nombre.",
    tel: !telOk(form.tel) && "Escribe un teléfono válido (con indicativo si no es de Colombia).",
    email: !emailOk(form.email) && "Revisa el correo.",
    acepta: !form.acepta && "Debes aceptar la política de datos para continuar.",
  };
  const valid = !Object.values(errors).some(Boolean);
  const err = (k) => (showErrors ? errors[k] || null : null);

  const waMsg = `Hola INNOVARE JM 👋, quiero reservar:
• ${p.nombre} (${p.sector}, ${p.ciudad})
• ${fmtFecha(start)} → ${fmtFecha(end)} · ${nights} noche${nights > 1 ? "s" : ""}
• ${huespedesTxt(guests)}
• Total estimado: ${formatCOP(total)}

Mis datos:
• Nombre: ${form.nombre.trim()}
• Teléfono: ${form.tel.trim()}${form.email.trim() ? `\n• Correo: ${form.email.trim()}` : ""}`;

  // Casos en que no se puede reservar desde esta página (enlaces viejos, sin fechas, sin precio fijo)
  let blocker = null;
  if (!p.precio) {
    blocker = (
      <Notice icon="wa" title="Este alojamiento se cotiza por WhatsApp"
        actions={<>
          <a className="btn btn-wa" target="_blank" rel="noopener noreferrer"
            href={waLink(`Hola INNOVARE JM, quiero cotizar "${p.nombre}" para ${huespedesTxt(guests)}${nights ? ` del ${fmtFecha(start)} al ${fmtFecha(end)}` : ""}.`)}>
            <Icon name="wa" size={18} /> Cotizar por WhatsApp
          </a>
          <button className="btn btn-line" onClick={backToProperty}>Ver el alojamiento</button>
        </>}>
        El precio de {p.nombre} depende del número de personas y de las fechas. Escríbenos y te enviamos la cotización.
      </Notice>
    );
  } else if (!nights) {
    blocker = (
      <Notice title="Elige tus fechas"
        actions={<button className="btn btn-primary" onClick={backToProperty}>Elegir fechas</button>}>
        Para continuar con la reserva necesitamos las fechas de llegada y salida.
      </Notice>
    );
  } else if (conflict) {
    blocker = (
      <Notice title="Estas fechas ya no están disponibles"
        actions={<button className="btn btn-primary" onClick={() => navigate({ name: "property", id: p.id, booking: { range: { start: null, end: null }, guests } })}>Elegir otras fechas</button>}>
        Alguien reservó {p.nombre} del {fmtFecha(start)} al {fmtFecha(end)} o parte de esas noches. Elige otras fechas.
      </Notice>
    );
  }

  return (
    <main style={{ paddingTop: 78, minHeight: "100vh", background: "var(--paper)" }}>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 90 }}>
        <button onClick={backToProperty} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: "var(--ink-2)", fontWeight: 500, marginBottom: 22 }}>
          <Icon name="arrowL" size={16} /> Volver al alojamiento
        </button>

        <h1 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 700, marginBottom: 6 }}>
          {done ? "Tu solicitud está lista" : "Confirma y reserva"}
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 34, fontSize: 16 }}>
          {done ? "Envíala por WhatsApp para que la recibamos." : "Estás a un paso de tu escapada."}
        </p>

        {blocker ? blocker : done ? <DoneCard p={p} navigate={navigate} waMsg={waMsg} /> : (
          <div className="co-grid">
            <div style={{ display: "grid", gap: 22 }}>
              <Panel n="1" t="Tus datos">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-grid">
                  <Field label="Nombre completo" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} placeholder="Tu nombre" full
                    autoComplete="name" error={err("nombre")} />
                  <Field label="Teléfono / WhatsApp" value={form.tel} onChange={v => setForm({ ...form, tel: v })} placeholder="+57 300 000 0000"
                    type="tel" inputMode="tel" autoComplete="tel" error={err("tel")} />
                  <Field label="Correo (opcional)" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="tucorreo@email.com"
                    type="email" inputMode="email" autoComplete="email" error={err("email")} />
                </div>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 18, fontSize: 13.5, color: "var(--ink-2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.acepta} onChange={e => setForm({ ...form, acepta: e.target.checked })}
                    style={{ width: 18, height: 18, marginTop: 1, accentColor: "var(--blue)", flexShrink: 0 }} />
                  <span>
                    Autorizo a INNOVARE JM a tratar mis datos para gestionar esta solicitud, según la{" "}
                    <a href={routeToUrl({ name: "privacy" })} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", textDecoration: "underline" }}>
                      política de tratamiento de datos
                    </a>.
                  </span>
                </label>
                {err("acepta") && <p style={{ fontSize: 12.5, color: "#b54848", marginTop: 6 }}>{err("acepta")}</p>}
              </Panel>

              <Panel n="2" t="¿Cómo quieres continuar?">
                <div style={{ display: "grid", gap: 12 }}>
                  <MethodOption active icon="wa" title="Reservar por WhatsApp"
                    desc="Te confirmamos disponibilidad y coordinamos el pago contigo. Recomendado." badge="Más rápido" />
                  <MethodOption icon="shield" title="Pagar con tarjeta" desc="Pasarela de pago en línea." badge="Próximamente" disabled />
                </div>
              </Panel>

              <a className="btn btn-wa" style={{ justifyContent: "center", height: 56, fontSize: 16, opacity: valid ? 1 : .6 }}
                href={waLink(waMsg)} target="_blank" rel="noopener noreferrer"
                onClick={(e) => {
                  if (!valid) { e.preventDefault(); setShowErrors(true); return; }
                  setDone(true);
                }}>
                <Icon name="wa" size={20} /> Enviar solicitud por WhatsApp
              </a>
              {!valid && !showErrors && <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginTop: -8 }}>Completa tus datos y acepta la política para continuar.</p>}
            </div>

            <aside>
              <div style={{ position: "sticky", top: 96, background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 22, boxShadow: "var(--sh-md)" }}>
                <div style={{ display: "flex", gap: 14, paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
                  <div style={{ width: 92, height: 80, borderRadius: 12, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <PropImage src={p.galeria[0]} alt={p.nombre} sizes="92px" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{p.nombre}</h3>
                    <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>{p.sector}, {p.ciudad}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, marginTop: 5 }}>
                      <Icon name="star" size={13} style={{ fill: "var(--ink)" }} /> {p.rating ? `${p.rating} · ${p.resenas} reseña${p.resenas === 1 ? "" : "s"}` : "Nuevo"}
                    </span>
                  </div>
                </div>
                <div style={{ paddingBlock: 18, borderBottom: "1px solid var(--line)", display: "grid", gap: 12 }}>
                  <SumRow l="Fechas" r={`${fmtFecha(start)} → ${fmtFecha(end)}`} />
                  <SumRow l="Huéspedes" r={huespedesTxt(guests)} />
                  <SumRow l="Noches" r={nights} />
                </div>
                <div style={{ paddingTop: 18, display: "grid", gap: 11, fontSize: 14.5 }}>
                  {priceRows.map((r, i) => (
                    <PriceRow key={i} l={`${formatCOP(r.price)} × ${r.count} noche${r.count > 1 ? "s" : ""}${r.label ? ` (${r.label})` : ""}`} r={formatCOP(r.price * r.count)} />
                  ))}
                  {aseo > 0 && <PriceRow l="Tarifa de limpieza" r={formatCOP(aseo)} />}
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 13, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17 }}>
                    <span>Total</span><span>{formatCOP(total)}</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 14, display: "flex", gap: 7, alignItems: "flex-start" }}>
                  <Icon name="shield" size={15} style={{ flexShrink: 0, marginTop: 1 }} /> Aún no se realizará ningún cobro. Confirmamos disponibilidad antes de pagar.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        .co-grid{ display:grid; grid-template-columns:1fr 400px; gap:48px; align-items:start; }
        .co-grid aside{ align-self:stretch; }
        .co-input{ width:100%; padding:13px 15px; border-radius:11px; border:1.4px solid var(--line-strong);
          font-size:15px; font-family:inherit; color:var(--ink); outline:none; background:#fff; transition:border-color .2s, box-shadow .2s; }
        .co-input:focus{ border-color:var(--blue) !important; box-shadow:0 0 0 3px rgba(43,168,224,.15); }
        @media (max-width:920px){ .co-grid{ grid-template-columns:1fr; } .co-grid aside > div{ position:static !important; } .co-grid aside{ order:-1; }
          .form-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </main>
  );
}
