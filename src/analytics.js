/* Analytics for GA4 (optional) and the INNOVARE JM Meta Pixel. */
const GA_ID = import.meta.env.VITE_GA_ID || "G-V98GH9N1H4";
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "1070478956041972";

const ATTR_KEY = "innovare_attribution";
const ATTR_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid"];

let analyticsInitialized = false;

function readCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

/* Guarda la atribución de la primera visita de la sesión (UTM + fbclid).
   Así el lead que llega a /reservar conserva el origen aunque navegue antes de enviar. */
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const stored = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}");
    let changed = false;
    for (const key of ATTR_FIELDS) {
      const value = params.get(key);
      if (value && !stored[key]) { stored[key] = value; changed = true; }
    }
    if (changed) sessionStorage.setItem(ATTR_KEY, JSON.stringify(stored));
  } catch {
    // sessionStorage puede fallar en modo privado; no bloquear la página.
  }
}

/* Devuelve la atribución de la sesión + cookies _fbp/_fbc del píxel. */
export function getAttribution() {
  let stored = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}");
  } catch {
    stored = {};
  }
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc") || (stored.fbclid ? `fb.1.${Date.now()}.${stored.fbclid}` : null);
  return { ...stored, fbp, fbc };
}

/* Advanced matching: mejora el match rate de Meta y el user_data de GA4.
   El píxel del navegador cifra em/ph/fn/ln automáticamente. */
export function setUserData({ email, phone, firstName, lastName } = {}) {
  const digits = (phone || "").replace(/\D/g, "");
  const data = {};
  if (email) data.em = email.trim().toLowerCase();
  if (digits) data.ph = digits;
  if (firstName) data.fn = firstName.trim().toLowerCase();
  if (lastName) data.ln = lastName.trim().toLowerCase();
  if (Object.keys(data).length === 0) return;
  data.country = "co";

  if (window.fbq) window.fbq("init", META_PIXEL_ID, data);

  if (window.gtag) {
    const userData = {};
    if (data.em) userData.email = data.em;
    if (data.ph) userData.phone_number = data.ph;
    if (Object.keys(userData).length) window.gtag("set", "user_data", userData);
  }
}

export function initAnalytics() {
  if (analyticsInitialized) return;
  analyticsInitialized = true;

  captureAttribution();

  // Meta Pixel works independently of GA4. PageView is sent by trackPageView()
  // so SPA route changes are counted once, including the initial route.
  if (META_PIXEL_ID && !window.fbq) {
    const fbq = function (...args) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
      else fbq.queue.push(args);
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    window.fbq("init", META_PIXEL_ID);
  }

  if (GA_ID && !window.gtag) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { send_page_view: false });
  }

  // Capture WhatsApp outbound clicks even when GA4 is not configured.
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href^="https://wa.me/"]');
    if (link) track("whatsapp_click", {
      page_path: window.location.pathname,
      link_text: link.textContent.trim().slice(0, 60),
    });
  }, { capture: true });
}

export function track(name, params = {}) {
  window.gtag?.("event", name, params);

  if (!window.fbq) return;
  if (name === "page_view") window.fbq("track", "PageView", params);
  else if (name === "whatsapp_click") window.fbq("track", "Contact", params);
  else if (name === "view_content") window.fbq("track", "ViewContent", params);
  else if (name === "initiate_checkout") window.fbq("track", "InitiateCheckout", params);
  else window.fbq("trackCustom", name, params);
}

/* Lead real: se dispara cuando la persona envía la solicitud desde el checkout.
   eventId permite deduplicar con un futuro envío server-side (CAPI). */
export function trackLead({ value, currency = "COP", contentName, contentIds, eventId, ...rest } = {}) {
  const params = {
    value,
    currency,
    content_name: contentName,
    content_ids: contentIds,
    ...rest,
  };

  window.gtag?.("event", "generate_lead", params);

  if (window.fbq) {
    window.fbq("track", "Lead", params, eventId ? { eventID: eventId } : undefined);
  }
}

export function trackPageView() {
  track("page_view", {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
  });
}
