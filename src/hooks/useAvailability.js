import { useState, useEffect } from 'react';

// Una sola petición por propiedad durante la visita (la API ya cachea 1 h en Vercel)
const cache = new Map();

function fetchAvailability(propertyId) {
  if (!cache.has(propertyId)) {
    const p = fetch(`/api/availability?property=${encodeURIComponent(propertyId)}`)
      .then(r => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .then(data => ({ blockedRanges: data.blockedRanges || [], error: null }))
      .catch(err => {
        // En desarrollo local sin `vercel dev` la API no existe; o la propiedad aún no tiene iCal
        console.warn('[useAvailability]', propertyId, err.message);
        cache.delete(propertyId); // reintentar en la próxima visita
        return { blockedRanges: [], error: err.message };
      });
    cache.set(propertyId, p);
  }
  return cache.get(propertyId);
}

/**
 * Fechas bloqueadas de un alojamiento, sincronizadas con el calendario de Airbnb (iCal).
 * @param {string|null} propertyId
 * @returns {{ blockedRanges: Array, loading: boolean, error: string|null }}
 */
export function useAvailability(propertyId) {
  const [state, setState] = useState({ blockedRanges: [], loading: !!propertyId, error: null });

  useEffect(() => {
    if (!propertyId) { setState({ blockedRanges: [], loading: false, error: null }); return; }
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: null }));
    fetchAvailability(propertyId).then(res => {
      if (!cancelled) setState({ ...res, loading: false });
    });
    return () => { cancelled = true; };
  }, [propertyId]);

  return state;
}

/**
 * Disponibilidad de varios alojamientos a la vez (para filtrar resultados de búsqueda).
 * Solo consulta cuando `enabled` es true.
 * @returns {{ map: Object<string, {blockedRanges, error}>, loading: boolean }}
 */
export function useAvailabilityMap(ids, enabled) {
  const [state, setState] = useState({ map: {}, loading: false });
  const key = ids.join(",");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setState(s => ({ ...s, loading: true }));
    Promise.all(ids.map(id => fetchAvailability(id).then(res => [id, res]))).then(entries => {
      if (!cancelled) setState({ map: Object.fromEntries(entries), loading: false });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return state;
}

const dayStart = (s) => new Date(s + 'T00:00:00').getTime();

/**
 * ¿La noche que empieza en `date` está reservada?
 * @param {Date} date
 * @param {Array} blockedRanges  [{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }] (end exclusivo = día de salida)
 */
export function isDateBlocked(date, blockedRanges) {
  const d = date.getTime();
  return blockedRanges.some(b => d >= dayStart(b.start) && d < dayStart(b.end));
}

/** ¿Están libres todas las noches entre `start` (incl.) y `end` (excl.)? */
export function isRangeAvailable(start, end, blockedRanges) {
  const s = start.getTime(), e = end.getTime();
  return !blockedRanges.some(b => dayStart(b.start) < e && dayStart(b.end) > s);
}

/**
 * Primer día reservado después de `start`: es la última fecha de salida posible
 * (se puede salir el mismo día que entra otro huésped).
 */
export function firstBlockedAfter(start, blockedRanges) {
  const s = start.getTime();
  let min = null;
  for (const b of blockedRanges) {
    const t = dayStart(b.start);
    if (t > s && (min === null || t < min)) min = t;
  }
  return min === null ? null : new Date(min);
}
