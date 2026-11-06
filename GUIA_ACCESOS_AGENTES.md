# 🔐 ACCESOS Y GUÍA TÉCNICA RÁPIDA — INNOVARE JM WEB (VERCEL)

Esta web es la plataforma pública de reservas directas de **INNOVARE JM S.A.S.**, gestionada por **5D DIGITAL AGENCY**.

---

## 🚀 Despliegue en Vercel & Repositorio

* **URL Producción:** [https://www.innovarejm.com](https://www.innovarejm.com)
* **URL Vercel Staging:** [https://innovarejm-web.vercel.app](https://innovarejm-web.vercel.app)
* **GitHub Repo:** [https://github.com/innovarejm/innovarejm-web.git](https://github.com/innovarejm/innovarejm-web.git)
* **Rama Principal:** `main`
* **Despliegue Automático:** Cualquier `git push origin main` compila con Vite y se publica en producción en Vercel en ~40 segundos.
* **Comandos:**
  ```bash
  npm run build    # Verificar antes de subir
  git add .
  git commit -m "feat: actualización"
  git push origin main
  ```

---

## 📊 Variables de Entorno en Vercel

Configuradas en el panel de Vercel (**Settings -> Environment Variables**):
* `VITE_META_PIXEL_ID`: `1070478956041972`
* `SITE_URL`: `https://www.innovarejm.com`

---

## 🔗 Ecosistema Conectado

* **CRM Interno (VPS 5D):** [https://crm.5dagency.pro](https://crm.5dagency.pro) (Admin: `juanpablobtc17@gmail.com`)
* **Base de Datos (Supabase):** Proyecto `innovare-jm-crm` (`wrdoxemfrgpagkkrfkzt.supabase.co`)
* **Línea WhatsApp Oficial:** `+57 300 471 0171` (Melisa / Instancia Evolution API `InnovareJM`)
* **Página de Vinculación QR WhatsApp:** [https://www.innovarejm.com/vincular.html](https://www.innovarejm.com/vincular.html)

Para la guía detallada completa de toda la infraestructura, consulta:
`5D DIGITAL AGENCY/CLIENTES/innovarejm/GUIA_ACCESOS_Y_SISTEMAS_AGENTES.md`
