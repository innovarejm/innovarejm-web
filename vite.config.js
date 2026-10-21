import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { PROPERTIES, DESTINOS, CONTACT } from './src/data/properties.js'

/*
 * SEO: después del build escribe una página HTML por alojamiento (y /privacidad) con su
 * título, descripción, imagen para compartir y datos estructurados, más sitemap.xml y robots.txt.
 * La app es la misma; solo cambia el <head>, que es lo que leen Google y WhatsApp/Facebook.
 */
function seoPages() {
  let outDir
  return {
    name: 'innovare-seo-pages',
    apply: 'build',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir) },
    closeBundle() {
      // En Vercel se usa el dominio de producción automáticamente
      const site = (process.env.SITE_URL
        || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
      ).replace(/\/$/, '')
      const abs = (p) => site + p
      const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
      const base = readFileSync(path.join(outDir, 'index.html'), 'utf8')

      const render = ({ url, title, description, image, jsonld }) => {
        let html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${esc(abs(url))}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
          .replace(/(<meta property="og:image" content=")[^"]*/, `$1${esc(abs(image))}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${esc(abs(url))}`)
        if (jsonld) {
          const json = JSON.stringify(jsonld).replace(/</g, '\\u003c')
          html = html.replace('</head>', `  <script type="application/ld+json">${json}</script>\n  </head>`)
        }
        return html
      }
      const write = (file, content) => {
        const full = path.join(outDir, file)
        mkdirSync(path.dirname(full), { recursive: true })
        writeFileSync(full, content)
      }

      // Inicio
      write('index.html', render({
        url: '/',
        title: 'INNOVARE JM · Apartamentos frente al mar y fincas vacacionales',
        description: 'Apartamentos amoblados con vista al mar en Cartagena y Santa Marta, y finca para grupos en el Lago Calima. Reserva directo con INNOVARE JM.',
        image: '/images/og-home.jpg',
        jsonld: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'INNOVARE JM',
          url: abs('/'),
          logo: abs('/brand/logo-square.jpg'),
          sameAs: [CONTACT.instagramUrl],
          contactPoint: { '@type': 'ContactPoint', telephone: '+' + CONTACT.whatsapp, contactType: 'reservations', availableLanguage: ['es'] },
        },
      }))

      // Un HTML por alojamiento: /alojamientos/<id> (cleanUrls en vercel.json)
      for (const p of PROPERTIES) {
        const url = `/alojamientos/${p.id}`
        write(`alojamientos/${p.id}.html`, render({
          url,
          title: `${p.nombre} · ${p.sector}, ${p.ciudad} | INNOVARE JM`,
          description: `${p.tagline}. ${p.hab} habitaciones, ${p.banos} baños, hasta ${p.huespedes} huéspedes. Reserva directo con INNOVARE JM.`,
          image: path.posix.join(path.posix.dirname(p.galeria[0]), 'og.jpg'),
          jsonld: {
            '@context': 'https://schema.org',
            '@type': 'VacationRental',
            name: p.nombre,
            identifier: p.id,
            description: p.descripcion,
            url: abs(url),
            image: p.galeria.slice(0, 8).map(abs),
            latitude: p.geo[0],
            longitude: p.geo[1],
            address: {
              '@type': 'PostalAddress',
              addressLocality: p.ciudad,
              addressRegion: DESTINOS[p.ciudad]?.region,
              addressCountry: 'CO',
            },
            containsPlace: {
              '@type': 'Accommodation',
              additionalType: 'EntirePlace',
              numberOfBedrooms: p.hab,
              numberOfBathroomsTotal: p.banos,
              occupancy: { '@type': 'QuantitativeValue', value: p.huespedes },
            },
          },
        }))
      }

      write('privacidad.html', render({
        url: '/privacidad',
        title: 'Política de tratamiento de datos | INNOVARE JM',
        description: 'Cómo INNOVARE JM trata los datos personales de quienes solicitan una reserva (Ley 1581 de 2012).',
        image: '/images/og-home.jpg',
      }))

      // robots.txt + sitemap.xml (el sitemap necesita URLs absolutas)
      const urls = ['/', ...PROPERTIES.map(p => `/alojamientos/${p.id}`), '/privacidad']
      if (site) {
        write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${abs(u)}</loc></url>`).join('\n')}\n</urlset>\n`)
      }
      write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /reservar/\n${site ? `Sitemap: ${abs('/sitemap.xml')}\n` : ''}`)
      console.log(`[seo] ${urls.length} páginas${site ? ` · sitemap con ${site}` : ' · sin SITE_URL: sitemap omitido'}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), seoPages()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
