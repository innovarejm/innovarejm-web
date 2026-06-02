export const AMENIDADES = {
  wifi:     { icon: "wifi",     label: "Wi-Fi de alta velocidad" },
  ac:       { icon: "snow",     label: "Aire acondicionado" },
  pool:     { icon: "pool",     label: "Piscina" },
  parking:  { icon: "car",      label: "Parqueadero privado" },
  kitchen:  { icon: "kitchen",  label: "Cocina totalmente equipada" },
  sea:      { icon: "sea",      label: "Vista directa al mar" },
  elevator: { icon: "elevator", label: "Ascensor" },
  tv:       { icon: "tv",       label: "Smart TV" },
  coffee:   { icon: "coffee",   label: "Estación de café" },
};

export const PROPERTIES = [
  {
    id: "laguito-1601",
    nombre: "Laguito Skyline 1601",
    tagline: "Penthouse frente al mar en el corazón de El Laguito",
    ciudad: "Cartagena", sector: "El Laguito", piso: 16,
    lat: 0.18, lng: 0.32,
    precio: 520000, aseo: 90000, servicioPct: 0.10,
    hab: 2, banos: 2, huespedes: 6, rating: 4.96, resenas: 38,
    destacado: true,
    amenities: ["sea","pool","wifi","ac","parking","kitchen","elevator","tv"],
    descripcion: "Despierta con el azul del Caribe enmarcado en ventanales de piso a techo. Este apartamento en el piso 16 combina líneas limpias, materiales nobles y una terraza que se funde con el horizonte. Ideal para parejas o familias que buscan calma y vistas que no se olvidan.",
    galeria: [
      "Sala con vista al mar", "Terraza · atardecer", "Habitación principal",
      "Cocina equipada", "Baño en mármol", "Piscina del edificio",
    ],
    highlights: [
      { icon: "sea", t: "Vista panorámica", d: "180° al mar Caribe desde el piso 16." },
      { icon: "key", t: "Check-in autónomo", d: "Entra a tu ritmo con acceso digital." },
      { icon: "shield", t: "Edificio seguro", d: "Portería y vigilancia 24/7." },
    ],
  },
  {
    id: "laguito-1604",
    nombre: "Laguito Horizonte 1604",
    tagline: "Suite premium para escapadas con el mar de fondo",
    ciudad: "Cartagena", sector: "El Laguito", piso: 16,
    lat: 0.22, lng: 0.30,
    precio: 390000, aseo: 70000, servicioPct: 0.10,
    hab: 1, banos: 1, huespedes: 3, rating: 4.91, resenas: 24,
    destacado: false,
    amenities: ["sea","pool","wifi","ac","kitchen","elevator","coffee"],
    descripcion: "Una suite luminosa y serena, pensada para desconectar. Espacios abiertos, cama king y un rincón de café frente a la ventana donde el mar es el protagonista. Perfecta para una escapada en pareja.",
    galeria: [
      "Suite con vista al mar", "Rincón de café", "Cama king",
      "Baño moderno", "Balcón", "Lobby del edificio",
    ],
    highlights: [
      { icon: "coffee", t: "Mañanas lentas", d: "Estación de café frente al mar." },
      { icon: "sparkle", t: "Diseño minimalista", d: "Cada objeto tiene su razón de ser." },
      { icon: "key", t: "Llegada flexible", d: "Acceso sencillo a cualquier hora." },
    ],
  },
  {
    id: "santamarta-bahia",
    nombre: "Bahía Santa Marta",
    tagline: "Refugio luminoso entre la sierra y el mar",
    ciudad: "Santa Marta", sector: "Bello Horizonte", piso: 12,
    lat: 0.70, lng: 0.78,
    precio: 440000, aseo: 80000, servicioPct: 0.10,
    hab: 2, banos: 2, huespedes: 5, rating: 4.89, resenas: 19,
    destacado: false,
    amenities: ["sea","pool","wifi","ac","parking","kitchen","tv"],
    descripcion: "Donde la Sierra Nevada se asoma al Caribe. Un apartamento amplio y fresco, con brisa marina y atardeceres dorados. A pasos de la playa y con todo lo necesario para sentirte en casa.",
    galeria: [
      "Sala frente al mar", "Comedor", "Habitación principal",
      "Segunda habitación", "Cocina", "Piscina con vista",
    ],
    highlights: [
      { icon: "sea", t: "Mar y sierra", d: "Paisaje único del Caribe colombiano." },
      { icon: "pool", t: "Piscina infinita", d: "Con vista abierta a la bahía." },
      { icon: "car", t: "Parqueadero", d: "Espacio privado incluido." },
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
