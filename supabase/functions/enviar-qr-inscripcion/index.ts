import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { correo, nombre, taller, codigo, qr } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "RESEND_API_KEY no configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmación de Inscripción</title>
</head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#009688,#00796b);padding:36px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">
                ✅ Inscripción Confirmada
              </h1>
              <p style="color:#b2dfdb;margin:8px 0 0;font-size:15px;">Congreso Latinoamericano COEMLATS 2026</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#37474f;font-size:16px;margin:0 0 20px;">
                Hola, <strong>${nombre}</strong>. Tu inscripción al siguiente taller ha sido confirmada:
              </p>

              <!-- Taller Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f5e9;border-radius:8px;padding:20px;margin-bottom:28px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;color:#1b5e20;font-size:18px;font-weight:700;">${taller.nombre}</p>
                    <p style="margin:0 0 4px;color:#388e3c;font-size:14px;">📅 ${taller.dia}</p>
                    <p style="margin:0 0 4px;color:#388e3c;font-size:14px;">⏰ ${taller.hora_inicio} – ${taller.hora_fin}</p>
                    <p style="margin:0;color:#388e3c;font-size:14px;">📍 ${taller.salon}</p>
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <p style="color:#37474f;font-size:15px;margin:0 0 12px;text-align:center;">
                Presenta este código QR el día del taller para registrar tu asistencia:
              </p>
              <div style="text-align:center;margin-bottom:24px;">
                <img src="${qr}" alt="Código QR" width="220" height="220"
                  style="border:3px solid #009688;border-radius:8px;padding:6px;background:#fff;" />
              </div>

              <!-- Confirmation Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f8e9;border:1px dashed #aed581;border-radius:8px;padding:14px;margin-bottom:24px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 4px;color:#558b2f;font-size:13px;">Código de confirmación</p>
                    <p style="margin:0;color:#33691e;font-size:20px;font-weight:700;letter-spacing:3px;">${codigo}</p>
                  </td>
                </tr>
              </table>

              <p style="color:#78909c;font-size:13px;text-align:center;margin:0;">
                Si no te inscribiste en este taller, ignora este correo.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:20px 40px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="margin:0;color:#9e9e9e;font-size:12px;">
                COEMLATS 2026 · Congreso Latinoamericano de Estudiantes de Medicina
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "COEMLATS 2026 <noreply@coemlats.com>",
        to: [correo],
        subject: `✅ Inscripción confirmada: ${taller.nombre}`,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ ok: false, error: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
