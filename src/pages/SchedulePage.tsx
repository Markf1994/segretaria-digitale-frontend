import React, { useEffect, useMemo, useState } from 'react';
import { fetchTurni, saveTurno, deleteTurno } from '../api/schedule';
import { listUsers } from '../api/users';
import { User } from '../types/user';
import { getSchedulePdf } from '../api/pdfs';
import { format, startOfISOWeek, addDays } from 'date-fns';
import { DEFAULT_CALENDAR_ID } from '../constants';
import ImportExcel from '../components/ImportExcel';
import {
  createShiftEvents,
  updateEvent,
  deleteEvent,
  ShiftData,
  signIn,
} from '../api/googleCalendar';
import './ListPages.css';
import { useAuthStore } from '../store/auth';
import { getUserStorageKey } from '../utils/auth';
import { withOffline, withoutResult } from '../utils/offline';

/* ---------- TIPI ---------- */
import dayjs from 'dayjs';
import { Turno, Slot, TipoTurno } from '../types/turno';

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
  const [tipo, setTipo] = useState<TipoTurno>('NORMALE');
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState<Turno | null>(null);

  const calendarId = SCHEDULE_CALENDAR_IDS[0];

  /* -- stato dati -- */
  const [utenti, setUtenti] = useState<User[]>([]);
  const [turni, setTurni] = useState<Turno[]>([]);
  const [importedTurni, setImportedTurni] = useState<Turno[]>([]);
  const [refreshCal, setRefreshCal] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [signInError, setSignInError] = useState('');
  const [calendarError, setCalendarError] = useState('');
  const [pdfWarning, setPdfWarning] = useState('');
  const token = useAuthStore(s => s.token);
  const storageKey = useMemo(
    () =>
      getUserStorageKey(
        'turni',
        token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
      ),
    [token]
  );

  const toPlain = (t: Turno) => {
    const ferieLike = ['RIPOSO', 'FESTIVO'].includes(t.tipo)
    return {
      id: t.id,
      user_id: t.user_id,
      giorno: t.giorno.format('YYYY-MM-DD'),
      inizio_1: ferieLike ? null : t.slot1.inizio.format('HH:mm'),
      fine_1: ferieLike ? null : t.slot1.fine.format('HH:mm'),
      inizio_2: t.slot2 ? t.slot2.inizio.format('HH:mm') : null,
      fine_2: t.slot2 ? t.slot2.fine.format('HH:mm') : null,
      inizio_3: t.slot3 ? t.slot3.inizio.format('HH:mm') : null,
      fine_3: t.slot3 ? t.slot3.fine.format('HH:mm') : null,
      tipo: t.tipo,
      note: t.note ?? null,
      eventIds: t.eventIds,
    }
  }

  const fromPlain = (p: any): Turno => ({
    id: p.id,
    user_id: p.user_id,
    giorno: dayjs(p.giorno),
    slot1:
      p.inizio_1 && p.fine_1
        ? { inizio: dayjs(`${p.giorno}T${p.inizio_1}`), fine: dayjs(`${p.giorno}T${p.fine_1}`) }
        : { inizio: dayjs(`${p.giorno}T00:00`), fine: dayjs(`${p.giorno}T00:00`) },
    slot2:
      p.inizio_2 && p.fine_2
        ? { inizio: dayjs(`${p.giorno}T${p.inizio_2}`), fine: dayjs(`${p.giorno}T${p.fine_2}`) }
        : undefined,
    slot3:
      p.inizio_3 && p.fine_3
        ? { inizio: dayjs(`${p.giorno}T${p.inizio_3}`), fine: dayjs(`${p.giorno}T${p.fine_3}`) }
        : undefined,
    tipo: p.tipo,
    note: p.note ?? undefined,
    eventIds: p.eventIds,
  });

  const saveLocal = (data: Turno[]) => {
    const plain = data.map(toPlain);
    localStorage.setItem(storageKey, JSON.stringify(plain));
  };

  const loadTurni = async () => {
    const data = await withOffline(
      async () => {
        const res = await fetchTurni();
        saveLocal(res);
        setLoadError('');
        return res;
      },
      () => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as any[];
            return parsed.map(fromPlain) as Turno[];
          } catch {
            // ignore
          }
        }
        setLoadError('Errore nel caricamento dei turni');
        return [] as Turno[];
      }
    );
    setTurni(data);
    return data;
  };

  const handleImportComplete = async (success: boolean) => {
    if (success) {
        const data = await loadTurni();
      if (data.length) {
        const maxDate = new Date(
          Math.max(...data.map(t => t.giorno.toDate().getTime()))
        );
        const start = startOfISOWeek(maxDate);
        const end = addDays(start, 6);
        const imported = data.filter(t => {
          const d = t.giorno.toDate();
          return d >= start && d <= end;
        });
        setImportedTurni(imported);
        if (signedIn) {
          for (const t of imported) {
            try {
              const email = utenti.find(u => u.id === t.user_id)?.email || '';
              await createShiftEvents(calendarId, {
                userEmail: email,
                giorno: t.giorno.format('YYYY-MM-DD'),
                slot1: {
                  inizio: t.slot1.inizio.format('HH:mm'),
                  fine: t.slot1.fine.format('HH:mm'),
                },
                slot2: t.slot2
                  ? {
                      inizio: t.slot2.inizio.format('HH:mm'),
                      fine: t.slot2.fine.format('HH:mm'),
                    }
                  : undefined,
                slot3: t.slot3
                  ? {
                      inizio: t.slot3.inizio.format('HH:mm'),
                      fine: t.slot3.fine.format('HH:mm'),
                    }
                  : undefined,
                note: t.note,
              } as ShiftData);
            } catch {
              setCalendarError('Errore di accesso al calendario');
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
  }, [storageKey]);

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
    setEditing(null);
  };

  const handleEdit = (t: Turno) => {
    setEditing(t);
    setUtenteSel(t.user_id);
    setGiorno(t.giorno.format('YYYY-MM-DD'));
    if (['RIPOSO', 'FESTIVO'].includes(t.tipo)) {
      setS1Start('');
      setS1End('');
    } else {
      setS1Start(t.slot1.inizio.format('HH:mm'));
      setS1End(t.slot1.fine.format('HH:mm'));
    }
    setS2Start(t.slot2 ? t.slot2.inizio.format('HH:mm') : '');
    setS2End(t.slot2 ? t.slot2.fine.format('HH:mm') : '');
    setS3Start(t.slot3 ? t.slot3.inizio.format('HH:mm') : '');
    setS3End(t.slot3 ? t.slot3.fine.format('HH:mm') : '');
    setTipo(t.tipo);
    setNote(t.note || '');
  };

  /* --- submit --- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ferieLike = ['RIPOSO', 'FESTIVO'].includes(tipo);
    if (!giorno || (!ferieLike && (!s1Start || !s1End)) || !utenteSel) return;

    const payload: NewTurnoPayload & { id?: string } = {
      ...(editing ? { id: editing.id } : {}),
      user_id: utenteSel,
      giorno: dayjs(giorno),
      slot1: ferieLike
        ? { inizio: dayjs(`${giorno}T00:00`), fine: dayjs(`${giorno}T00:00`) }
        : {
            inizio: dayjs(`${giorno}T${s1Start}`),
            fine: dayjs(`${giorno}T${s1End}`),
          },
      tipo,
      note: note || undefined,
    };
    if (s2Start && s2End)
      payload.slot2 = {
        inizio: dayjs(`${giorno}T${s2Start}`),
        fine: dayjs(`${giorno}T${s2End}`),
      };
    if (s3Start && s3End)
      payload.slot3 = {
        inizio: dayjs(`${giorno}T${s3Start}`),
        fine: dayjs(`${giorno}T${s3End}`),
      };

    const data = await withOffline(
      () => saveTurno(payload as Turno),
      () => ({ ...(payload as Turno), id: editing?.id || Date.now().toString() })
    );
    let eventIds = editing?.eventIds;
    if (signedIn && !ferieLike) {
      try {
        const email = utenti.find(u => u.id === data.user_id)?.email || '';
        const shift = {
          userEmail: email,
          giorno: data.giorno.format('YYYY-MM-DD'),
          slot1: {
            inizio: data.slot1.inizio.format('HH:mm'),
            fine: data.slot1.fine.format('HH:mm'),
          },
          slot2: data.slot2
            ? {
                inizio: data.slot2.inizio.format('HH:mm'),
                fine: data.slot2.fine.format('HH:mm'),
              }
            : undefined,
          slot3: data.slot3
            ? {
                inizio: data.slot3.inizio.format('HH:mm'),
                fine: data.slot3.fine.format('HH:mm'),
              }
            : undefined,
          note: data.note,
        } as ShiftData;
        if (editing && eventIds && eventIds.length) {
          const slots = [shift.slot1, shift.slot2, shift.slot3].filter(Boolean) as any[];
          for (let i = 0; i < Math.min(eventIds.length, slots.length); i++) {
            await updateEvent(calendarId, eventIds[i], {
              summary: shift.userEmail,
              description: shift.note,
              start: { dateTime: `${shift.giorno}T${slots[i].inizio}` },
              end: { dateTime: `${shift.giorno}T${slots[i].fine}` },
            });
          }
        } else {
          eventIds = await createShiftEvents(calendarId, shift);
        }
      } catch {
        setCalendarError('Errore di accesso al calendario');
      }
    }
    const newData = { ...data, eventIds };
    setTurni(prev => {
      const updated = prev.some(t => t.id === newData.id)
        ? prev.map(t => (t.id === newData.id ? newData : t))
        : [...prev, newData];
      saveLocal(updated);
      return updated;
    });
    setEditing(null);
    resetForm();
  };

  /* --- delete --- */
  const handleDelete = async (id: string) => {
    const turno = turni.find(t => t.id === id);
    if (signedIn && turno?.eventIds) {
      for (const evId of turno.eventIds) {
        try {
          await deleteEvent(calendarId, evId);
        } catch {
          setCalendarError('Errore di accesso al calendario');
        }
      }
    }
    await withoutResult(() => deleteTurno(id));
    setTurni(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveLocal(updated);
      return updated;
    });
  };

  const handleDownloadPdf = async () => {
    const week = format(new Date(), "RRRR-'W'II");
    try {
      const { blob, warning } = await getSchedulePdf(week);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      if (warning) setPdfWarning(warning);
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
      {calendarError && <p className="error">{calendarError}</p>}
      {pdfWarning && <p className="warning">{pdfWarning}</p>}

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
            <tr style={{ fontFamily: 'Cormorant Garamond, serif', color: '#000' }}>
              <th>Utente</th>
              <th>Data</th>
              <th>Mattino (inizio)</th>
              <th>Mattino (fine)</th>
              <th>Pomeriggio/serale (inizio)</th>
              <th>Pomeriggio/serale (fine)</th>
              <th>Straordinario (inizio)</th>
              <th>Straordinario (fine)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {turni.map(t => {
              const nome =
                utenti.find(u => u.id === t.user_id)?.nome ||
                stripDomain(utenti.find(u => u.id === t.user_id)?.email || '');
              const ferieLike = ['RIPOSO', 'FESTIVO'].includes(t.tipo);
              return (
                <tr key={t.id}>
                  <td>{nome}</td>
                  <td>{t.giorno.format('YYYY-MM-DD')}</td>
                  <td>{ferieLike ? t.tipo : t.slot1.inizio.format('HH:mm')}</td>
                  <td>{ferieLike ? '—' : t.slot1.fine.format('HH:mm')}</td>
                  <td>{ferieLike ? '—' : t.slot2 ? t.slot2.inizio.format('HH:mm') : '—'}</td>
                  <td>{ferieLike ? '—' : t.slot2 ? t.slot2.fine.format('HH:mm') : '—'}</td>
                  <td>{ferieLike ? '—' : t.slot3 ? t.slot3.inizio.format('HH:mm') : '—'}</td>
                  <td>{ferieLike ? '—' : t.slot3 ? t.slot3.fine.format('HH:mm') : '—'}</td>
                  <td>
                    <button onClick={() => handleEdit(t)}>Modifica</button>
                    <button onClick={() => handleDelete(t.id)}>🗑️</button>
                  </td>
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
                : `${t.slot1.inizio.format('HH:mm')}–${t.slot1.fine.format('HH:mm')}`;
              const slot2 = ferieLike
                ? '—'
                : t.slot2
                ? `${t.slot2.inizio.format('HH:mm')}–${t.slot2.fine.format('HH:mm')}`
                : '—';
              const slot3Text = ferieLike
                ? '—'
                : t.slot3
                ? `${t.slot3.inizio.format('HH:mm')}–${t.slot3.fine.format('HH:mm')}`
                : '—';
              return (
                <tr key={t.id}>
                  <td>{nome}</td>
                  <td>{t.giorno.format('YYYY-MM-DD')}</td>
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
