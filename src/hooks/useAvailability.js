import { useState, useEffect } from 'react';

/**
 * Obtiene las fechas bloqueadas de un apartamento desde la API.
 * Sincroniza con el calendario de Airbnb via iCal.
 *
 * @param {string} propertyId - ID de la propiedad (ej. "bocagrande-1601")
 * @returns {{ blockedRanges: Array, loading: boolean, error: string|null }}
 */
export function useAvailability(propertyId) {
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!propertyId) { setLoading(false); return; }
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(`/api/availability?property=${propertyId}`)
      .then(r => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        setBlockedRanges(data.blockedRanges || []);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        // En desarrollo local sin vercel dev, la API no existe — falla silenciosamente
        console.warn('[useAvailability]', err.message);
        setBlockedRanges([]);
        setLoading(false);
        setError(err.message);
      });

    return () => { cancelled = true; };
  }, [propertyId]);

  return { blockedRanges, loading, error };
}

/**
 * Comprueba si una fecha está dentro de algún rango bloqueado.
 * @param {Date} date
 * @param {Array} blockedRanges  [{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }]
 */
export function isDateBlocked(date, blockedRanges) {
  const d = date.getTime();
  return blockedRanges.some(b => {
    const start = new Date(b.start + 'T00:00:00').getTime();
    const end   = new Date(b.end   + 'T00:00:00').getTime();
    return d >= start && d < end; // end es exclusivo (checkout day)
  });
}
