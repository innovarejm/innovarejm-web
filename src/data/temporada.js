/*
 * Temporada de fin de año: condiciones y tarifas oficiales.
 *
 * ÚNICO archivo que hay que editar cuando INNOVARE JM entregue sus tarifas (Drive).
 *
 *  - TEMPORADA.confirmado = false  → la landing muestra un aviso de "vista previa" y
 *    todos los valores se presentan como "por confirmar". Pasar a true SOLO cuando
 *    las condiciones y tarifas estén validadas por la clienta.
 *  - TARIFAS[id]: lista de periodos { desde, hasta, precio, minNoches, label }.
 *    `desde` incluido, `hasta` excluido (formato YYYY-MM-DD). Una noche dentro de un
 *    periodo usa ese precio; fuera de todo periodo usa `precio` de properties.js.
 *    Dejar la lista vacía mientras no haya tarifa oficial.
 *
 * El precio que se muestra en la web es SIEMPRE una tarifa de referencia: el valor
 * final lo confirma la asesora por WhatsApp (descuentos, grupo, noches). Así la web
 * y la cotización de WhatsApp no se contradicen.
 */

export const TEMPORADA = {
  slug: "temporada",
  confirmado: false,
  nombre: "Temporada de fin de año 2026",
  titular: "Diciembre y enero frente al mar, con fechas aseguradas",
  intro:
    "La temporada de fin de año es la de mayor demanda en Cartagena, Santa Marta y Calima. " +
    "Este año abrimos las reservas con anticipación para que asegures tus fechas antes de que se agoten.",
  // Fecha límite para apartar con las condiciones de temporada (texto libre).
  cierre: "15 de diciembre de 2026",
  condiciones: [
    // 2 noches: indicado por el usuario el 2026-11-24, pendiente de confirmación de Melisa.
    { icon: "cal",    t: "Estadía mínima",        d: "2 noches para llegadas entre el 15 de diciembre y el 15 de enero." },
    { icon: "shield", t: "Aparta tus fechas",      d: "Con un anticipo de $100.000. El saldo se paga antes del ingreso." },
    { icon: "key",    t: "Reprogramación",         d: "Puedes mover tus fechas una vez, sujeto a disponibilidad. El anticipo no es reembolsable." },
    { icon: "users",  t: "Capacidad exacta",       d: "Cada alojamiento recibe hasta el número de huéspedes indicado, incluidos niños." },
    { icon: "wa",     t: "Precio final por WhatsApp", d: "La web muestra la tarifa de referencia. Tu asesora confirma el valor final según fechas y grupo." },
  ],
  noIncluye: ["Alimentación", "Transporte", "Tours y actividades", "Huéspedes adicionales a la capacidad"],
  // Regla general de estadía mínima para todos los alojamientos (pendiente de confirmar fechas con Melisa).
  // `hasta` excluido. Un periodo de TARIFAS con su propio minNoches tiene prioridad.
  estadiaMinima: { desde: "2026-12-15", hasta: "2027-01-16", minNoches: 2 },
};

export const TARIFAS = {
  "bocagrande-1601": [],
  "bocagrande-1604": [],
  "rodadero-901": [],
  "darien-villa-sonada": [],
};

// Ejemplo de formato (no activo):
// "bocagrande-1601": [
//   { desde: "2026-12-15", hasta: "2027-01-16", precio: 600000, minNoches: 3, label: "temporada alta" },
// ],

const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Periodo de tarifa que aplica a la noche que empieza en `date` (o null). */
export function periodoPara(propertyId, date) {
  const k = dayKey(date);
  return (TARIFAS[propertyId] || []).find((t) => k >= t.desde && k < t.hasta) || null;
}

/** Estadía mínima para una llegada en `start` (1 si no hay regla). */
export function minNochesPara(propertyId, start) {
  if (!start) return 1;
  const propio = periodoPara(propertyId, start)?.minNoches;
  if (propio) return propio;
  const g = TEMPORADA.estadiaMinima;
  const k = dayKey(start);
  return g && k >= g.desde && k < g.hasta ? g.minNoches : 1;
}
