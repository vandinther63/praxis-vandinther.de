# Praxis van Dinther — Claude Code Kontext

> Diese Datei wird von Claude Code automatisch eingelesen.
> Sie erklärt das Projekt, alle Entscheidungen und wie hier gearbeitet wird.

---

## Projekt

Website-Neubau für **Praxis van Dinther**, Facharzt für Allgemeinmedizin, Krefeld.
Alte Seite: https://www.praxis-vandinther.de/ (Referenz für Inhalte)

**Ziel:** Moderne, minimalistische Praxiswebsite im Apple-Stil.
Weiß, viel Weißraum, starke Typografie — keine Fotos vorhanden.

---

## Stack-Entscheidungen (und warum)

- **Astro 5** statt Next.js: Statisch, kein Server nötig, schnell, günstig hostbar
- **Tailwind CSS v4**: Vite-nativ, kein PostCSS-Config-Overhead
- **Kein CMS** (kein Sanity, kein Decap): Praxis mit 10 Seiten, Änderungen selten — GitHub Web-Editor reicht aus; weniger Abhängigkeiten = weniger Angriffsfläche, DSGVO-freundlich
- **Inter Variable** (`@fontsource-variable/inter`): SF-Pro-nah, sauber ladbar (Geist wurde verworfen — kein CSS im npm-Paket)
- **Inline SVG statt Icon-Library**: Kein Bundle-Overhead, volle Kontrolle
- **Vercel fra1**: Deutsche Arztpraxis → Daten bleiben in Frankfurt (DSGVO)
- **Kein Google Analytics**: Kein Cookie-Banner nötig, kein DSGVO-Risiko

---

## Design-System

Vollständige Dokumentation: `WORKFLOW.md`

Kurzreferenz (siehe auch `src/styles/global.css`):
- Akzentfarbe: `#922c37` (Bordeaux, aus altem Logo) / Hover dunkler: `#7a2430`
- Text: `#1D1D1F` primär, `#6E6E73` sekundär, `#86868B` tertiär
- Hintergrund: `#FFFFFF` / Fläche: `#F5F5F7` / Border: `#E8E8ED`
- Schrift: Inter Variable
- Border-radius Cards: `rounded-2xl` (16px) / groß: `rounded-3xl` (24px)
- Motion-Tokens (Emil Kowalski): `--ease-out`, `--ease-in-out`, `--ease-drawer` in `global.css`
- Eyebrow-Pattern: `text-xs font-semibold tracking-widest uppercase`

---

## Inhalt-Struktur

Alle Stammdaten (Adresse, Zeiten, Kontakt) in:
`src/content/data/praxis.json`

Seiten:
- `src/pages/index.astro` — Startseite mit Hero, Trust-Bar, Bento, Services
- `src/pages/aktuelles.astro` — Öffnungszeiten, Betriebsferien, Lehrpraxis
- `src/pages/kontakt.astro` — Kontaktdaten, JotForm, Notfall
- `src/pages/leistung.astro` — Diagnostik, Vorsorge, DMP, IGeL
- `src/pages/team.astro` — Dr. van Dinther + MFA-Team
- `src/pages/wissen.astro` — Patienteninformationen, Links
- `src/pages/jobs.astro` — Stellenangebote

Noch zu erstellen:
- `src/pages/impressum.astro`
- `src/pages/datenschutz.astro`
- `src/pages/verfahren.astro`

---

## Externe Dienste

- **Doctolib**: Online-Terminbuchung + Videosprechstunde
  → URL: https://www.doctolib.de/allgemeinarzt/krefeld/frank-van-dinther
- **JotForm**: Kontaktformular
  → Form-ID: `261292702996062`
  → URL: `https://form.jotform.com/261292702996062`

---

## Übergabe an Herrn van Dinther

Das Repo wird am Ende übertragen:
1. GitHub: Settings → Transfer ownership → sein Account
2. Vercel: Er verbindet sein eigenes Vercel-Konto mit dem Repo
3. Domain `praxis-vandinther.de` in Vercel-DNS-Settings eintragen

Er kann danach in VS Code / Cursor weiterarbeiten.
Claude Code kennt durch diese Datei den vollen Kontext — einfach `claude` im Projektordner starten.

---

## Arbeitsweise in diesem Projekt

- Immer `WORKFLOW.md` befolgen
- Vor Merge: Self-Review-Checkliste durchgehen
- Keine neuen npm-Dependencies ohne Begründung
- Tailwind-Klassen direkt im Template (kein `@apply`)
- Inline-SVG für Icons (keine externe Icon-Library)
- Deutsche Texte direkt im Template (kein i18n-System nötig)

---

## Offene Punkte

### Vor Go-Live (Pflicht)
- [ ] Impressum-Seite erstellen (Inhalt von alter Seite übernehmen)
- [ ] Datenschutzerklärung erstellen (DSGVO-konform, anwaltlich prüfen lassen)
- [ ] Verfahrensanweisung-Seite erstellen
- [ ] Mobile Navigation (Hamburger-Menü) implementieren
- [ ] GitHub-Repo anlegen und pushen
- [ ] Vercel verbinden (Region: fra1)
- [ ] Domain `praxis-vandinther.de` umstellen

### Bei Übergabe an Herrn van Dinther
- [ ] **Kontaktformular: JotForm ersetzen durch eigenes Form**
  - Stack: Resend (Account bereits angelegt) + Astro Hybrid Mode + @astrojs/vercel Adapter
  - Resend API Key von Herrn van Dinther einfordern → als Vercel Environment Variable `RESEND_API_KEY` eintragen
  - Astro auf `output: 'hybrid'` umstellen
  - `/src/pages/api/contact.ts` API Route bauen
  - Form in `index.astro` (#formular) auf natives HTML-Form umbauen
  - JotForm iframe entfernen
  - Ziel-E-Mail: `info@praxis-vandinther.de`

### Nice to have
- [ ] Favicon erstellen (SVG, Initialen "vD")
- [ ] OG-Image erstellen (für Social Sharing)
