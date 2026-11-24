export function formatCOP(n) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export function nightsBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

export const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
export const MESES_AB = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

export function fmtFecha(d) {
  if (!d) return "—";
  return d.getDate() + " " + MESES_AB[d.getMonth()];
}

// Fecha local ⇄ "YYYY-MM-DD" (para la URL)
export function toISODate(d) {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function fromISODate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d) ? null : d;
}

export function huespedesTxt(g) {
  const total = g.adultos + g.ninos;
  return `${total} huésped${total > 1 ? "es" : ""}${g.bebes ? `, ${g.bebes} bebé${g.bebes > 1 ? "s" : ""}` : ""}`;
}

/*
 * Teléfono en formato E.164 (+57XXXXXXXXXX). Un celular colombiano escrito sin indicativo
 * (10 dígitos que empiezan por 3) recibe +57. Así el lead de la web y el chat de WhatsApp
 * de la misma persona se unen en el CRM. Devuelve "" si no hay suficientes dígitos.
 */
export function normalizePhone(raw) {
  const s = String(raw || "").trim();
  let digits = s.replace(/\D/g, "");
  if (!digits) return "";
  if (!s.startsWith("+") && digits.startsWith("00")) digits = digits.slice(2);
  else if (!s.startsWith("+") && digits.length === 10 && digits.startsWith("3")) digits = "57" + digits;
  return digits.length >= 8 && digits.length <= 15 ? "+" + digits : "";
}

/** Código corto para reconocer la solicitud web en WhatsApp y en el CRM (ej. IJM-7K2Q9). */
export function leadRef(eventId) {
  const clean = String(eventId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return "IJM-" + (clean.slice(0, 5) || Date.now().toString(36).toUpperCase().slice(-5));
}

// Returns { subtotal, rows } where rows = [{ count, price, label }]
// Weekend nights = Fri/Sat/Sun; uses precioFinde when defined.
// tarifaDe(date) → { precio, label } | null: tarifa de temporada para esa noche (opcional).
export function calcSubtotal(start, end, precio, precioFinde, tarifaDe) {
  if (!start || !end) return { subtotal: 0, rows: [] };
  const rows = [];
  let subtotal = 0;
  let d = new Date(+start);
  while (+d < +end) {
    const day = d.getDay(); // 0=Sun,5=Fri,6=Sat → finde
    const temporada = tarifaDe ? tarifaDe(d) : null;
    const isFinde = !temporada && precioFinde && (day === 0 || day === 5 || day === 6);
    const price = temporada ? temporada.precio : isFinde ? precioFinde : precio;
    const label = temporada ? (temporada.label || "temporada") : precioFinde ? (isFinde ? "fin de semana" : "entre semana") : null;
    if (rows.length > 0 && rows[rows.length - 1].price === price && rows[rows.length - 1].label === label) {
      rows[rows.length - 1].count++;
    } else {
      rows.push({ count: 1, price, label });
    }
    subtotal += price;
    d = new Date(+d + 86400000);
  }
  return { subtotal, rows };
}
