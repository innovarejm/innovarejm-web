/*
 * Rutas del sitio (URLs reales, se pueden compartir y recargar):
 *   /                      inicio      ?destino=Cartagena  ?llegada=…&salida=…&adultos=…  (#listado, #destinos…)
 *   /alojamientos/:id      detalle     ?llegada=2026-11-13&salida=2026-11-15&adultos=2&ninos=0&bebes=0
 *   /reservar/:id          checkout    (mismos parámetros)
 *   /privacidad            política de tratamiento de datos
 */
import { toISODate, fromISODate } from './utils/helpers';

const DEFAULT_GUESTS = { adultos: 2, ninos: 0, bebes: 0 };

function parseBooking(q) {
  const keys = ["llegada", "salida", "adultos", "ninos", "bebes"];
  if (!keys.some(k => q.has(k))) return null;
  let start = fromISODate(q.get("llegada"));
  let end = fromISODate(q.get("salida"));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (!start || start < today || (end && end <= start)) { start = null; end = null; }
  const int = (k, min, def) => {
    const n = parseInt(q.get(k), 10);
    return Number.isFinite(n) ? Math.max(min, Math.min(n, 99)) : def;
  };
  return {
    range: { start, end },
    guests: { adultos: int("adultos", 1, DEFAULT_GUESTS.adultos), ninos: int("ninos", 0, 0), bebes: int("bebes", 0, 0) },
  };
}

function bookingQuery(booking) {
  if (!booking) return "";
  const q = new URLSearchParams();
  const { range, guests } = booking;
  if (range?.start) q.set("llegada", toISODate(range.start));
  if (range?.end) q.set("salida", toISODate(range.end));
  if (guests) {
    q.set("adultos", guests.adultos);
    if (guests.ninos) q.set("ninos", guests.ninos);
    if (guests.bebes) q.set("bebes", guests.bebes);
  }
  const s = q.toString();
  return s ? "?" + s : "";
}

export function parseLocation(loc = window.location) {
  const q = new URLSearchParams(loc.search);
  const parts = decodeURIComponent(loc.pathname).split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home", dest: q.get("destino"), booking: parseBooking(q) };
  if (parts[0] === "alojamientos" && parts[1] && parts.length === 2) return { name: "property", id: parts[1], booking: parseBooking(q) };
  if (parts[0] === "reservar" && parts[1] && parts.length === 2) return { name: "checkout", id: parts[1], booking: parseBooking(q) };
  if (parts[0] === "privacidad" && parts.length === 1) return { name: "privacy" };
  return { name: "notfound" };
}

export function routeToUrl(r) {
  switch (r.name) {
    case "property": return `/alojamientos/${r.id}${bookingQuery(r.booking)}`;
    case "checkout": return `/reservar/${r.id}${bookingQuery(r.booking)}`;
    case "privacy":  return "/privacidad";
    case "home": {
      const q = bookingQuery(r.booking);
      if (r.dest) return "/" + (q ? q + "&" : "?") + "destino=" + encodeURIComponent(r.dest);
      return "/" + q;
    }
    default: return "/";
  }
}

/** Actualiza la URL sin crear una entrada nueva en el historial (ej. al elegir fechas). */
export function replaceUrl(route) {
  const url = routeToUrl(route);
  if (url !== window.location.pathname + window.location.search) {
    window.history.replaceState(window.history.state, "", url);
  }
}
