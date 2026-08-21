// Betriebsferien — zentrale Quelle für Startseite UND Kontaktformular-Bestätigung.
// `end` ist der letzte Tag der Schließung (ISO YYYY-MM-DD).
// Neue Termine einfach hier ergänzen; vergangene werden automatisch ausgeblendet.
export const betriebsferien = [
  { label: 'Brückentag',    display: '05. Juni 2026',          start: '2026-06-05', end: '2026-06-05' },
  { label: 'Sommerurlaub',  display: '03.–18. August 2026',    start: '2026-08-03', end: '2026-08-18' },
  { label: 'Praxisurlaub',  display: '04.–11. September 2026', start: '2026-09-04', end: '2026-09-11' },
  { label: 'Praxisurlaub',  display: '02.–06. November 2026',  start: '2026-11-02', end: '2026-11-06' },
  { label: 'Jahreswechsel', display: '18.–31. Dezember 2026',  start: '2026-12-18', end: '2026-12-31' },
].sort((a, b) => a.end.localeCompare(b.end));

/** Liefert die aktuell laufende Schließzeit — oder null, wenn die Praxis geöffnet ist. */
export function aktuelleSchliesszeit(heute = new Date()) {
  const tag = heute.toISOString().slice(0, 10);
  return betriebsferien.find(f => tag >= f.start && tag <= f.end) ?? null;
}

/** Feste gesetzliche Feiertage in NRW (MM-TT). Bewegliche Ostertermine bleiben außen vor. */
const FEIERTAGE = ['01-01', '05-01', '10-03', '11-01', '12-25', '12-26'];

function istFrei(d: Date) {
  const wochenende = d.getDay() === 0 || d.getDay() === 6;
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return wochenende || FEIERTAGE.includes(md);
}

/** Erster Arbeitstag nach der Schließzeit (Wochenenden und Feiertage übersprungen). */
export function ersterTagDanach(end: string) {
  const d = new Date(end + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  while (istFrei(d)) d.setDate(d.getDate() + 1);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}
