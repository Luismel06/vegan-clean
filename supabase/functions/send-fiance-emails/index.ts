/// <reference types="https://deno.land/x/types@v0.1.0/mod.d.ts" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "FROM_PLACEHOLDER@YOUR_DOMAIN.COM";
const APP_WEB_URL = (Deno.env.get("APP_WEB_URL") ?? "").trim().replace(/\/+$/g, "");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
}
if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY env var.");
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

type MailItem = {
  tipo: string;
  nombre: string;
  qty: number;
  modelo?: string;
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtMoneyRD(value: unknown) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "RD$ 0.00";
  return `RD$ ${n.toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(value: unknown) {
  const d = new Date(String(value ?? ""));
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-DO");
}

function normalizeItems(itemsInput: unknown): MailItem[] {
  if (!Array.isArray(itemsInput)) return [];

  const out: MailItem[] = [];
  for (const raw of itemsInput) {
    const it = raw as Record<string, unknown>;
    const qtyCandidate = Number(it.qty ?? it.cantidad ?? 0);
    const qty = Number.isFinite(qtyCandidate) && qtyCandidate > 0 ? qtyCandidate : 1;
    const tipoRaw = String(it.tipo ?? it.type ?? "").trim().toLowerCase();
    const tipo = tipoRaw === "equipo" ? "Equipo" : "Producto";
    const nombre = String(it.nombre ?? it.name ?? "").trim();
    if (!nombre) continue;

    out.push({
      tipo,
      nombre,
      qty,
      modelo: String(it.modelo ?? it.model ?? "").trim() || undefined,
    });
  }
  return out;
}

async function fetchCotItems(cotizacionId: number): Promise<MailItem[]> {
  if (!Number.isFinite(cotizacionId) || cotizacionId <= 0) return [];

  const { data, error } = await sb
    .from("detalle_cotizacion")
    .select(`
      cantidad,
      producto_id,
      equipo_id,
      productos:producto_id ( nombre, modelo ),
      equipos:equipo_id ( nombre, modelo )
    `)
    .eq("cotizacion_id", cotizacionId);

  if (error) {
    console.warn("No se pudieron cargar items de la cotizacion:", error);
    return [];
  }

  const rows = Array.isArray(data) ? data : [];
  return rows.map((r: any) => {
    const isProd = r?.producto_id != null;
    const ref = isProd ? r?.productos : r?.equipos;
    const nombre = String(
      ref?.nombre ?? (isProd ? `Producto #${r?.producto_id}` : `Equipo #${r?.equipo_id}`)
    ).trim();
    const modelo = String(ref?.modelo ?? "").trim();
    const qtyCandidate = Number(r?.cantidad ?? 0);
    const qty = Number.isFinite(qtyCandidate) && qtyCandidate > 0 ? qtyCandidate : 1;

    return {
      tipo: isProd ? "Producto" : "Equipo",
      nombre,
      modelo: modelo || undefined,
      qty,
    };
  });
}

function buildItemsRowsHtml(items: MailItem[]) {
  if (!items.length) {
    return `
      <tr>
        <td colspan="2" style="padding:11px 12px; font-size:13px; color:#587980;">
          Sin items registrados.
        </td>
      </tr>
    `;
  }

  return items
    .map((it) => {
      const nombre = `${escapeHtml(it.nombre)}${it.modelo ? ` - ${escapeHtml(it.modelo)}` : ""}`;
      return `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #e2ecee; font-size:13px;">
            ${escapeHtml(it.tipo)}: ${nombre}
          </td>
          <td style="padding:10px 12px; border-bottom:1px solid #e2ecee; font-size:13px; text-align:right; font-weight:700;">
            ${escapeHtml(it.qty)}
          </td>
        </tr>
      `;
    })
    .join("");
}

function wrapMail({
  title,
  subtitle,
  gradient,
  body,
}: {
  title: string;
  subtitle: string;
  gradient: string;
  body: string;
}) {
  return `
    <!doctype html>
    <html lang="es">
      <body style="margin:0;padding:0;background:#f3f8f9;font-family:Arial,sans-serif;color:#16343a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f8f9;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #d8e8eb;">
                <tr>
                  <td style="background:${gradient};padding:22px 24px;color:#ffffff;">
                    <div style="font-size:22px;font-weight:700;">Vega Clean</div>
                    <div style="font-size:13px;opacity:.95;">${escapeHtml(subtitle)}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px;">
                    <h2 style="margin:0 0 12px;font-size:18px;color:#12353b;">${escapeHtml(title)}</h2>
                    ${body}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 24px;background:#f8fcfc;border-top:1px solid #e5f0f2;font-size:12px;color:#66858b;">
                    &copy; ${new Date().getFullYear()} Vega Clean. Todos los derechos reservados.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildOrderReceivedEmail(payload: any, items: MailItem[]) {
  const cliente = escapeHtml(payload?.cliente_nombre ?? payload?.cliente ?? "Cliente");
  const numeroCaso = escapeHtml(payload?.numero_caso ?? "-");
  const preventaId = escapeHtml(payload?.preventa_id ?? "-");
  const fecha = fmtDate(payload?.fecha ?? new Date().toISOString());
  const trackingUrl = escapeHtml(payload?.tracking_url ?? (APP_WEB_URL ? `${APP_WEB_URL}/servicios` : "#"));
  const nota = String(payload?.nota ?? "").trim();

  const body = `
    <p style="margin:0 0 12px;font-size:16px;">Hola, <strong>${cliente}</strong>.</p>
    <p style="margin:0 0 16px;line-height:1.55;">
      Recibimos tu solicitud correctamente y ya fue tomada por nuestro equipo.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f4fbfc;border:1px solid #d7eef1;border-radius:10px;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-size:12px;color:#4c7178;">Numero de caso</div>
          <div style="font-size:22px;font-weight:700;color:#0a5e68;">${numeroCaso}</div>
          <div style="font-size:12px;color:#4c7178;margin-top:6px;">Solicitud ID: ${preventaId}</div>
          <div style="font-size:12px;color:#4c7178;margin-top:2px;">Fecha: ${escapeHtml(fecha)}</div>
        </td>
      </tr>
    </table>

    <div style="font-size:14px;font-weight:700;margin:0 0 8px;">Items solicitados</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2ecee;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f7fbfc;">
          <th align="left" style="padding:10px 12px;font-size:12px;border-bottom:1px solid #e2ecee;">Item</th>
          <th align="right" style="padding:10px 12px;font-size:12px;border-bottom:1px solid #e2ecee;">Cant.</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsRowsHtml(items)}
      </tbody>
    </table>

    ${
      nota
        ? `<p style="margin:12px 0 0;font-size:13px;color:#4c7178;"><strong>Nota:</strong> ${escapeHtml(nota)}</p>`
        : ""
    }

    <div style="text-align:center;margin:22px 0 8px;">
      <a href="${trackingUrl}" style="display:inline-block;background:#00bcd4;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
        Revisar estado de mi orden
      </a>
    </div>
  `;

  return {
    subject: `Orden recibida - Caso ${String(payload?.numero_caso ?? "-")}`,
    html: wrapMail({
      title: "Tu orden fue recibida",
      subtitle: "Confirmacion de solicitud",
      gradient: "linear-gradient(135deg,#00bcd4,#0097a7)",
      body,
    }),
  };
}

function buildQuoteReadyEmail(payload: any, cot: any, items: MailItem[], actorLine?: string) {
  const cliente = escapeHtml(payload?.cliente_nombre ?? payload?.cliente ?? cot?.cliente ?? "Cliente");
  const numeroCaso = escapeHtml(cot?.numero_caso ?? payload?.numero_caso ?? "-");
  const cotId = escapeHtml(cot?.id ?? payload?.cotizacion_id ?? "-");
  const total = fmtMoneyRD(cot?.total ?? payload?.total ?? 0);
  const fecha = fmtDate(cot?.fecha ?? payload?.fecha ?? new Date().toISOString());
  const cotUrl = escapeHtml(
    payload?.cotizacion_url ??
      (APP_WEB_URL && cot?.id ? `${APP_WEB_URL}/admin/cotizaciones/${cot.id}` : APP_WEB_URL || "#")
  );

  const body = `
    <p style="margin:0 0 12px;font-size:16px;">Hola, <strong>${cliente}</strong>.</p>
    <p style="margin:0 0 16px;line-height:1.55;">
      Tu cotizacion fue realizada y ya fue encargada al almacen para preparacion.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f4fbfc;border:1px solid #d7eef1;border-radius:10px;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-size:12px;color:#4c7178;">Caso</div>
          <div style="font-size:20px;font-weight:700;color:#0a5e68;">${numeroCaso}</div>
          <div style="font-size:12px;color:#4c7178;margin-top:6px;">Cotizacion: #${cotId}</div>
          <div style="font-size:12px;color:#4c7178;margin-top:2px;">Total: ${escapeHtml(total)}</div>
          <div style="font-size:12px;color:#4c7178;margin-top:2px;">Fecha: ${escapeHtml(fecha)}</div>
          ${
            actorLine
              ? `<div style="font-size:12px;color:#4c7178;margin-top:2px;">Gestionado por: ${escapeHtml(actorLine)}</div>`
              : ""
          }
        </td>
      </tr>
    </table>

    <div style="font-size:14px;font-weight:700;margin:0 0 8px;">Resumen de items</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2ecee;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f7fbfc;">
          <th align="left" style="padding:10px 12px;font-size:12px;border-bottom:1px solid #e2ecee;">Item</th>
          <th align="right" style="padding:10px 12px;font-size:12px;border-bottom:1px solid #e2ecee;">Cant.</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsRowsHtml(items)}
      </tbody>
    </table>

    <div style="text-align:center;margin:20px 0 8px;">
      <a href="${cotUrl}" style="display:inline-block;background:#0097a7;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
        Ver cotizacion
      </a>
    </div>
  `;

  return {
    subject: `Cotizacion en almacen - Caso ${String(cot?.numero_caso ?? payload?.numero_caso ?? "-")}`,
    html: wrapMail({
      title: "Tu cotizacion esta en preparacion",
      subtitle: "Cotizacion confirmada y enviada a almacen",
      gradient: "linear-gradient(135deg,#0097a7,#007886)",
      body,
    }),
  };
}

function buildDispatchedEmail(payload: any, cot: any, items: MailItem[], actorLine?: string) {
  const cliente = escapeHtml(payload?.cliente_nombre ?? payload?.cliente ?? cot?.cliente ?? "Cliente");
  const numeroCaso = escapeHtml(cot?.numero_caso ?? payload?.numero_caso ?? "-");
  const fechaDespacho = fmtDate(payload?.despachado_en ?? cot?.despachado_en ?? new Date().toISOString());
  const trackingUrl = escapeHtml(
    payload?.tracking_url ?? (APP_WEB_URL ? `${APP_WEB_URL}/servicios` : "#")
  );

  const body = `
    <p style="margin:0 0 12px;font-size:16px;">Hola, <strong>${cliente}</strong>.</p>
    <p style="margin:0 0 16px;line-height:1.55;">
      Tu pedido fue despachado desde almacen y esta listo para entrega.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f2fbf7;border:1px solid #d4efe4;border-radius:10px;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-size:12px;color:#4c7178;">Numero de caso</div>
          <div style="font-size:20px;font-weight:700;color:#0d6c4b;">${numeroCaso}</div>
          <div style="font-size:12px;color:#4c7178;margin-top:6px;">Despachado en: ${escapeHtml(fechaDespacho)}</div>
          ${
            actorLine
              ? `<div style="font-size:12px;color:#4c7178;margin-top:2px;">Gestionado por: ${escapeHtml(actorLine)}</div>`
              : ""
          }
        </td>
      </tr>
    </table>

    <div style="font-size:14px;font-weight:700;margin:0 0 8px;">Items despachados</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2ecee;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f7fbfc;">
          <th align="left" style="padding:10px 12px;font-size:12px;border-bottom:1px solid #e2ecee;">Item</th>
          <th align="right" style="padding:10px 12px;font-size:12px;border-bottom:1px solid #e2ecee;">Cant.</th>
        </tr>
      </thead>
      <tbody>
        ${buildItemsRowsHtml(items)}
      </tbody>
    </table>

    <div style="text-align:center;margin:20px 0 8px;">
      <a href="${trackingUrl}" style="display:inline-block;background:#00a86b;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">
        Ver estado
      </a>
    </div>
  `;

  return {
    subject: `Pedido despachado - Caso ${String(cot?.numero_caso ?? payload?.numero_caso ?? "-")}`,
    html: wrapMail({
      title: "Pedido despachado",
      subtitle: "Salida de almacen confirmada",
      gradient: "linear-gradient(135deg,#00a86b,#008f5a)",
      body,
    }),
  };
}

async function buildEmail(
  eventType: string,
  cot: any,
  payload: any,
  actorNombre?: string,
  actorRol?: string
) {
  const actorLine =
    actorNombre || actorRol
      ? `${String(actorNombre || "Equipo Vega Clean")}${actorRol ? ` (${String(actorRol)})` : ""}`
      : "";

  const payloadItems = normalizeItems(payload?.items);
  const cotId = Number(cot?.id ?? payload?.cotizacion_id ?? 0);
  const cotItems = payloadItems.length ? payloadItems : await fetchCotItems(cotId);

  if (eventType === "orden_recibida") {
    return buildOrderReceivedEmail(payload, cotItems);
  }

  if (eventType === "cotizacion_en_almacen") {
    return buildQuoteReadyEmail(payload, cot, cotItems, actorLine);
  }

  if (eventType === "cotizacion_despachada") {
    return buildDispatchedEmail(payload, cot, cotItems, actorLine);
  }

  if (eventType === "cotizacion_creada") {
    return buildQuoteReadyEmail(payload, cot, cotItems, actorLine);
  }

  return {
    subject: `Actualizacion de cotizacion #${String(cot?.id ?? payload?.cotizacion_id ?? "-")}`,
    html: wrapMail({
      title: "Actualizacion de estado",
      subtitle: "Vega Clean",
      gradient: "linear-gradient(135deg,#1577c8,#0f5fa3)",
      body: `
        <p style="margin:0 0 12px;font-size:16px;">Hola, <strong>${escapeHtml(payload?.cliente ?? cot?.cliente ?? "Cliente")}</strong>.</p>
        <p style="margin:0 0 12px;line-height:1.55;">
          Tu solicitud fue actualizada.
        </p>
        <p style="margin:0;font-size:14px;">
          Caso: <strong>${escapeHtml(cot?.numero_caso ?? payload?.numero_caso ?? "-")}</strong>
        </p>
      `,
    }),
  };
}

async function resendSendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend error (${res.status}): ${text}`);
  }

  return await res.json().catch(() => ({}));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const body = await req.json().catch(() => ({}));
  const mode = String(body?.mode ?? "").trim().toLowerCase();

  try {
    if (mode === "direct_send") {
      const eventType = String(body?.event_type ?? "orden_recibida");
      const toEmail = String(body?.to_email ?? "").trim();
      const payload = body?.payload ?? {};
      const actorNombre = body?.actor_nombre ? String(body.actor_nombre) : undefined;
      const actorRol = body?.actor_rol ? String(body.actor_rol) : undefined;

      if (!toEmail) {
        return jsonResponse({ ok: false, error: "to_email is required" }, 400);
      }

      const mail = await buildEmail(eventType, null, payload, actorNombre, actorRol);
      await resendSendEmail(toEmail, mail.subject, mail.html);

      return jsonResponse({
        ok: true,
        mode: "direct_send",
        event_type: eventType,
        sent: 1,
      });
    }

    const eventId = body?.event_id ? Number(body.event_id) : null;
    const limit = Number(body?.limit ?? 25);

    let q = sb
      .from("email_events")
      .select("id, event_type, cotizacion_id, to_email, payload, actor_nombre, actor_rol, status, attempts")
      .eq("status", "pending")
      .order("id", { ascending: true })
      .limit(limit);

    if (eventId) q = q.eq("id", eventId).limit(1);

    const { data: events, error: evErr } = await q;
    if (evErr) throw evErr;

    if (!events || events.length === 0) {
      return jsonResponse({ ok: true, sent: 0, processed: 0 });
    }

    let sentCount = 0;

    for (const ev of events) {
      let cot: any = null;

      if (ev.cotizacion_id) {
        const { data: cotData, error: cotErr } = await sb
          .from("cotizaciones")
          .select("id, total, estado, numero_caso, preventa_id, cliente_id, fecha, despachado_en, cliente")
          .eq("id", ev.cotizacion_id)
          .maybeSingle();

        if (cotErr) {
          await sb
            .from("email_events")
            .update({
              status: "failed",
              error: `Cotizacion fetch error: ${String((cotErr as any)?.message ?? cotErr)}`,
              attempts: (ev.attempts ?? 0) + 1,
              last_attempt_at: new Date().toISOString(),
            })
            .eq("id", ev.id);
          continue;
        }

        cot = cotData;
      }

      const mail = await buildEmail(ev.event_type, cot, ev.payload, ev.actor_nombre, ev.actor_rol);

      try {
        await resendSendEmail(ev.to_email, mail.subject, mail.html);

        await sb
          .from("email_events")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            last_attempt_at: new Date().toISOString(),
            attempts: (ev.attempts ?? 0) + 1,
            error: null,
          })
          .eq("id", ev.id);

        sentCount++;
      } catch (e) {
        const attempts = (ev.attempts ?? 0) + 1;
        await sb
          .from("email_events")
          .update({
            status: attempts >= 5 ? "failed" : "pending",
            error: String((e as any)?.message ?? e),
            attempts,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", ev.id);
      }
    }

    return jsonResponse({ ok: true, sent: sentCount, processed: events.length });
  } catch (e) {
    return jsonResponse({ ok: false, error: String((e as any)?.message ?? e) }, 500);
  }
});

