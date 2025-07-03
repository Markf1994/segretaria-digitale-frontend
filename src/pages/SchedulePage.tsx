import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { listUtenti, Utente } from '../api/users';
import { getSchedulePdf } from '../api/pdfs';
import { format, startOfISOWeek, addDays } from 'date-fns';
import { DEFAULT_CALENDAR_ID } from '../constants';
import ImportExcel from '../components/ImportExcel';
import { createShiftEvents, ShiftData, signIn } from '../api/googleCalendar';
import './ListPages.css';

/* ---------- TIPI ---------- */
interface Turno {
  id: string;
  giorno: string;
  inizio_1: string;
  fine_1: string;
  inizio_2?: string | null;
  fine_2?: string | null;
  inizio_3?: string | null;
  fine_3?: string | null;
  tipo: 'NORMALE' | 'STRAORD' | 'FERIE' | 'RIPOSO' | 'FESTIVO';
  note?: string | null;
  user_id: string;
}

type NewTurnoPayload = Omit<Turno, 'id'>;

/* ---------- COSTANTI ---------- */
const SCHEDULE_CALENDAR_IDS =
  import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',') || [DEFAULT_CALENDAR_ID];

/* ---------- HELPER ---------- */
const stripDomain = (email: string) =>
  email.replace('@comune.castione.bg.it', '');

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
});

/* ---------- COMPONENTE ---------- */
export default function SchedulePage() {
  /* -- stato form -- */
  const [utenteSel, setUtenteSel] = useState<string>(''); // id utente
  const [giorno, setGiorno] = useState('');
  const [inizio1, setInizio1] = useState('');
  const [fine1,   setFine1]   = useState('');
  const [inizio2, setInizio2] = useState('');
  const [fine2,   setFine2]   = useState('');
  const [inizio3, setInizio3] = useState('');
  const [fine3,   setFine3]   = useState('');
  const [tipo, setTipo] = useState<'NORMALE' | 'STRAORD' | 'FERIE' | 'RIPOSO' | 'FESTIVO'>('NORMALE');
  const [note, setNote] = useState('');

  const calendarId = SCHEDULE_CALENDAR_IDS[0];

  /* -- stato dati -- */
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [turni, setTurni] = useState<Turno[]>([]);
  const [importedTurni, setImportedTurni] = useState<Turno[]>([]);
  const [refreshCal, setRefreshCal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [signInError, setSignInError] = useState('');

  const fetchTurni = async () => {
    try {
      const { data } = await api.get<Turno[]>('/orari/');
      setTurni(data);
      setLoadError('');
      return data;
    } catch {
      setLoadError('Errore nel caricamento dei turni');
      return [];
    }
  };

  const handleImportComplete = async (success: boolean) => {
    if (success) {
      const data = await fetchTurni();
      if (data.length) {
        const maxDate = new Date(
          Math.max(...data.map(t => new Date(t.giorno).getTime()))
        );
        const start = startOfISOWeek(maxDate);
        const end = addDays(start, 6);
        const imported = data.filter(t => {
          const d = new Date(t.giorno);
          return d >= start && d <= end;
        });
        setImportedTurni(imported);
        if (signedIn) {
          for (const t of imported) {
            try {
              const email = utenti.find(u => u.id === t.user_id)?.email || '';
              await createShiftEvents(calendarId, {
                userEmail: email,
                giorno: t.giorno,
                slot1: { inizio: t.inizio_1, fine: t.fine_1 },
                slot2:
                  t.inizio_2 && t.fine_2
                    ? { inizio: t.inizio_2, fine: t.fine_2 }
                    : undefined,
                slot3:
                  t.inizio_3 && t.fine_3
                    ? { inizio: t.inizio_3, fine: t.fine_3 }
                    : undefined,
                note: t.note || undefined,
              } as ShiftData);
            } catch {
              // ignore calendar errors
            }
          }
        }
        setRefreshCal(prev => !prev);
      }
    }
  };

  /* --- caricamento iniziale --- */
  useEffect(() => {
    listUtenti().then(r => {
      setUtenti(r.data);
      setUtenteSel(r.data[0]?.id ?? '');
    });
    void fetchTurni();
  }, []);

  useEffect(() => {
    const doSignIn = async () => {
      try {
        await signIn();
        setSignedIn(true);
        setSignInError('');
      } catch {
        setSignInError('Errore di accesso al calendario');
      }
    };
    doSignIn();
  }, []);

  /* --- helper --- */
  const resetForm = () => {
    setGiorno('');
    setInizio1(''); setFine1('');
    setInizio2(''); setFine2('');
    setInizio3(''); setFine3('');
    setTipo('NORMALE'); setNote('');
  };

  /* --- submit --- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giorno || !inizio1 || !fine1 || !utenteSel) return;

    const payload: NewTurnoPayload = {
      user_id: utenteSel,
      giorno,
      inizio_1: inizio1,
      fine_1: fine1,
      tipo,
      note: note || undefined,
    };
    if (inizio2 && fine2) {
      payload.inizio_2 = inizio2;
      payload.fine_2 = fine2;
    }
    if (inizio3 && fine3) {
      payload.inizio_3 = inizio3;
      payload.fine_3 = fine3;
    }

    const { data } = await api.post<Turno>('/orari/', payload);
    setTurni(prev =>
      prev.some(t => t.id === data.id) ? prev.map(t => t.id === data.id ? data : t) : [...prev, data]
    );
    if (signedIn) {
      try {
        const email = utenti.find(u => u.id === data.user_id)?.email || '';
        await createShiftEvents(calendarId, {
          userEmail: email,
          giorno: data.giorno,
          slot1: { inizio: data.inizio_1, fine: data.fine_1 },
          slot2:
            data.inizio_2 && data.fine_2
              ? { inizio: data.inizio_2, fine: data.fine_2 }
              : undefined,
          slot3:
            data.inizio_3 && data.fine_3
              ? { inizio: data.inizio_3, fine: data.fine_3 }
              : undefined,
          note: data.note || undefined,
        } as ShiftData);
      } catch {
        // ignore calendar errors
      }
    }
    resetForm();
  };

  /* --- delete --- */
  const handleDelete = async (id: string) => {
    await api.delete(`/orari/${id}`);
    setTurni(prev => prev.filter(t => t.id !== id));
  };

  const handleDownloadPdf = async () => {
    const week = format(new Date(), "RRRR-'W'II");
    try {
      const blob = await getSchedulePdf(week);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      // ignore download errors
    }
  };

  /* --- render --- */
  return (
    <div className="list-page">
      <h2>Turni di servizio</h2>
      {loadError && <p className="error">{loadError}</p>}
      {signInError && <p className="error">{signInError}</p>}

      <ImportExcel onComplete={handleImportComplete} />

      {/* -------- FORM -------- */}
      <form className="item-form" onSubmit={handleAdd}>
        <label>Utente *</label>
        <select
          value={utenteSel}
          onChange={e => setUtenteSel(e.target.value)}
          required
        >
          {utenti.map(u => (
            <option key={u.id} value={u.id}>
              {u.nome || stripDomain(u.email)}
            </option>
          ))}
        </select>

        <label>Data *</label>
        <input type="date" value={giorno} onChange={e => setGiorno(e.target.value)} required />

        <fieldset>
          <legend>Slot 1 (obbligatorio)</legend>
          <select value={inizio1} onChange={e => setInizio1(e.target.value)} required>
            <option value=""></option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span>→</span>
          <select value={fine1} onChange={e => setFine1(e.target.value)} required>
            <option value=""></option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend>Slot 2 (facoltativo)</legend>
          <select value={inizio2} onChange={e => setInizio2(e.target.value)}>
            <option value=""></option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span>→</span>
          <select value={fine2} onChange={e => setFine2(e.target.value)}>
            <option value=""></option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend>Slot 3 (facoltativo)</legend>
          <select value={inizio3} onChange={e => setInizio3(e.target.value)}>
            <option value=""></option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span>→</span>
          <select value={fine3} onChange={e => setFine3(e.target.value)}>
            <option value=""></option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </fieldset>

        <label>Tipo</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)}>
          <option value="NORMALE">Normale</option>
          <option value="STRAORD">Straordinario</option>
          <option value="FERIE">Ferie</option>
          <option value="RIPOSO">Riposo</option>
          <option value="FESTIVO">Festivo</option>
        </select>

        <input placeholder="Note" value={note} onChange={e => setNote(e.target.value)} />

        <button type="submit">Salva turno</button>
      </form>

      {/* -------- LISTA -------- */}
      <details open style={{ marginTop: '1rem' }}>
        <summary>Turni salvati</summary>
        <table className="item-table">
          <thead>
            <tr>
              <th>Utente</th><th>Data</th><th>Slot 1</th><th>Slot 2</th><th>Slot 3</th><th>Tipo</th><th>Note</th><th></th>
            </tr>
          </thead>
          <tbody>
            {turni.map(t => {
              const nome =
                utenti.find(u => u.id === t.user_id)?.nome ||
                stripDomain(utenti.find(u => u.id === t.user_id)?.email || '');
              return (
                <tr key={t.id}>
                  <td>{nome}</td>
                  <td>{t.giorno}</td>
                <td>{`${t.inizio_1}–${t.fine_1}`}</td>
                <td>
                  {t.inizio_2 && t.fine_2
                    ? `${t.inizio_2}–${t.fine_2}`
                    : '—'}
                </td>
                <td>
                  {t.inizio_3 && t.fine_3
                    ? `${t.inizio_3}–${t.fine_3}`
                    : '—'}
                </td>
                <td>{t.tipo}</td>
                <td>{t.note || '—'}</td>
                  <td><button onClick={() => handleDelete(t.id)}>🗑️</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </details>

      {/* -------- CALENDAR -------- */}
      <div style={{ marginTop: '1.5rem' }}>
        <iframe
          key={String(refreshCal)}
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&mode=WEEK&ctz=Europe/Rome`}
          title="Calendario Turni"
          style={{ border: 0, width: '100%', height: '600px' }}
          frameBorder={0}
          scrolling="no"
        />
        <button onClick={() => setRefreshCal(prev => !prev)}>
          Aggiorna calendario
        </button>
        <button onClick={handleDownloadPdf} style={{ marginLeft: '0.5rem' }}>
          PDF settimana
        </button>
      </div>

      {importedTurni.length > 0 && (
        <section className="imported-turni-section">
          <h3>Turni importati</h3>
          <table className="item-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Nome agente</th>
                <th>Giorno</th>
                <th>Tipo</th>
                <th>Slot 1</th>
                <th>Slot 2</th>
                <th>Slot 3</th>
              </tr>
            </thead>
            <tbody>
              {importedTurni.map(t => {
                const nome =
                  utenti.find(u => u.id === t.user_id)?.nome ||
                  stripDomain(utenti.find(u => u.id === t.user_id)?.email || '');
              const ferieLike = ['FERIE', 'RIPOSO', 'FESTIVO'].includes(t.tipo);
              const slot1 = ferieLike
                ? t.tipo
                : `${t.inizio_1}–${t.fine_1}`;
              const slot2 = ferieLike
                ? '—'
                : t.inizio_2 && t.fine_2
                ? `${t.inizio_2}–${t.fine_2}`
                : '—';
              const slot3Text = ferieLike
                ? '—'
                : t.inizio_3 && t.fine_3
                ? `${t.inizio_3}–${t.fine_3}`
                : '—';
              return (
                <tr key={t.id}>
                  <td>{nome}</td>
                  <td>{t.giorno}</td>
                  <td>{t.tipo}</td>
                  <td>{slot1}</td>
                  <td>{slot2}</td>
                  <td style={{ color: 'red' }}>{slot3Text}</td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
