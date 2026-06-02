import { useState, useCallback } from 'react';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { PropertyDetail } from './pages/PropertyDetail';
import { Checkout } from './pages/Checkout';

export function App() {
  const [route, setRoute] = useState({ name: "home" });
  const [search, setSearch] = useState(null);

  const navigate = useCallback((next, hash) => {
    setRoute(next);
    if (next.name === "home" && hash) {
      requestAnimationFrame(() => setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 80));
    } else if (!hash) {
      window.scrollTo({ top: 0 });
    }
  }, []);

  const transparentTop = route.name === "home";

  return (
    <>
      <Nav navigate={navigate} route={route} transparentTop={transparentTop} />
      {route.name === "home" && <Home navigate={navigate} search={search} />}
      {route.name === "property" && <PropertyDetail id={route.id} navigate={navigate} />}
      {route.name === "checkout" && <Checkout id={route.id} booking={route.booking} navigate={navigate} />}
      <Footer navigate={navigate} />
    </>
  );
}
