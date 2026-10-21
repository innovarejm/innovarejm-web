import { useState, useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { waLink } from '../data/properties';

/* Botón flotante de WhatsApp (en todas las páginas).
   En el detalle (móvil) sube sobre la barra de reserva vía la clase body.mbar-on. */
export function FloatingWA({ message = "Hola INNOVARE JM 👋", delayOnScroll = false }) {
  const [visible, setVisible] = useState(!delayOnScroll);

  useEffect(() => {
    if (!delayOnScroll) { setVisible(true); return; }
    // En móvil (sin botón en el nav) siempre visible; en desktop aparece tras pasar el hero
    const check = () => setVisible(window.innerWidth <= 880 || window.scrollY > window.innerHeight * 0.8);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [delayOnScroll]);

  if (!visible) return null;
  return (
    <a
      href={waLink(message)}
      target="_blank" rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="floating-wa"
    >
      <Icon name="wa" size={26} />
    </a>
  );
}
