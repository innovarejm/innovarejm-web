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
