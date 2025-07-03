import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { fetchTurni, saveTurno } from '../api/schedule';
import { listUsers } from '../api/users';
import { User } from '../types/user';
import { getSchedulePdf } from '../api/pdfs';
import { format, startOfISOWeek, addDays } from 'date-fns';
import { DEFAULT_CALENDAR_ID } from '../constants';
import ImportExcel from '../components/ImportExcel';
import { createShiftEvents, ShiftData, signIn } from '../api/googleCalendar';
import './ListPages.css';

/* ---------- TIPI ---------- */
import { Turno, Slot } from '../types/turno';

type NewTurnoPayload = Omit<Turno, 'id'>;

/* ---------- COSTANTI ---------- */
const SCHEDULE_CALENDAR_IDS =
  import.meta.env.VITE_SCHEDULE_CALENDAR_IDS?.split(',') || [DEFAULT_CALENDAR_ID];

/* ---------- HELPER ---------- */
const stripDomain = (email: string) =>
  email.replace('@comune.castione.bg.it', '');

/* ---------- COMPONENTE ---------- */
export default function SchedulePage() {
  /* -- stato form -- */
  const [utenteSel, setUtenteSel] = useState<string>(''); // id utente
  const [giorno, setGiorno] = useState('');
  const [s1Start, setS1Start] = useState('');
  const [s1End,   setS1End]   = useState('');
  const [s2Start, setS2Start] = useState('');
  const [s2End,   setS2End]   = useState('');
  const [s3Start, setS3Start] = useState('');
  const [s3End,   setS3End]   = useState('');
  const [tipo, setTipo] = useState<'NORMALE' | 'STRAORD' | 'FERIE' | 'RIPOSO' | 'FESTIVO'>('NORMALE');
  const [note, setNote] = useState('');

  const calendarId = SCHEDULE_CALENDAR_IDS[0];

  /* -- stato dati -- */
  const [utenti, setUtenti] = useState<User[]>([]);
  const [turni, setTurni] = useState<Turno[]>([]);
  const [importedTurni, setImportedTurni] = useState<Turno[]>([]);
  const [refreshCal, setRefreshCal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [signInError, setSignInError] = useState('');

  const loadTurni = async () => {
    try {
      const { data } = await fetchTurni();
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
        const data = await loadTurni();
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
                slot1: t.slot1,
                slot2: t.slot2,
                slot3: t.slot3,
                note: t.note,
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
    listUsers().then(r => {
      setUtenti(r.data);
      setUtenteSel(r.data[0]?.id ?? '');
    });
      void loadTurni();
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
    setS1Start(''); setS1End('');
    setS2Start(''); setS2End('');
    setS3Start(''); setS3End('');
    setTipo('NORMALE'); setNote('');
  };

  /* --- submit --- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giorno || !s1Start || !s1End || !utenteSel) return;

    const payload: NewTurnoPayload = {
      user_id: utenteSel,
      giorno,
      slot1: { inizio: s1Start, fine: s1End },
      tipo,
      note: note || undefined,
    };
    if (s2Start && s2End) payload.slot2 = { inizio: s2Start, fine: s2End };
    if (s3Start && s3End) payload.slot3 = { inizio: s3Start, fine: s3End };

    const { data } = await saveTurno(payload as Turno);
    setTurni(prev =>
      prev.some(t => t.id === data.id) ? prev.map(t => t.id === data.id ? data : t) : [...prev, data]
    );
    if (signedIn) {
      try {
        const email = utenti.find(u => u.id === data.user_id)?.email || '';
        await createShiftEvents(calendarId, {
          userEmail: email,
          giorno: data.giorno,
          slot1: data.slot1,
          slot2: data.slot2,
          slot3: data.slot3,
          note: data.note,
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
          <input type="time" value={s1Start} onChange={e => setS1Start(e.target.value)} required />
          <span>→</span>
          <input type="time" value={s1End}   onChange={e => setS1End(e.target.value)}   required />
        </fieldset>

        <fieldset>
          <legend>Slot 2 (facoltativo)</legend>
          <input type="time" value={s2Start} onChange={e => setS2Start(e.target.value)} />
          <span>→</span>
          <input type="time" value={s2End}   onChange={e => setS2End(e.target.value)} />
        </fieldset>

        <fieldset>
          <legend>Slot 3 (facoltativo)</legend>
          <input type="time" value={s3Start} onChange={e => setS3Start(e.target.value)} />
          <span>→</span>
          <input type="time" value={s3End}   onChange={e => setS3End(e.target.value)} />
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
                <td>{`${t.slot1.inizio}–${t.slot1.fine}`}</td>
                <td>{t.slot2 ? `${t.slot2.inizio}–${t.slot2.fine}` : '—'}</td>
                <td>{t.slot3 ? `${t.slot3.inizio}–${t.slot3.fine}` : '—'}</td>
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
                : `${t.slot1.inizio}–${t.slot1.fine}`;
              const slot2 = ferieLike
                ? '—'
                : t.slot2
                ? `${t.slot2.inizio}–${t.slot2.fine}`
                : '—';
              const slot3Text = ferieLike
                ? '—'
                : t.slot3
                ? `${t.slot3.inizio}–${t.slot3.fine}`
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
