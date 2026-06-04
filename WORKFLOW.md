# Praxis van Dinther — Projekt-Workflow

> Dieses Dokument ist das verbindliche Playbook für alle Beteiligten.
> Claude Code liest es automatisch. Herr van Dinther kann es bei Fragen nachschlagen.

---

## Stack

| Schicht | Technologie |
|---|---|
| Framework | Astro 5 (Static Output) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` |
| Inhalte | Astro-Seiten (`.astro`) + JSON-Datendateien |
| Schrift | Geist (variable font, von Vercel) |
| Icons | Inline SVG / Lucide (stroke-width 1.5) |
| SEO | `astro-seo` + `@astrojs/sitemap` |
| Deployment | Vercel, Region: fra1 (Frankfurt, DSGVO) |
| Repository | GitHub |

---

## Design-System

### Farben

```
Hintergrund:       #FFFFFF
Fläche / Card:     #F5F5F7
Trennlinie:        #E8E8ED
Text Primär:       #1D1D1F
Text Sekundär:     #6E6E73
Text Tertiär:      #86868B
Akzent Blau:       #0071E3
Akzent Blau Hover: #0058B0
Akzent Hell:       #EBF2FF
Warnung BG:        #FFF9EB  / Border: #F59E0B
Notfall BG:        #FEF2F2  / Border: #EF4444
```

### Typografie (Geist)

```
Hero H1:    text-5xl lg:text-7xl  font-semibold  tracking-tight
Section H2: text-3xl lg:text-4xl  font-semibold  tracking-tight
Card H3:    text-xl               font-medium    tracking-tight
Body:       text-base lg:text-lg  font-normal    leading-relaxed
Eyebrow:    text-xs/text-sm       font-semibold  tracking-widest uppercase text-[#0071E3]
```

### Abstände

```
Section vertical:  py-24 (96px)
Hero vertical:     py-32 (128px)
Card innen:        p-8 / p-10
Card Gap:          gap-6
Section Gap:       gap-12
Max-Width Seite:   max-w-6xl mx-auto px-6
```

---

## Projektstruktur

```
praxis-vandinther/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro      ← Nav + Footer, SEO-Meta
│   ├── pages/
│   │   ├── index.astro           ← Startseite
│   │   ├── aktuelles.astro       ← Öffnungszeiten
│   │   ├── kontakt.astro         ← Kontakt + Formular
│   │   ├── leistung.astro        ← Leistungsspektrum
│   │   ├── team.astro            ← Das Team
│   │   ├── wissen.astro          ← Patienteninformationen
│   │   ├── jobs.astro            ← Stellenangebote
│   │   ├── impressum.astro       ← Impressum
│   │   ├── datenschutz.astro     ← Datenschutz
│   │   └── verfahren.astro       ← Verfahrensanweisung
│   ├── content/
│   │   └── data/
│   │       └── praxis.json       ← Stammdaten: Adresse, Zeiten, Kontakt
│   └── styles/
│       └── global.css            ← Tailwind-Import + CSS-Variablen
├── astro.config.mjs
├── WORKFLOW.md                   ← Dieses Dokument
└── CLAUDE.md                     ← Claude-Code-Kontext
```

---

## Inhalte bearbeiten (für Herrn van Dinther)

### Öffnungszeiten, Adresse, Telefon ändern

Datei: `src/content/data/praxis.json`

Einfach die entsprechenden Werte ändern und speichern/committen.
Die geänderten Werte erscheinen nach dem nächsten Deploy automatisch auf der Seite.

### Seitentext ändern

Jede Seite liegt als `.astro`-Datei in `src/pages/`.
Texte stehen direkt im HTML, z.B.:

```html
<p class="text-lg text-[#6E6E73]">
  Ihr Text hier.
</p>
```

Einfach den Text zwischen den Tags ändern. Die Klassen (`class="..."`) nicht anfassen.

### Betriebsferien aktualisieren

In `src/content/data/praxis.json` → `betriebsferien2026`:

```json
"betriebsferien2026": [
  { "datum": "05. Juni 2026", "anlass": "Brückentag" }
]
```

---

## Entwicklungs-Workflow

### Lokal starten

```bash
cd praxis-vandinther
npm run dev
# → http://localhost:4321
```

### Bauen & prüfen

```bash
npm run build    # statische Dateien in dist/
npm run preview  # lokale Vorschau des Builds
```

### Qualitäts-Checks mit Claude Code

```bash
# Design Review (UI/UX Check)
/ui-ux-pro-max

# Code Review
/code-review

# Frontend Check
/frontend-design
```

---

## Branch-Strategie

```
main          ← immer produktionsreif, Vercel deployed hier
develop       ← aktiver Entwicklungszweig
feature/xxx   ← einzelne Features
```

Workflow:
1. `feature/xxx` → `develop` via PR
2. Review + lokaler Test
3. `develop` → `main` via PR → automatisches Vercel-Deploy

---

## Deployment (GitHub → Vercel)

### Erstmalige Einrichtung

1. Repo auf GitHub: `github.com/[username]/praxis-vandinther`
2. Vercel: "Add New Project" → GitHub-Repo importieren
3. Framework: **Astro** (wird automatisch erkannt)
4. Region: **fra1** (Frankfurt) — wichtig für DSGVO
5. Domain: `www.praxis-vandinther.de` in Vercel-Settings verknüpfen

### Danach: automatisch

Jeder Push auf `main` triggert ein Vercel-Deploy.
Deploy-Zeit: ca. 45–60 Sekunden.

### Repo-Übergabe an Herrn van Dinther

1. GitHub: Settings → Danger Zone → "Transfer ownership"
2. Vercel: Settings → Team → Herrn van Dinther einladen oder Projekt übertragen
3. Fertig. Er kann im GitHub Web-Editor Texte ändern, Vercel deployed automatisch.

---

## Self-Review-Checkliste

Vor jedem Merge auf `main`:

- [ ] `npm run build` läuft ohne Fehler
- [ ] Alle Seiten auf Mobile getestet (< 768px)
- [ ] Alle internen Links funktionieren
- [ ] Doctolib-Link führt zur richtigen Praxis-Seite
- [ ] Kontaktformular (JotForm) lädt korrekt
- [ ] Öffnungszeiten stimmen mit `praxis.json` überein
- [ ] Impressum und Datenschutz vorhanden
- [ ] Keine `console.error` im Browser
- [ ] Lighthouse Score ≥ 90 (Performance, Accessibility, SEO)

---

## DSGVO-Hinweise

- **Kein Google Analytics** — keine Einwilligung nötig, kein Cookie-Banner
- **Vercel Analytics**: falls aktiviert, EU-Region prüfen
- **JotForm-Kontaktformular**: Datenschutzhinweis im Formular aktivieren
- **Doctolib**: eigenständiger DSGVO-konformer Dienst, keine eigene Datenverarbeitung
- Alle Formulardaten bleiben bei JotForm / Doctolib — kein eigenes Backend nötig

---

*Letzte Aktualisierung: Juni 2026*
