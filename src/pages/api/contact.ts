import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();

  // Honeypot — Spam-Schutz
  const honeypot = data.get('website') as string;
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const name    = (data.get('name')    as string)?.trim();
  const email   = (data.get('email')   as string)?.trim();
  const phone   = (data.get('phone')   as string)?.trim() || '–';
  const message = (data.get('message') as string)?.trim();

  // Validierung
  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Bitte alle Pflichtfelder ausfüllen.' }), { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }), { status: 400 });
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Kontaktformular <noreply@praxis-vandinther.de>',
      to:   'info@praxis-vandinther.de',
      replyTo: email,
      subject: `Neue Nachricht von ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>E-Mail:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <hr />
        <p><strong>Nachricht:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Resend error:', err);
    return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' }), { status: 500 });
  }
};
