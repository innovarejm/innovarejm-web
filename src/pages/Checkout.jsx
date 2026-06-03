import { useState, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { Placeholder } from '../components/Placeholder';
import { PropImage } from '../components/PropImage';
import { PROPERTIES, waLink } from '../data/properties';
import { formatCOP, nightsBetween, fmtFecha } from '../utils/helpers';

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

function Field({ label, value, onChange, placeholder, full }) {
  return (
    <label style={{ display: "block", gridColumn: full ? "1 / -1" : "auto" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width: "100%", padding: "13px 15px", borderRadius: 11, border: "1.4px solid var(--line-strong)",
        fontSize: 15, fontFamily: "inherit", color: "var(--ink)", outline: "none", transition: "border-color .2s, box-shadow .2s",
      }}
        onFocus={e => { e.target.style.borderColor = "var(--blue)"; e.target.style.boxShadow = "0 0 0 3px rgba(43,168,224,.15)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--line-strong)"; e.target.style.boxShadow = "none"; }} />
    </label>
  );
}

function MethodOption({ active, onClick, icon, title, desc, badge, disabled }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", gap: 14, alignItems: "flex-start", textAlign: "left", padding: "16px 18px", borderRadius: 14,
      border: "1.6px solid " + (active ? "var(--blue)" : "var(--line-strong)"),
      background: active ? "rgba(43,168,224,.06)" : "#fff", transition: "all .2s var(--ease)", width: "100%",
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

function DoneCard({ p, navigate, waMsg }) {
  return (
    <div style={{ maxWidth: 560, background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 40, textAlign: "center", boxShadow: "var(--sh-md)" }}>
      <div style={{ width: 72, height: 72, borderRadius: 99, background: "var(--grad-brand)", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
        <Icon name="check" size={36} stroke={2.4} />
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700 }}>Recibimos tu solicitud</h2>
      <p style={{ color: "var(--muted)", marginTop: 10, fontSize: 15.5, lineHeight: 1.6 }}>
        En INNOVARE JM revisaremos la disponibilidad de <strong>{p.nombre}</strong> y te escribiremos muy pronto para confirmar y coordinar el pago.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
        <a className="btn btn-wa" href={waLink(waMsg)} target="_blank" rel="noopener">
          <Icon name="wa" size={18} /> Continuar por WhatsApp
        </a>
        <button className="btn btn-line" onClick={() => navigate({ name: "home" })}>Volver al inicio</button>
      </div>
    </div>
  );
}

export function Checkout({ id, booking, navigate }) {
  const p = PROPERTIES.find(x => x.id === id) || PROPERTIES[0];
  const start = booking ? new Date(booking.range.start) : null;
  const end = booking ? new Date(booking.range.end) : null;
  const guests = booking ? booking.guests : { adultos: 2, ninos: 0, bebes: 0 };
  const nights = nightsBetween(start, end);
  const totalG = guests.adultos + guests.ninos;

  const subtotal = nights * p.precio;
  const servicio = Math.round(subtotal * p.servicioPct);
  const total = subtotal + p.aseo + servicio;

  const [method, setMethod] = useState("wa");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", tel: "" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const waMsg = `Hola INNOVARE JM 👋, quiero reservar:
• ${p.nombre} (${p.sector}, ${p.ciudad})
• ${fmtFecha(start)} → ${fmtFecha(end)} · ${nights} noche${nights > 1 ? "s" : ""}
• ${totalG} huésped${totalG > 1 ? "es" : ""}${guests.bebes ? `, ${guests.bebes} bebé${guests.bebes > 1 ? "s" : ""}` : ""}
• Total estimado: ${formatCOP(total)}
${form.nombre ? "\nMi nombre: " + form.nombre : ""}`;

  const valid = form.nombre.trim() && form.tel.trim();

  return (
    <main style={{ paddingTop: 78, minHeight: "100vh", background: "var(--paper)" }}>
      <div className="wrap" style={{ paddingTop: 28, paddingBottom: 90 }}>
        <button onClick={() => navigate({ name: "property", id: p.id })} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: "var(--ink-2)", fontWeight: 500, marginBottom: 22 }}>
          <Icon name="arrowL" size={16} /> Volver al apartamento
        </button>

        <h1 style={{ fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 700, marginBottom: 6 }}>
          {done ? "¡Solicitud enviada!" : "Confirma y reserva"}
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 34, fontSize: 16 }}>
          {done ? "Te contactaremos muy pronto para confirmar tu estancia." : "Estás a un paso de tu escapada frente al mar."}
        </p>

        {done ? <DoneCard p={p} navigate={navigate} waMsg={waMsg} /> : (
          <div className="co-grid">
            <div style={{ display: "grid", gap: 22 }}>
              <Panel n="1" t="Tus datos">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="form-grid">
                  <Field label="Nombre completo" value={form.nombre} onChange={v => setForm({ ...form, nombre: v })} placeholder="Tu nombre" full />
                  <Field label="Teléfono / WhatsApp" value={form.tel} onChange={v => setForm({ ...form, tel: v })} placeholder="+57 ..." />
                  <Field label="Correo (opcional)" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="tucorreo@email.com" />
                </div>
              </Panel>

              <Panel n="2" t="¿Cómo quieres continuar?">
                <div style={{ display: "grid", gap: 12 }}>
                  <MethodOption active={method === "wa"} onClick={() => setMethod("wa")}
                    icon="wa" title="Reservar por WhatsApp" desc="Te confirmamos disponibilidad y coordinamos el pago contigo. Recomendado." badge="Más rápido" />
                  <MethodOption active={method === "card"} onClick={() => setMethod("card")}
                    icon="shield" title="Pagar con tarjeta" desc="Pasarela de pago en línea." badge="Próximamente" disabled />
                </div>
                {method === "card" && (
                  <div style={{ marginTop: 16, padding: 18, borderRadius: 14, background: "var(--paper-2)", border: "1px dashed var(--line-strong)" }}>
                    <p style={{ fontSize: 13, color: "var(--blue-deep)", display: "flex", gap: 8, alignItems: "center" }}>
                      <Icon name="shield" size={16} /> La pasarela de pago se habilitará pronto. Por ahora, reserva por WhatsApp.
                    </p>
                  </div>
                )}
              </Panel>

              {method === "wa" ? (
                <a className="btn btn-wa" style={{ justifyContent: "center", height: 56, fontSize: 16, opacity: valid ? 1 : .5, pointerEvents: valid ? "auto" : "none" }}
                  href={waLink(waMsg)} target="_blank" rel="noopener" onClick={() => setTimeout(() => setDone(true), 400)}>
                  <Icon name="wa" size={20} /> Enviar solicitud por WhatsApp
                </a>
              ) : (
                <button className="btn btn-dark" style={{ justifyContent: "center", height: 56, fontSize: 16, opacity: valid ? 1 : .5 }}
                  disabled={!valid} onClick={() => setDone(true)}>
                  Enviar solicitud de reserva
                </button>
              )}
              {!valid && <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", marginTop: -8 }}>Completa tu nombre y teléfono para continuar.</p>}
            </div>

            <aside>
              <div style={{ position: "sticky", top: 96, background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 22, boxShadow: "var(--sh-md)" }}>
                <div style={{ display: "flex", gap: 14, paddingBottom: 18, borderBottom: "1px solid var(--line)" }}>
                  <div style={{ width: 92, height: 80, borderRadius: 12, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                    <PropImage src={p.galeria[0]} alt={p.nombre} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{p.nombre}</h3>
                    <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>{p.sector}, {p.ciudad}</p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, marginTop: 5 }}>
                      <Icon name="star" size={13} style={{ fill: "var(--ink)" }} /> {p.rating}
                    </span>
                  </div>
                </div>
                <div style={{ paddingBlock: 18, borderBottom: "1px solid var(--line)", display: "grid", gap: 12 }}>
                  <SumRow l="Fechas" r={`${fmtFecha(start)} → ${fmtFecha(end)}`} />
                  <SumRow l="Huéspedes" r={`${totalG}${guests.bebes ? " + " + guests.bebes + " bebé" + (guests.bebes > 1 ? "s" : "") : ""}`} />
                  <SumRow l="Noches" r={nights} />
                </div>
                <div style={{ paddingTop: 18, display: "grid", gap: 11, fontSize: 14.5 }}>
                  <PriceRow l={`${formatCOP(p.precio)} × ${nights} noche${nights > 1 ? "s" : ""}`} r={formatCOP(subtotal)} />
                  <PriceRow l="Tarifa de limpieza" r={formatCOP(p.aseo)} />
                  <PriceRow l="Tarifa de servicio" r={formatCOP(servicio)} />
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
        @media (max-width:920px){ .co-grid{ grid-template-columns:1fr; } .co-grid aside > div{ position:static !important; } .co-grid aside{ order:-1; }
          .form-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </main>
  );
}
