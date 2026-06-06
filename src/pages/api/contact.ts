import type { APIRoute } from 'astro';

export const prerender = false;

// Einfaches HTML-Escaping gegen Injection in der Mail
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get('content-type') || '';
  let raw: Record<string, string> = {};

  if (contentType.includes('application/json')) {
    raw = await request.json();
  } else {
    const fd = await request.formData();
    fd.forEach((v, k) => { raw[k] = v as string; });
  }

  // Honeypot — Spam-Schutz
  if (raw['website']) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const ANLIEGEN_LABELS: Record<string, string> = {
    rezept: 'Rezept-Anfrage',
    ueberweisung: 'Überweisung',
    neupatient: 'Anfrage als Neupatient:in',
    befund: 'Befund-Rückfrage',
    sonstiges: 'Sonstiges',
  };

  const name    = raw['name']?.trim();
  const email   = raw['email']?.trim();
  const phone   = raw['phone']?.trim() || raw['telefon']?.trim() || '';
  const anliegenRaw = (raw['anliegen'] || raw['betreff'] || '').trim();
  const anliegen = ANLIEGEN_LABELS[anliegenRaw] || anliegenRaw;
  const geburt  = raw['geburtsdatum']?.trim() || '';
  const message = raw['message']?.trim() || raw['nachricht']?.trim();

  // Validierung: Name + Nachricht Pflicht, dazu mindestens eine Kontaktmöglichkeit
  if (!name || !message || (!email && !phone)) {
    return new Response(JSON.stringify({ error: 'Bitte Name, Nachricht und mindestens Telefon oder E-Mail angeben.' }), { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }), { status: 400 });
  }

  const apiKey = import.meta.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('BREVO_API_KEY fehlt');
    return new Response(JSON.stringify({ error: 'E-Mail-Versand ist nicht konfiguriert.' }), { status: 500 });
  }

  const htmlContent = `
    ${anliegen ? `<p><strong>Anliegen:</strong> ${esc(anliegen)}</p>` : ''}
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>E-Mail:</strong> ${esc(email || '–')}</p>
    <p><strong>Telefon:</strong> ${esc(phone || '–')}</p>
    ${geburt ? `<p><strong>Geburtsdatum:</strong> ${esc(geburt)}</p>` : ''}
    <hr />
    <p><strong>Nachricht:</strong></p>
    <p style="white-space:pre-wrap">${esc(message)}</p>
  `;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Kontaktformular', email: 'noreply@praxis-vandinther.de' },
        to: [{ email: 'info@praxis-vandinther.de' }],
        ...(email ? { replyTo: { email, name } } : {}),
        subject: `Neue Nachricht von ${name}`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error('Brevo error:', res.status, detail);
      return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Brevo request failed:', err);
    return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' }), { status: 500 });
  }
};
