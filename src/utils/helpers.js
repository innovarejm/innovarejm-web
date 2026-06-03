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
