import type { APIRoute } from 'astro';
import { aktuelleSchliesszeit, ersterTagDanach } from '../../data/betriebsferien';

export const prerender = false;

// Eingangsbestätigung an die absendende Person:
//   'immer'      → bei jeder Anfrage (empfohlen; im Urlaub automatisch mit Abwesenheitshinweis)
//   'nur-urlaub' → nur während einer Betriebsferien-Zeit
//   'aus'        → keine Bestätigung
const BESTAETIGUNG: 'immer' | 'nur-urlaub' | 'aus' = 'immer';

// Einfaches HTML-Escaping gegen Injection in der Mail
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ─── Spam-Schutz ────────────────────────────────────────────────────────────
// Mehrere Schichten. Erkannte Bots bekommen bewusst eine Erfolgsmeldung
// ({ ok: true }), damit sie nicht merken, dass sie blockiert wurden.

const ERLAUBTE_HERKUNFT = ['praxis-vandinther.de', 'www.praxis-vandinther.de'];

// Mindestzeit zwischen Formular-Aufruf und Absenden (Menschen tippen länger)
const MIN_AUSFUELLZEIT_MS = 3000;

// Höchstzahl Anfragen pro IP und Stunde
const MAX_PRO_STUNDE = 5;
const zugriffe = new Map<string, number[]>();

function rateLimitUeberschritten(ip: string) {
  const jetzt = Date.now();
  const fenster = (zugriffe.get(ip) ?? []).filter(t => jetzt - t < 3600_000);
  fenster.push(jetzt);
  zugriffe.set(ip, fenster);
  // Speicher begrenzen: alte Einträge gelegentlich verwerfen
  if (zugriffe.size > 500) {
    for (const [k, v] of zugriffe) if (!v.some(t => jetzt - t < 3600_000)) zugriffe.delete(k);
  }
  return fenster.length > MAX_PRO_STUNDE;
}

/** Erkennt Zufallszeichenfolgen wie "aLckOQnjaLBRaPPi" an ungewöhnlich vielen
 *  Wechseln von Klein- zu Großbuchstaben innerhalb eines Wortes.
 *  Echte Namen und deutsche Wörter haben davon höchstens ein bis zwei. */
function wirktZufaellig(text: string) {
  return (text.match(/[a-zäöüß][A-ZÄÖÜ]/g) ?? []).length >= 3;
}

/** Liefert den Ablehnungsgrund für Protokollzwecke — oder null, wenn alles sauber ist. */
function spamGrund(request: Request, raw: Record<string, string>, name: string, message: string) {
  if (raw['website']) return 'Honeypot ausgefüllt';

  // Anfrage muss von der eigenen Website kommen, nicht per Skript von außen
  const herkunft = request.headers.get('origin') || request.headers.get('referer') || '';
  if (!herkunft) return 'Kein Origin/Referer (direkter Zugriff auf die Schnittstelle)';
  try {
    if (!ERLAUBTE_HERKUNFT.includes(new URL(herkunft).hostname)) return `Fremde Herkunft: ${herkunft}`;
  } catch {
    return `Unlesbare Herkunft: ${herkunft}`;
  }

  // Zeitfalle: das Formular meldet, wie lange das Ausfüllen gedauert hat
  const dauer = Number(raw['dauer']);
  if (!Number.isFinite(dauer)) return 'Zeitangabe fehlt (Formular nicht benutzt)';
  if (dauer < MIN_AUSFUELLZEIT_MS) return `Zu schnell abgeschickt (${dauer} ms)`;

  if (wirktZufaellig(name)) return 'Name wirkt wie eine Zufallszeichenfolge';
  if (wirktZufaellig(message)) return 'Nachricht wirkt wie eine Zufallszeichenfolge';
  if ((message.match(/https?:\/\/|www\./gi) ?? []).length > 1) return 'Mehrere Links in der Nachricht';

  return null;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'unbekannt';
  if (rateLimitUeberschritten(ip)) {
    console.warn('Spam abgewiesen — Rate-Limit überschritten:', ip);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const contentType = request.headers.get('content-type') || '';
  let raw: Record<string, string> = {};

  if (contentType.includes('application/json')) {
    raw = await request.json();
  } else {
    const fd = await request.formData();
    fd.forEach((v, k) => { raw[k] = v as string; });
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

  const grund = spamGrund(request, raw, name, message);
  if (grund) {
    console.warn(`Spam abgewiesen (${ip}): ${grund}`);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const apiKey = import.meta.env.BREVO_API_KEY || process.env.BREVO_API_KEY;
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

    // Eingangsbestätigung — Fehler hier dürfen die Anfrage nicht scheitern lassen,
    // die Nachricht an die Praxis ist zu diesem Zeitpunkt bereits zugestellt.
    const ferien = aktuelleSchliesszeit();
    const bestaetigungSenden =
      email && (BESTAETIGUNG === 'immer' || (BESTAETIGUNG === 'nur-urlaub' && ferien));

    if (bestaetigungSenden) {
      const urlaubsHinweis = ferien
        ? `<p style="background:#FFF9EB;border:1px solid #F59E0B;border-radius:12px;padding:16px;color:#92400E">
             <strong>Hinweis: Unsere Praxis ist zurzeit geschlossen.</strong><br />
             Betriebsferien: ${esc(ferien.display)}.<br />
             Wir bearbeiten Ihre Nachricht ab dem ${esc(ersterTagDanach(ferien.end))}.
           </p>`
        : '<p>Wir melden uns in der Regel innerhalb von ein bis zwei Werktagen bei Ihnen.</p>';

      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            sender: { name: 'Praxis van Dinther', email: 'noreply@praxis-vandinther.de' },
            to: [{ email, name }],
            replyTo: { email: 'info@praxis-vandinther.de', name: 'Praxis van Dinther' },
            subject: ferien
              ? 'Ihre Nachricht ist eingegangen — wir sind derzeit im Urlaub'
              : 'Ihre Nachricht ist bei uns eingegangen',
            htmlContent: `
              <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1D1D1F;max-width:560px">
                <p>Guten Tag ${esc(name)},</p>
                <p>vielen Dank für Ihre Nachricht über unser Kontaktformular. Sie ist bei uns eingegangen.</p>
                ${urlaubsHinweis}
                <p style="background:#FEF2F2;border:1px solid #EF4444;border-radius:12px;padding:16px;color:#991B1B">
                  <strong>In dringenden Fällen</strong> wenden Sie sich bitte an den ärztlichen
                  Bereitschaftsdienst unter <strong>116 117</strong>. Bei einem medizinischen Notfall
                  wählen Sie bitte den Notruf <strong>112</strong>.
                </p>
                <p style="color:#6E6E73;font-size:14px">
                  Bitte beachten Sie: Eine medizinische Beratung oder Diagnose ist per E-Mail nicht möglich.
                  Termine buchen Sie am schnellsten über
                  <a href="https://www.doctolib.de/allgemeinarzt/krefeld/frank-van-dinther" style="color:#922c37">Doctolib</a>.
                </p>
                <p style="color:#6E6E73;font-size:14px">Mit freundlichen Grüßen<br />Ihre Praxis van Dinther</p>
                <hr style="border:none;border-top:1px solid #E8E8ED;margin:20px 0" />
                <p style="color:#86868B;font-size:12px">
                  Frank van Dinther · Facharzt für Allgemeinmedizin<br />
                  Neukirchener Straße 5 · 47829 Krefeld · Telefon 02151 478989<br />
                  Diese Nachricht wurde automatisch erzeugt. Sie können direkt darauf antworten.
                </p>
              </div>`,
          }),
        });
      } catch (err) {
        console.error('Bestätigungsmail fehlgeschlagen:', err);
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Brevo request failed:', err);
    return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.' }), { status: 500 });
  }
};
