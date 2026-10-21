/*
 * Analítica con Google Analytics 4.
 * Se activa sola al definir VITE_GA_ID (ej. "G-XXXXXXXXXX") en las variables de entorno de Vercel.
 * Sin esa variable no se carga nada.
 *
 * Eventos:
 *   page_view        cada cambio de página
 *   whatsapp_click   cada clic en un enlace de WhatsApp (la conversión principal), con la página de origen
 */
const GA_ID = import.meta.env.VITE_GA_ID;

export function initAnalytics() {
  if (!GA_ID || window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });

  // Un solo listener para todos los botones/enlaces de WhatsApp del sitio
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="https://wa.me/"]');
    if (a) track("whatsapp_click", { page_path: window.location.pathname, link_text: a.textContent.trim().slice(0, 60) });
  }, { capture: true });
}

export function track(name, params = {}) {
  window.gtag?.("event", name, params);
}

export function trackPageView() {
  track("page_view", { page_path: window.location.pathname + window.location.search, page_title: document.title });
}
