import { useEffect } from 'react';
import { Icon } from '../icons/Icon';
import { CONTACT, waLink } from '../data/properties';

const VIGENCIA = "21 de octubre de 2026";

function H({ children }) {
  return <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 34, marginBottom: 10 }}>{children}</h2>;
}

/* Política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013,
   compilado en el Decreto 1074 de 2015). Revisar con un asesor legal antes de publicar cambios. */
export function Privacy({ navigate }) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const canales = [
    `WhatsApp ${CONTACT.whatsappDisplay}`,
    CONTACT.email && `correo ${CONTACT.email}`,
    `Instagram @${CONTACT.instagram}`,
  ].filter(Boolean);

  return (
    <main style={{ paddingTop: 78, background: "var(--paper)" }}>
      <article className="wrap-tight legal" style={{ maxWidth: 780, paddingTop: 34, paddingBottom: 90 }}>
        <button onClick={() => navigate({ name: "home" })} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, color: "var(--ink-2)", fontWeight: 500, marginBottom: 18 }}>
          <Icon name="arrowL" size={16} /> Volver al inicio
        </button>
        <span className="eyebrow">Legal</span>
        <h1 style={{ fontSize: "clamp(28px,3.6vw,40px)", fontWeight: 700, marginTop: 10 }}>Política de tratamiento de datos personales</h1>
        <p style={{ color: "var(--muted)", marginTop: 10 }}>Vigente desde el {VIGENCIA}.</p>

        <H>1. Responsable del tratamiento</H>
        <p>
          INNOVARE JM{CONTACT.nit ? ` (NIT ${CONTACT.nit})` : ""}, empresa colombiana que administra alojamientos turísticos
          en Cartagena, Santa Marta y Darién, es responsable del tratamiento de los datos personales que recibe a través
          de este sitio web. Canales de contacto: {canales.join(" · ")}.
        </p>

        <H>2. Datos que recolectamos</H>
        <ul>
          <li>Datos de contacto que nos entregas al solicitar una reserva o cotización: nombre, teléfono o WhatsApp y, si lo indicas, correo electrónico.</li>
          <li>Detalles de tu solicitud: alojamiento, fechas y número de huéspedes.</li>
          <li>Datos de navegación anónimos o seudónimos (páginas visitadas, dispositivo) cuando el sitio usa herramientas de analítica.</li>
        </ul>
        <p>No solicitamos datos sensibles ni datos de tarjetas de pago en este sitio.</p>

        <H>3. Finalidades</H>
        <ul>
          <li>Responder tus solicitudes de reserva y cotización, y confirmar disponibilidad y precios.</li>
          <li>Comunicarnos contigo por WhatsApp, teléfono o correo sobre tu reserva, el pago y los detalles de tu estancia.</li>
          <li>Cumplir las obligaciones legales del sector turístico, como el registro de huéspedes.</li>
          <li>Mejorar el sitio web a partir de estadísticas de uso.</li>
        </ul>

        <H>4. Tus derechos</H>
        <p>Como titular de los datos puedes, en cualquier momento y de forma gratuita:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización que nos diste.</li>
          <li>Ser informado sobre el uso que hemos dado a tus datos.</li>
          <li>Revocar la autorización y/o pedir que eliminemos tus datos, cuando no exista un deber legal o contractual de conservarlos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
        </ul>

        <H>5. Cómo ejercer tus derechos</H>
        <p>
          Escríbenos por cualquiera de los canales indicados arriba con tu nombre, tu solicitud y un medio de respuesta.
          Atenderemos las consultas en un plazo máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15)
          días hábiles, prorrogables en los términos de la Ley 1581 de 2012.
        </p>

        <H>6. Con quién compartimos tus datos</H>
        <p>
          No vendemos ni cedemos tus datos. Los compartimos solo con los proveedores necesarios para prestar el servicio
          (por ejemplo, WhatsApp como canal de comunicación y el proveedor de alojamiento web del sitio), y con autoridades
          cuando la ley lo exija.
        </p>

        <H>7. Conservación y seguridad</H>
        <p>
          Conservamos tus datos durante el tiempo necesario para las finalidades descritas y para cumplir obligaciones
          legales, y aplicamos medidas razonables para protegerlos contra acceso no autorizado.
        </p>

        <H>8. Autorización</H>
        <p>
          Al enviar una solicitud desde este sitio y marcar la casilla de aceptación, autorizas a INNOVARE JM a tratar tus
          datos según esta política. Cualquier cambio sustancial se publicará en esta página.
        </p>

        <a className="btn btn-wa" style={{ marginTop: 34 }} href={waLink("Hola INNOVARE JM, quiero hacer una consulta sobre mis datos personales.")} target="_blank" rel="noopener noreferrer">
          <Icon name="wa" size={18} /> Escribir sobre mis datos
        </a>
      </article>
    </main>
  );
}

export function NotFound({ navigate }) {
  return (
    <main style={{ paddingTop: 78, minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center" }}>
      <div className="wrap-tight" style={{ paddingBlock: 80 }}>
        <span className="eyebrow">Error 404</span>
        <h1 style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 700, marginTop: 12 }}>
          Esta página se fue <span className="serif-it">a la playa</span>
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 14, fontSize: 16 }}>No encontramos lo que buscas. Puede que el enlace haya cambiado.</p>
        <button className="btn btn-primary" style={{ marginTop: 28 }} onClick={() => navigate({ name: "home" }, "#listado")}>
          Ver alojamientos
        </button>
      </div>
    </main>
  );
}
