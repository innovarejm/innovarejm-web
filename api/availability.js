/**
 * Vercel Serverless Function — /api/availability
 * Proxy que descarga y parsea el calendario iCal de Airbnb.
 * Los URLs con token nunca llegan al navegador.
 *
 * Uso: GET /api/availability?property=bocagrande-1601
 */

/*
 * Enlaces iCal por alojamiento. Se leen de variables de entorno de Vercel
 * (Settings → Environment Variables), con el nombre ICAL_ + id en mayúsculas:
 *   ICAL_BOCAGRANDE_1601, ICAL_BOCAGRANDE_1604, ICAL_RODADERO_901, ICAL_DARIEN_VILLA_SONADA
 * El enlace sale de Airbnb → Calendario → Disponibilidad → Exportar calendario.
 *
 * ICAL_FALLBACK conserva los enlaces que ya estaban en el código para no romper nada
 * mientras se configuran las variables. Cuando estén en Vercel, se puede vaciar.
 *
 * Reservas directas (WhatsApp): Airbnb no conoce las reservas que cierra la asesora.
 * Para que la web no muestre libres esas fechas, se añade una segunda fuente por
 * alojamiento: ICAL_<ID>_DIRECTO = dirección iCal secreta de un Google Calendar
 * (Configuración del calendario → "Dirección secreta en formato iCal"), donde la
 * asesora crea un evento por cada reserva cerrada fuera de Airbnb.
 * Cualquiera de las dos variables admite varias URL separadas por coma o espacio.
 */
const PROPERTY_IDS = ['bocagrande-1601', 'bocagrande-1604', 'rodadero-901', 'darien-villa-sonada'];

const ICAL_FALLBACK = {
  'bocagrande-1601': 'https://www.airbnb.com.co/calendar/ical/965354217729718896.ics?t=3ee98be33f454d6096445a330801bf08',
  'bocagrande-1604': 'https://www.airbnb.com.co/calendar/ical/1201408121076854785.ics?t=ee114ee673004ca68bad18f60f55785c',
  'rodadero-901':    'https://www.airbnb.com.co/calendar/ical/666579984263350325.ics?t=55780b643ada408392814083135d81dd',
};

function splitUrls(value) {
  return String(value || '').split(/[\s,]+/).map(s => s.trim()).filter(s => /^https:\/\//i.test(s));
}

/** Todas las fuentes iCal del alojamiento: Airbnb (o respaldo) + reservas directas. */
function icalUrlsFor(property) {
  const envKey = 'ICAL_' + property.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const main = splitUrls(process.env[envKey]);
  const urls = main.length ? main : splitUrls(ICAL_FALLBACK[property]);
  return [...urls, ...splitUrls(process.env[envKey + '_DIRECTO'])];
}

async function fetchIcal(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'INNOVARE-JM-Website/1.0' },
    });
    if (!response.ok) throw new Error(`calendario respondió HTTP ${response.status}`);
    return parseIcal(await response.text());
  } finally {
    clearTimeout(timeout);
  }
}

/** Convierte DTSTART/DTEND a YYYY-MM-DD */
function parseDate(raw) {
  if (!raw) return null;
  // Elimina hora (T...) y selector de tipo (;VALUE=DATE)
  const clean = raw.split(';')[0].split('T')[0].trim();
  if (clean.length < 8) return null;
  return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}`;
}

/** Parsea el texto iCal y devuelve array de rangos bloqueados */
function parseIcal(text) {
  const events = [];
  // Normaliza saltos de línea y desdobla líneas largas (RFC 5545 line folding)
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '');           // RFC 5545: continuation lines start with space/tab

  const lines = normalized.split('\n');
  let inEvent = false;
  let ev = {};

  for (const line of lines) {
    if (line.trim() === 'BEGIN:VEVENT') { inEvent = true; ev = {}; continue; }
    if (line.trim() === 'END:VEVENT') {
      if (ev.start && ev.end) {
        events.push({
          start:   ev.start,
          end:     ev.end,
          summary: ev.summary || 'Reservado',
        });
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    // Extrae la parte después del primer ':'
    const colonIdx = line.indexOf(':');
    if (colonIdx < 0) continue;
    const key = line.slice(0, colonIdx).toUpperCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key.startsWith('DTSTART')) ev.start   = parseDate(val);
    if (key.startsWith('DTEND'))   ev.end     = parseDate(val);
    if (key === 'SUMMARY')         ev.summary = val;
  }

  return events;
}

export default async function handler(req, res) {
  // CORS — permite que el frontend de cualquier origen consuma la API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { property } = req.query;
  if (!PROPERTY_IDS.includes(property)) {
    return res.status(400).json({ error: `Propiedad desconocida: ${property}` });
  }
  const urls = icalUrlsFor(property);
  if (!urls.length) {
    // Alojamiento sin calendario configurado: la web muestra "te confirmamos por WhatsApp"
    return res.status(404).json({ error: 'Calendario no configurado', blockedRanges: [] });
  }

  // Se consultan todas las fuentes en paralelo; si una falla se usan las demás.
  const results = await Promise.allSettled(urls.map(fetchIcal));
  const ok = results.filter(r => r.status === 'fulfilled');
  const failed = results.length - ok.length;
  results.forEach(r => { if (r.status === 'rejected') console.error('[availability]', property, r.reason?.message); });

  if (!ok.length) {
    return res.status(500).json({ error: 'No se pudo leer el calendario', blockedRanges: [] });
  }

  const blockedRanges = ok.flatMap(r => r.value).sort((a, b) => a.start.localeCompare(b.start));

  // Cache: 15 min en Vercel Edge (las reservas directas se reflejan rápido), stale hasta 24 h.
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=86400');
  return res.status(200).json({
    property,
    blockedRanges,
    count: blockedRanges.length,
    sources: urls.length,
    partial: failed > 0,
    updatedAt: new Date().toISOString(),
  });
}
