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

## Schritt -1 — Das Repository übernehmen (Ownership-Transfer)

Das Repo wird dir **komplett übertragen**, damit du es auf **deinem eigenen
Vercel-Account** deployen kannst. Christian bleibt als Mitarbeiter (Collaborator)
dabei, damit ihr weiter gemeinsam pushen könnt.

1. **Transfer annehmen:** GitHub hat dir (`vandinther63`) eine E-Mail geschickt
   („… wants to transfer the repository praxis-vandinther.de to you"). Klicke auf
   **Accept transfer**. Danach liegt das Repo unter:
   `https://github.com/vandinther63/praxis-vandinther.de`

2. **Christian als Collaborator hinzufügen** (damit er weiter pushen kann):
   GitHub → dein Repo → **Settings → Collaborators → Add people** →
   `kiri-deluxe` → Rolle **Write** → einladen.
   *(Alternativ kann das dein Claude Code für dich erledigen:*
   *„Füge den GitHub-User kiri-deluxe als Collaborator mit Write-Rechten zu diesem Repo hinzu.")*

3. **Deine eigene Vercel-Verbindung herstellen:** siehe Schritt 2 weiter unten —
   dort importierst du das Repo `vandinther63/praxis-vandinther.de` in dein
   Vercel-Konto. (Eine evtl. alte Verbindung auf Christians Account verliert dadurch
   die Wirkung — das ist gewollt.)

> Hinweis für Christian: Nach Franks Annahme die lokale Remote-URL umstellen mit
> `git remote set-url origin https://github.com/vandinther63/praxis-vandinther.de.git`

---

## Schritt 0 — Claude Code einrichten (so wie wir gearbeitet haben)

Du möchtest die Website mit **Claude Code** weiterbauen — genau wie sie entstanden
ist. Dafür einmalig einrichten:

### 0.1 — Claude Code installieren
Anleitung: https://docs.claude.com/claude-code → installieren und mit deinem
Claude-Konto anmelden. Danach im Projektordner starten:

```bash
cd praxis-vandinther.de
claude
```

Claude liest dann automatisch `CLAUDE.md` ein und kennt den vollen Projektkontext.

### 0.2 — Die Skills installieren (mit diesen haben wir gebaut)

Diese drei sind die **Kern-Skills** für das Design und die Codequalität der Seite.
Im laufenden Claude Code eingeben:

```text
# 1) Offizieller Anthropic-Marketplace (für frontend-design + code-review)
/plugin marketplace add anthropics/claude-plugins-official
/plugin install frontend-design@claude-plugins-official
/plugin install code-review@claude-plugins-official

# 2) UI/UX Pro Max (das zentrale Design-Intelligence-Skill)
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Nach der Installation neu starten, wenn Claude Code dazu auffordert. Aufrufen kannst
du sie dann im Chat, z. B.:
- `/ui-ux-pro-max` — Layout/Design planen, prüfen, verbessern (das wichtigste)
- `/frontend-design` — distinctive, hochwertige Frontend-Umsetzung
- `/code-review` — Code auf Fehler und Qualität prüfen, bevor du pushst

**Optional (Bild-Retusche der Team-Fotos):** das Adobe-Skill (`/plugin` →
Adobe-Plugin suchen). Nur nötig, wenn du Fotos bearbeiten willst.

> Hinweis: Bei der Entwicklung wurden zusätzlich ein paar persönliche Skills von
> Christian benutzt (z. B. `gstack`-Browsing zum Screenshot-Prüfen, ein Motion-Skill
> „emil-design-eng"). Die sind Teil von Christians eigenem Setup und **für die
> Website nicht erforderlich** — die drei Skills oben genügen vollständig.

### 0.3 — Vercel mit Claude Code verbinden (empfohlen)

Damit dein Claude Code Deployments auslösen, Build-Logs lesen und Fehler direkt
sehen kann, verbinde deinen Vercel-Account. Im laufenden Claude Code:

```text
/mcp
```

Dort den **Vercel**-Connector hinzufügen/authentifizieren (Browser-Login mit deinem
Vercel-Konto). Danach kann Claude z. B. „zeig mir die letzten Deployments" oder
„warum ist der letzte Build fehlgeschlagen" beantworten.

> Wichtig zu wissen: Das ist Komfort, **kein Muss**. Das eigentliche Deployen läuft
> automatisch über GitHub (siehe Schritt 2) — jeder `git push` deployt von selbst.
> Die Vercel-Verbindung in Claude hilft nur beim Beobachten und Steuern.

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

## Gemeinsam am selben Repo arbeiten (Frank + Christian)

Dieses Repo wird von **beiden** gepflegt — ihr arbeitet am selben Stand, jeder hat
eine lokale Kopie (`git clone`). Damit ihr euch nicht gegenseitig überschreibt,
diese einfache Reihenfolge einhalten:

```bash
git pull        # IMMER zuerst — holt die neuesten Änderungen des anderen
# ... Änderungen machen ...
git add -A && git commit -m "kurze Beschreibung"
git pull        # nochmal ziehen, falls der andere zwischendurch gepusht hat
git push        # hochladen → Vercel deployt automatisch
```

Solange ihr nicht *gleichzeitig dieselbe Zeile derselben Datei* ändert, gibt es
keine Konflikte. Falls Git doch mal einen „merge conflict" meldet: einfach Claude
Code fragen — *„löse den Merge-Konflikt"* — er führt dich durch.

---

## Tägliche Arbeit (Cheatsheet)

```bash
npm run dev      # lokal ansehen + live bearbeiten
npm run build    # Produktions-Build lokal testen
git pull         # vor dem Arbeiten: neuesten Stand holen
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
