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

// Returns { subtotal, rows } where rows = [{ count, price, label }]
// Weekend nights = Fri/Sat/Sun; uses precioFinde when defined.
export function calcSubtotal(start, end, precio, precioFinde) {
  if (!start || !end) return { subtotal: 0, rows: [] };
  const rows = [];
  let subtotal = 0;
  let d = new Date(+start);
  while (+d < +end) {
    const day = d.getDay(); // 0=Sun,5=Fri,6=Sat → finde
    const isFinde = precioFinde && (day === 0 || day === 5 || day === 6);
    const price = isFinde ? precioFinde : precio;
    const label = precioFinde ? (isFinde ? "fin de semana" : "entre semana") : null;
    if (rows.length > 0 && rows[rows.length - 1].price === price) {
      rows[rows.length - 1].count++;
    } else {
      rows.push({ count: 1, price, label });
    }
    subtotal += price;
    d = new Date(+d + 86400000);
  }
  return { subtotal, rows };
}
