/**
 * Vercel Serverless Function — /api/lead
 * Recibe el lead del checkout, lo firma con HMAC y lo reenvía al CRM de 5D.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 *   LEADS_WEBHOOK_SECRET  = mismo secreto que el CRM (obligatorio)
 *   CRM_WEBHOOK_URL       = URL del webhook del CRM
 *                           (por defecto https://crm.5dagency.pro/api/webhooks/leads)
 *
 * El secreto nunca llega al navegador: la firma se calcula aquí, en el servidor.
 */

import crypto from "node:crypto";

const CRM_WEBHOOK_URL =
  process.env.CRM_WEBHOOK_URL || "https://crm.5dagency.pro/api/webhooks/leads/";
const SECRET = process.env.LEADS_WEBHOOK_SECRET;

// Solo se reenvían los campos que el webhook del CRM acepta.
const ALLOWED_FIELDS = [
  "first_name", "last_name", "email", "phone",
  "source_channel", "event_id",
  "consent_given", "consent_at", "consent_source",
  "property", "city", "check_in", "check_out", "nights",
  "adults", "children", "infants", "estimated_value",
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "fbc", "fbp", "metadata",
];

function pickFields(body) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    const value = body[key];
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }
  if (!SECRET) {
    // La web sigue funcionando: el lead se envía por WhatsApp igual.
    return res.status(503).json({ error: "Captura de leads no configurada" });
  }

  // Vercel suele entregar el JSON ya parseado; se cubren string y Buffer por si cambia el runtime.
  let body = req.body;
  if (Buffer.isBuffer(body)) body = body.toString("utf8");
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Cuerpo inválido" });
  }

  const payload = pickFields(body);
  payload.source_channel = "web";

  if (!payload.first_name || !payload.phone) {
    return res.status(400).json({ error: "Faltan nombre o teléfono" });
  }

  const raw = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", SECRET).update(raw).digest("hex");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-signature": `sha256=${signature}`,
      },
      body: raw,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("[lead] CRM respondió", response.status);
      return res.status(502).json({ forwarded: false, status: response.status });
    }
    return res.status(202).json({ forwarded: true });
  } catch (err) {
    console.error("[lead]", err?.message || "error");
    return res.status(502).json({ forwarded: false });
  }
}
