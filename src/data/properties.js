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
};

export const PROPERTIES = [
  {
    id: "bocagrande-1601",
    nombre: "Apartamento Vacacional Cartagena 1",
    tagline: "Amplio apartamento frente al Caribe en el corazón de Bocagrande",
    ciudad: "Cartagena", sector: "Bocagrande", piso: 16,
    lat: 0.18, lng: 0.32,
    precio: 520000, aseo: 90000, servicioPct: 0.10,
    hab: 3, banos: 2, huespedes: 10, rating: 4.96, resenas: 38,
    destacado: true,
    amenities: ["sea", "ac", "kitchen", "elevator", "wifi", "tv", "beach", "market"],
    descripcion: "Despierta con el Caribe enmarcado en ventanales de piso a techo. Este amplio apartamento en el piso 16 tiene capacidad para 10 personas y está totalmente equipado para que llegues con tu maleta y nada más. Cocina integral completa, aire acondicionado en sala y todas las habitaciones, y la playa, tiendas, droguería y minimarket a pasos de la puerta.",
    galeria: [
      "/images/cartagena-1/01.jpg",
      "/images/cartagena-1/02.jpg",
      "/images/cartagena-1/03.jpg",
      "/images/cartagena-1/04.jpg",
      "/images/cartagena-1/05.jpg",
      "/images/cartagena-1/06.jpg",
      "/images/cartagena-1/07.jpg",
      "/images/cartagena-1/08.jpg",
    ],
    highlights: [
      { icon: "sea",      t: "Vista panorámica al mar",  d: "180° al mar Caribe desde el piso 16 de Bocagrande." },
      { icon: "users",    t: "Hasta 10 personas",         d: "Espacio amplio ideal para familias y grupos grandes." },
      { icon: "kitchen",  t: "Cocina integral equipada",  d: "Todo lo que necesitas para cocinar como en casa." },
    ],
  },
  {
    id: "bocagrande-1604",
    nombre: "Apartamento Vacacional Cartagena 2",
    tagline: "Suite premium con vista al mar para escapadas en Bocagrande",
    ciudad: "Cartagena", sector: "Bocagrande", piso: 16,
    lat: 0.22, lng: 0.30,
    precio: 420000, aseo: 75000, servicioPct: 0.10,
    hab: 3, banos: 2, huespedes: 10, rating: 4.91, resenas: 24,
    destacado: false,
    amenities: ["sea", "ac", "kitchen", "elevator", "wifi", "tv", "beach", "market"],
    descripcion: "El mismo edificio frente al Caribe, otro ángulo del paraíso. Piso 16 con vista directa al mar, cocina integral completamente equipada y aire acondicionado en todos los ambientes. A pasos de la playa de Bocagrande, con tiendas, droguerías y todo lo necesario a la vuelta de la esquina.",
    galeria: [
      "/images/cartagena-2/01.jpg",
      "/images/cartagena-2/02.jpg",
      "/images/cartagena-2/03.jpg",
      "/images/cartagena-2/04.jpg",
      "/images/cartagena-2/05.jpg",
      "/images/cartagena-2/06.jpg",
      "/images/cartagena-2/07.jpg",
      "/images/cartagena-2/08.jpg",
    ],
    highlights: [
      { icon: "sea",     t: "Vista directa al Caribe",   d: "El mar como telón de fondo desde el piso 16." },
      { icon: "snow",    t: "A/C en todos los ambientes", d: "Sala y habitaciones siempre fresquitas." },
      { icon: "key",     t: "Check-in autónomo",          d: "Entra a tu ritmo con acceso digital." },
    ],
  },
  {
    id: "rodadero-901",
    nombre: "Apartamento Vacacional Santa Marta",
    tagline: "Refugio frente al mar en el Rodadero de Santa Marta",
    ciudad: "Santa Marta", sector: "Rodadero", piso: 9,
    lat: 0.70, lng: 0.78,
    precio: 380000, aseo: 70000, servicioPct: 0.10,
    hab: 2, banos: 2, huespedes: 8, rating: 4.89, resenas: 19,
    destacado: false,
    amenities: ["sea", "ac", "kitchen", "elevator", "wifi", "tv", "beach", "market"],
    descripcion: "En el Rodadero, donde el Caribe está siempre presente. Apartamento en el piso 9 con vista al mar, capacidad para 8 personas y todo lo necesario para sentirte en casa. Playa, supermercados y droguerías a pocos minutos. La combinación perfecta de comodidad y ubicación en una de las zonas más animadas de Santa Marta.",
    galeria: [
      "/images/santamarta/01.jpg",
      "/images/santamarta/02.jpg",
      "/images/santamarta/03.jpg",
      "/images/santamarta/04.jpg",
      "/images/santamarta/05.jpg",
      "/images/santamarta/06.jpg",
      "/images/santamarta/07.jpg",
      "/images/santamarta/08.jpg",
    ],
    highlights: [
      { icon: "sea",    t: "Vista al mar Caribe",        d: "Piso 9 con el horizonte azul siempre a la vista." },
      { icon: "beach",  t: "Playa a pasos",              d: "El Rodadero, una de las playas más populares del Caribe colombiano." },
      { icon: "users",  t: "Hasta 8 personas",           d: "Perfecto para grupos familiares y amigos." },
    ],
  },
];

export const CONTACT = {
  whatsapp: "573004710171",
  whatsappDisplay: "+57 300 471 0171",
  instagram: "innovarejmsas",
  instagramUrl: "https://instagram.com/innovarejmsas",
};

export function waLink(text) {
  return "https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(text);
}
