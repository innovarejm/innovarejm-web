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
 */
const PROPERTY_IDS = ['bocagrande-1601', 'bocagrande-1604', 'rodadero-901', 'darien-villa-sonada'];

const ICAL_FALLBACK = {
  'bocagrande-1601': 'https://www.airbnb.com.co/calendar/ical/965354217729718896.ics?t=3ee98be33f454d6096445a330801bf08',
  'bocagrande-1604': 'https://www.airbnb.com.co/calendar/ical/1201408121076854785.ics?t=ee114ee673004ca68bad18f60f55785c',
  'rodadero-901':    'https://www.airbnb.com.co/calendar/ical/666579984263350325.ics?t=55780b643ada408392814083135d81dd',
};

function icalUrlFor(property) {
  const envKey = 'ICAL_' + property.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return process.env[envKey] || ICAL_FALLBACK[property] || null;
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
  const icalUrl = icalUrlFor(property);
  if (!icalUrl) {
    // Alojamiento sin calendario configurado: la web muestra "te confirmamos por WhatsApp"
    return res.status(404).json({ error: 'Calendario no configurado', blockedRanges: [] });
  }

  try {
    // Timeout de 8s para no bloquear la UI
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(icalUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'INNOVARE-JM-Website/1.0' },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Airbnb respondió con HTTP ${response.status}`);
    }

    const icsText = await response.text();
    const blockedRanges = parseIcal(icsText);

    // Cache: 1 hora en Vercel Edge, stale hasta 24h mientras revalida
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      property,
      blockedRanges,
      count: blockedRanges.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[availability]', err.message);
    return res.status(500).json({ error: err.message, blockedRanges: [] });
  }
}
