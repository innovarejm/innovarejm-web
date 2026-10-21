import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { FloatingWA } from './components/FloatingWA';
import { Home } from './pages/Home';
import { parseLocation, routeToUrl } from './router';
import { findProperty } from './data/properties';
import { initAnalytics, trackPageView } from './analytics';

const PropertyDetail = lazy(() => import('./pages/PropertyDetail').then(m => ({ default: m.PropertyDetail })));
const Checkout       = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Privacy        = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));
const NotFound       = lazy(() => import('./pages/Privacy').then(m => ({ default: m.NotFound })));

const SITE = "INNOVARE JM";
const DEFAULT_TITLE = document.title;
const DEFAULT_DESC = document.querySelector('meta[name="description"]')?.content || "";

function pageMeta(route) {
  const p = route.id ? findProperty(route.id) : null;
  if (route.name === "property" && p) return [`${p.nombre} · ${p.sector}, ${p.ciudad} | ${SITE}`, `${p.tagline}. ${p.hab} habitaciones, hasta ${p.huespedes} huéspedes. Reserva directo con ${SITE}.`];
  if (route.name === "checkout" && p) return [`Reservar ${p.nombre} | ${SITE}`, DEFAULT_DESC];
  if (route.name === "privacy") return [`Política de tratamiento de datos | ${SITE}`, DEFAULT_DESC];
  if (route.name === "notfound" || (route.id && !p)) return [`Página no encontrada | ${SITE}`, DEFAULT_DESC];
  return [DEFAULT_TITLE, DEFAULT_DESC];
}

function scrollToHash(hash) {
  // Espera a que la página pinte (las páginas se cargan bajo demanda)
  requestAnimationFrame(() => setTimeout(() => {
    document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  }, 80));
}

export function App() {
  const [route, setRoute] = useState(() => parseLocation());

  useEffect(() => { initAnalytics(); }, []);

  // Botones atrás/adelante del navegador: restaura la página y su posición de scroll
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    if (window.location.hash) scrollToHash(window.location.hash);
    const onPop = (e) => {
      setRoute(parseLocation());
      const y = e.state?.y ?? 0;
      requestAnimationFrame(() => setTimeout(() => window.scrollTo({ top: y, behavior: "instant" }), 60));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Título y descripción por página
  useEffect(() => {
    const [title, desc] = pageMeta(route);
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", desc);
    trackPageView();
  }, [route]);

  const navigate = useCallback((next, hash) => {
    const url = routeToUrl(next) + (hash || "");
    // Guarda el scroll de la página actual para restaurarlo al volver atrás
    window.history.replaceState({ ...window.history.state, y: window.scrollY }, "");
    if (url !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.pushState({ y: 0 }, "", url);
    }
    setRoute(parseLocation());
    if (hash) scrollToHash(hash);
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const transparentTop = route.name === "home";

  return (
    <>
      <Nav navigate={navigate} route={route} transparentTop={transparentTop} />
      {route.name === "home" && <Home navigate={navigate} route={route} />}
      <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
        {route.name === "property" && <PropertyDetail key={route.id} id={route.id} booking={route.booking} navigate={navigate} />}
        {route.name === "checkout" && <Checkout id={route.id} booking={route.booking} navigate={navigate} />}
        {route.name === "privacy" && <Privacy navigate={navigate} />}
        {route.name === "notfound" && <NotFound navigate={navigate} />}
      </Suspense>
      <Footer navigate={navigate} />
      <FloatingWA delayOnScroll={route.name === "home"} />
    </>
  );
}
