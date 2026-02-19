/// <reference types="https://deno.land/x/types@v0.1.0/mod.d.ts" />

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

// Placeholder: cámbialo luego en Resend cuando tengas dominio verificado.
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "FROM_PLACEHOLDER@YOUR_DOMAIN.COM";

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
}
if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY env var.");
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

function buildEmail(eventType: string, cot: any, payload: any, actorNombre?: string, actorRol?: string) {
  const id = cot?.id ?? payload?.cotizacion_id ?? "";
  const total = Number(cot?.total ?? payload?.total ?? 0).toFixed(2);
  const numeroCaso = cot?.numero_caso ?? payload?.numero_caso ?? "-";
  const estado = cot?.estado ?? payload?.estado_to ?? payload?.estado ?? "-";

  const actorLine =
    actorNombre || actorRol
      ? `<p><strong>Gestionado por:</strong> ${actorNombre ?? "—"} (${actorRol ?? "—"})</p>`
      : "";

  if (eventType === "cotizacion_creada") {
    const origen = payload?.origen ?? "sistema";
    return {
      subject: `Confirmación de cotización #${id}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.45">
          <h2>Tu cotización ha sido creada</h2>
          <p>Hemos recibido tu solicitud y generamos la cotización.</p>
          <p><strong>Cotización:</strong> #${id}</p>
          <p><strong>#Caso:</strong> ${numeroCaso}</p>
          <p><strong>Estado:</strong> ${estado}</p>
          <p><strong>Total:</strong> RD$ ${total}</p>
          <p><strong>Origen:</strong> ${origen}</p>
          ${actorLine}
          <p>Gracias por tu preferencia.</p>
        </div>
      `,
    };
  }

  if (eventType === "cotizacion_en_almacen") {
    return {
      subject: `Cotización #${id} en preparación`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.45">
          <h2>Tu cotización está en almacén / preparación</h2>
          <p><strong>Cotización:</strong> #${id}</p>
          <p><strong>#Caso:</strong> ${numeroCaso}</p>
          <p><strong>Total:</strong> RD$ ${total}</p>
          ${actorLine}
          <p>Te notificaremos cuando sea despachada.</p>
        </div>
      `,
    };
  }

  if (eventType === "cotizacion_despachada") {
    return {
      subject: `Cotización #${id} despachada`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.45">
          <h2>Tu cotización fue despachada</h2>
          <p><strong>Cotización:</strong> #${id}</p>
          <p><strong>#Caso:</strong> ${numeroCaso}</p>
          <p><strong>Total:</strong> RD$ ${total}</p>
          ${actorLine}
          <p>Gracias por tu compra.</p>
        </div>
      `,
    };
  }

  return {
    subject: `Actualización de cotización #${id}`,
    html: `<p>Estado: ${estado} — Total: RD$ ${total}</p>`,
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
  const body = await req.json().catch(() => ({}));
  const eventId = body?.event_id ? Number(body.event_id) : null;
  const limit = Number(body?.limit ?? 25);

  try {
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
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;

    for (const ev of events) {
      const { data: cot, error: cotErr } = await sb
        .from("cotizaciones")
        .select("id, total, estado, numero_caso, preventa_id, cliente_id, fecha")
        .eq("id", ev.cotizacion_id)
        .maybeSingle();

      if (cotErr) {
        await sb
          .from("email_events")
          .update({
            status: "failed",
            error: `Cotizacion fetch error: ${String((cotErr as any).message ?? cotErr)}`,
            attempts: (ev.attempts ?? 0) + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", ev.id);
        continue;
      }

      const mail = buildEmail(ev.event_type, cot, ev.payload, ev.actor_nombre, ev.actor_rol);

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

    return new Response(JSON.stringify({ ok: true, sent: sentCount, processed: events.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String((e as any)?.message ?? e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
