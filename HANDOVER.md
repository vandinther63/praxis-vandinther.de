# Übergabe — Praxis van Dinther Website

> Diese Datei richtet sich an **Frank van Dinther** und seinen **Claude Code**.
> Sie erklärt, wie die Website online geht und wie das Kontaktformular angebunden wird.
> Reihenfolge einfach von oben nach unten abarbeiten.

---

## Was du hier bekommst

Eine fertige, statische Praxis-Website (Astro + Tailwind), gebaut im Apple-Stil:
weiß, viel Weißraum, Bordeaux-Akzent (`#922c37`) aus dem alten Praxislogo.

- **One-Pager** (`/`) mit Hero, Kontakt, Sprechzeiten, Leistungen, Team, Wissen
- **Vita-Unterseite** (`/team/frank-van-dinther`) mit interaktiver Timeline
- Alle Inhalte (Adresse, Zeiten, Texte) stehen direkt im Code und sind editierbar
- 12 Patienteninfo-PDFs und die Team-Fotos liegen unter `public/`

Vollständiger Projektkontext steht in **`CLAUDE.md`** (Stack-Entscheidungen) und
**`WORKFLOW.md`** (Design-System, Tokens, Arbeitsweise). Beim Start von Claude Code
im Projektordner wird `CLAUDE.md` automatisch eingelesen — dein Claude kennt damit
den vollen Kontext.

---

## Voraussetzungen (einmalig)

- **Node.js** ≥ 18 (prüfen: `node -v`) — falls nicht da: https://nodejs.org
- **Git** (prüfen: `git -v`)
- Ein **GitHub-Account** (du bist als Collaborator eingeladen → Einladung per Mail annehmen)
- Ein **Vercel-Account** (kostenlos): https://vercel.com — am besten „Continue with GitHub"
- Ein **Resend-Account** für das Kontaktformular: https://resend.com (kostenlos)

---

## Schritt 1 — Projekt lokal holen und starten

```bash
# Repo klonen (URL aus GitHub: Code → HTTPS)
git clone https://github.com/kiri-deluxe/praxis-vandinther.de.git
cd praxis-vandinther.de

# Abhängigkeiten installieren
npm install

# lokal ansehen (öffnet http://localhost:4321)
npm run dev
```

Im Browser http://localhost:4321 öffnen — die Seite sollte exakt so aussehen wie besprochen.

**Texte ändern:** Inhalte stehen in `src/pages/index.astro` und
`src/pages/team/frank-van-dinther.astro`. Einfach im Editor (VS Code / Cursor)
ändern, speichern — der Browser aktualisiert live. Oder deinen Claude Code bitten:
*„Ändere in der Sprechzeiten-Section die Uhrzeit am Dienstag auf …"*

---

## Schritt 2 — Online stellen mit Vercel (Region: Frankfurt / fra1)

> Wichtig: **fra1** wählen — eine deutsche Arztpraxis sollte ihre Daten in
> Frankfurt hosten (DSGVO).

1. Auf https://vercel.com einloggen → **Add New… → Project**
2. GitHub verbinden → Repo **`praxis-vandinther.de`** auswählen → **Import**
3. Vercel erkennt Astro automatisch. Bei **Region** / **Function Region**
   **Frankfurt (fra1)** wählen (Project Settings → Functions → Region).
4. **Deploy** klicken. Nach ~1 Minute ist die Seite unter einer
   `*.vercel.app`-Adresse live.

Ab jetzt gilt: **Jeder `git push` auf `main` deployt automatisch neu.**

### Eigene Domain `praxis-vandinther.de` verbinden

1. Vercel → Projekt → **Settings → Domains → Add** → `praxis-vandinther.de`
2. Vercel zeigt DNS-Einträge (A-Record / CNAME). Diese beim Domain-Anbieter
   (wo die Domain registriert ist) eintragen.
3. Warten bis DNS aktiv ist (Minuten bis wenige Stunden). HTTPS macht Vercel automatisch.

---

## Schritt 3 — Kontaktformular scharf schalten (Resend)

Aktuell ist das Kontaktformular im Frontend fertig gebaut (Modal-Overlay), aber
**versendet noch keine E-Mails**. Das wird mit **Resend** angebunden. Diesen
Schritt kann dein **Claude Code komplett für dich erledigen** — gib ihm einfach
den Auftrag unten.

### Vorbereitung (machst du)

1. Auf https://resend.com einloggen → **API Keys → Create API Key** → kopieren
   (beginnt mit `re_…`).
2. Domain in Resend verifizieren: **Domains → Add Domain** → `praxis-vandinther.de`
   → die angezeigten DNS-Einträge beim Domain-Anbieter setzen. (Nötig, damit
   E-Mails von `@praxis-vandinther.de` versendet werden dürfen.)
3. Den API-Key als **Umgebungsvariable in Vercel** hinterlegen:
   Vercel → Projekt → **Settings → Environment Variables** →
   Name `RESEND_API_KEY`, Wert `re_…`, Environment „Production" → **Save**.

   > Den Key **niemals in den Code schreiben** und **nicht** in GitHub committen —
   > nur als Vercel-Env-Var. Die `.gitignore` schützt bereits `.env`-Dateien.

### Auftrag an deinen Claude Code (kopierbar)

> Baue das Kontaktformular auf echten E-Mail-Versand um, mit Resend.
> Kontext steht in `CLAUDE.md` (Abschnitt „Bei Übergabe an Herrn van Dinther").
> Konkret:
> 1. `astro.config.mjs` auf SSR/Hybrid umstellen und `@astrojs/vercel` Adapter
>    installieren (`npm i @astrojs/vercel`), Region `fra1`.
> 2. `npm i resend`
> 3. API-Route `src/pages/api/contact.ts` anlegen: nimmt POST mit Name, E-Mail,
>    Telefon, Nachricht entgegen, validiert serverseitig, sendet per Resend an
>    `info@praxis-vandinther.de`, Absender `noreply@praxis-vandinther.de`.
>    `RESEND_API_KEY` aus `import.meta.env` lesen.
> 4. Das Formular im Modal in `src/pages/index.astro` auf ein natives
>    `<form method="POST" action="/api/contact">` umbauen, mit Erfolgs- und
>    Fehlermeldung. Honeypot-Feld gegen Spam ergänzen.
> 5. Lokal mit einem Test-Key prüfen, dann committen und pushen.

Danach: lokal testen, `git push` → Vercel deployt → Testnachricht über das Formular
schicken und prüfen, ob die Mail bei `info@praxis-vandinther.de` ankommt.

---

## Tägliche Arbeit (Cheatsheet)

```bash
npm run dev      # lokal ansehen + live bearbeiten
npm run build    # Produktions-Build lokal testen
git add -A && git commit -m "…"   # Änderung speichern
git push         # → Vercel deployt automatisch
```

Bei jeder Frage: Claude Code im Projektordner starten (`claude`) und einfach
beschreiben, was geändert werden soll. Er kennt durch `CLAUDE.md` den ganzen Kontext.

---

## Noch offen vor dem echten Go-Live (Pflicht in DE)

Diese rechtlichen Seiten fehlen noch und **müssen** vor dem Livegang ergänzt werden
(Inhalte teils von der alten Seite übernehmbar, Datenschutz anwaltlich prüfen lassen):

- [ ] **Impressum** (`/impressum`) — Pflicht nach § 5 DDG
- [ ] **Datenschutzerklärung** (`/datenschutz`) — DSGVO, anwaltlich prüfen
- [ ] **Verfahrensanweisung** (`/verfahren`) — falls von der alten Seite übernommen

Auftrag an Claude Code z. B.: *„Erstelle eine Impressum-Seite mit den Pflichtangaben,
Inhalte von der alten Seite praxis-vandinther.de übernehmen, und verlinke sie im Footer."*

---

## Kurz-Kontakt bei Problemen

- Astro-Doku: https://docs.astro.build
- Vercel-Doku: https://vercel.com/docs
- Resend-Doku: https://resend.com/docs

Viel Erfolg — die Seite ist so gebaut, dass du sie selbst weiterpflegen kannst.
