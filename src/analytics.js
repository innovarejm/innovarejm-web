/* Analytics for GA4 (optional) and the INNOVARE JM Meta Pixel. */
const GA_ID = import.meta.env.VITE_GA_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || "1070478956041972";

let analyticsInitialized = false;

export function initAnalytics() {
  if (analyticsInitialized) return;
  analyticsInitialized = true;

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

export function trackPageView() {
  track("page_view", {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
  });
}
