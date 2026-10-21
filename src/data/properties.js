export const AMENIDADES = {
  wifi:     { icon: "wifi",     label: "Wi-Fi de alta velocidad" },
  ac:       { icon: "snow",     label: "Aire acondicionado" },
  pool:     { icon: "pool",     label: "Piscina" },
  parking:  { icon: "car",      label: "Parqueadero privado" },
  kitchen:  { icon: "kitchen",  label: "Cocina integral equipada" },
  sea:      { icon: "sea",      label: "Vista directa al mar" },
  elevator: { icon: "elevator", label: "Ascensor" },
  tv:       { icon: "tv",       label: "Smart TV" },
  coffee:   { icon: "coffee",   label: "Estación de café" },
  beach:    { icon: "sea",      label: "Acceso fácil a la playa" },
  market:   { icon: "kitchen",  label: "Tiendas y servicios cerca" },
  jacuzzi:  { icon: "jacuzzi",  label: "Jacuzzi" },
  bbq:      { icon: "bbq",      label: "Zona BBQ y asador" },
  cinema:   { icon: "cinema",   label: "Sala de cine" },
  gym:      { icon: "gym",      label: "Gimnasio" },
  billiards:{ icon: "billiards",label: "Mesa de billar" },
  kids:     { icon: "kids",     label: "Parque infantil" },
  sports:   { icon: "ball",     label: "Cancha de fútbol y baloncesto" },
  green:    { icon: "tree",     label: "Amplias zonas verdes" },
  washer:   { icon: "washer",   label: "Lavadora" },
  events:   { icon: "music",    label: "Discoteca para eventos (costo adicional)" },
};

// Texto e imagen de cada destino en la sección "Dónde te esperamos"
export const DESTINOS = {
  "Cartagena":   { d: "El Laguito · frente a la bahía",  img: "/images/cartagena-1601/01.jpg", label: "Vista al mar desde Bocagrande" },
  "Santa Marta": { d: "Donde la sierra abraza el mar",   img: "/images/santamarta-901/01.jpg", label: "Bahía de Santa Marta" },
  "Darién":      { d: "Lago Calima · Valle del Cauca",   img: "/images/darien/01.jpg",         label: "Finca junto al Lago Calima" },
};

// "/images/<carpeta>/01.jpg" … "/images/<carpeta>/NN.jpg"
function galeria(carpeta, n) {
  return Array.from({ length: n }, (_, i) => `/images/${carpeta}/${String(i + 1).padStart(2, "0")}.jpg`);
}

/*
 * rating / resenas: tal como aparecen en Airbnb (verificado el 21-oct-2026).
 * geo: ubicación aproximada que publica Airbnb (no es la dirección exacta).
 * rnt: Registro Nacional de Turismo, publicado en cada anuncio de Airbnb.
 */
export const PROPERTIES = [
  {
    id: "bocagrande-1601",
    airbnbId: "965354217729718896",
    rnt: "128519",
    nombre: "Apartamento Vacacional Cartagena 1",
    tagline: "Amplio apartamento frente al Caribe en el corazón de Bocagrande",
    ciudad: "Cartagena", sector: "Bocagrande", piso: 16,
    geo: [10.39617, -75.56325],
    precio: 520000, aseo: 70000,
    hab: 3, banos: 2, huespedes: 10, rating: 4.25, resenas: 16,
    destacado: true,
    amenities: ["sea", "ac", "kitchen", "elevator", "wifi", "tv", "beach", "market"],
    descripcion: "Despierta con el Caribe enmarcado en ventanales de piso a techo. Este amplio apartamento en el piso 16 tiene capacidad para 10 personas y está totalmente equipado para que llegues con tu maleta y nada más. Cocina integral completa, aire acondicionado en sala y todas las habitaciones, y la playa, tiendas, droguería y minimarket a pasos de la puerta.",
    galeria: galeria("cartagena-1601", 10),
    highlights: [
      { icon: "sea",      t: "Vista panorámica al mar",  d: "180° al mar Caribe desde el piso 16 de Bocagrande." },
      { icon: "users",    t: "Hasta 10 personas",         d: "Espacio amplio ideal para familias y grupos grandes." },
      { icon: "kitchen",  t: "Cocina integral equipada",  d: "Todo lo que necesitas para cocinar como en casa." },
    ],
  },
  {
    id: "bocagrande-1604",
    airbnbId: "1201408121076854785",
    rnt: "202566",
    nombre: "Apartamento Vacacional Cartagena 2",
    tagline: "Suite premium con vista al mar para escapadas en Bocagrande",
    ciudad: "Cartagena", sector: "Bocagrande", piso: 16,
    geo: [10.39361, -75.55838],
    precio: 420000, aseo: 70000,
    hab: 3, banos: 2, huespedes: 10, rating: 5, resenas: 1,
    destacado: false,
    amenities: ["sea", "ac", "kitchen", "elevator", "wifi", "tv", "beach", "market"],
    descripcion: "El mismo edificio frente al Caribe, otro ángulo del paraíso. Piso 16 con vista directa al mar, cocina integral completamente equipada y aire acondicionado en todos los ambientes. A pasos de la playa de Bocagrande, con tiendas, droguerías y todo lo necesario a la vuelta de la esquina.",
    galeria: galeria("cartagena-1604", 14),
    highlights: [
      { icon: "sea",     t: "Vista directa al Caribe",   d: "El mar como telón de fondo desde el piso 16." },
      { icon: "snow",    t: "A/C en todos los ambientes", d: "Sala y habitaciones siempre fresquitas." },
      { icon: "key",     t: "Check-in autónomo",          d: "Entra a tu ritmo con acceso digital." },
    ],
  },
  {
    id: "rodadero-901",
    airbnbId: "666579984263350325",
    rnt: "85800",
    nombre: "Apartamento Vacacional Santa Marta",
    tagline: "Refugio frente al mar en el Rodadero de Santa Marta",
    ciudad: "Santa Marta", sector: "Rodadero", piso: 9,
    geo: [11.20789, -74.22759],
    precio: 380000, aseo: 70000,
    hab: 2, banos: 2, huespedes: 8, rating: 4.67, resenas: 12,
    destacado: false,
    amenities: ["sea", "ac", "kitchen", "elevator", "wifi", "tv", "beach", "market"],
    descripcion: "En el Rodadero, donde el Caribe está siempre presente. Apartamento en el piso 9 con vista al mar, capacidad para 8 personas y todo lo necesario para sentirte en casa. Playa, supermercados y droguerías a pocos minutos. La combinación perfecta de comodidad y ubicación en una de las zonas más animadas de Santa Marta.",
    galeria: galeria("santamarta-901", 9),
    highlights: [
      { icon: "sea",    t: "Vista al mar Caribe",        d: "Piso 9 con el horizonte azul siempre a la vista." },
      { icon: "beach",  t: "Playa a pasos",              d: "El Rodadero, una de las playas más populares del Caribe colombiano." },
      { icon: "users",  t: "Hasta 8 personas",           d: "Perfecto para grupos familiares y amigos." },
    ],
  },
  {
    id: "darien-villa-sonada",
    airbnbId: "1663228458512728916",
    rnt: "278529",
    nombre: "Finca Villa Soñada",
    tagline: "Finca para grupos grandes a minutos del Lago Calima",
    ciudad: "Darién", sector: "Lago Calima",
    geo: [3.91812, -76.59564],
    // Sin precio fijo: el valor depende del número de personas y se cotiza por WhatsApp.
    // Cuando haya tarifa, basta con poner aquí el número (ej. 1500000) y se activa la reserva normal.
    precio: null, aseo: null,
    hab: 8, camas: 26, banos: 9, huespedes: 50, rating: null, resenas: 0,
    destacado: false,
    amenities: ["pool", "jacuzzi", "bbq", "cinema", "gym", "billiards", "kids", "sports", "green", "parking", "kitchen", "wifi", "tv", "washer", "events"],
    descripcion: "Una finca espectacular en el paraíso natural de Darién, a solo 10 minutos del pueblo y de la entrada al Lago Calima. Ocho habitaciones con acomodación múltiple para grupos de hasta 50 personas, amplias zonas verdes y un ambiente tranquilo pensado para reuniones familiares, paseos y celebraciones. Piscina con jacuzzi, zona social con asador y cocina adicional junto a la piscina, sala de cine, gimnasio, billar, parque infantil, cancha de fútbol y de baloncesto y parqueadero privado. Cocina totalmente equipada, toallas y cobijas incluidas. Como servicios adicionales ofrecemos discoteca para eventos (cumpleaños, 15 años, artistas) y personal para cocinar.",
    ubicacion: "a 10 minutos del pueblo y de la entrada al Lago Calima.",
    galeria: galeria("darien", 20),
    highlights: [
      { icon: "users",   t: "Hasta 50 personas",     d: "8 habitaciones y 26 camas en acomodación múltiple para grupos grandes." },
      { icon: "pool",    t: "Piscina y jacuzzi",      d: "Zona social con asador y cocina adicional junto a la piscina." },
      { icon: "music",   t: "Lista para celebrar",    d: "Discoteca para eventos y personal de cocina como servicios adicionales." },
    ],
  },
];

export function findProperty(id) {
  return PROPERTIES.find(p => p.id === id) || null;
}

export function airbnbReviewsUrl(p) {
  return `https://www.airbnb.com.co/rooms/${p.airbnbId}/reviews`;
}

export const CONTACT = {
  whatsapp: "573004710171",
  whatsappDisplay: "+57 300 471 0171",
  instagram: "innovarejmsas",
  instagramUrl: "https://instagram.com/innovarejmsas",
  // Para la política de datos. Completar si se quiere mostrar (opcional).
  email: null,
  nit: null,
};

export function waLink(text) {
  return "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(text);
}
