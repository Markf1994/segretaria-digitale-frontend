import React, { useEffect, useState } from 'react';
import {
  listDeterminations,
  createDetermination,
  updateDetermination,
  deleteDetermination,
  Determination,
} from '../api/determinations';
import './ListPages.css';
import useIsMobile from '../hooks/useIsMobile';
import { withOffline, withoutResult } from '../utils/offline';

const DeterminationsPage: React.FC = () => {
  const [items, setItems] = useState<Determination[]>([]);
  const [capitolo, setCapitolo] = useState('');
  const [numero, setNumero] = useState('');
  const [somma, setSomma] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [scadenza, setScadenza] = useState('');
  const [edit, setEdit] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const saveLocal = (data: Determination[]): void => {
    const trimmed = data.map(d => ({
      id: d.id,
      capitolo: d.capitolo,
      numero: d.numero,
      somma: d.somma,
      scadenza: d.scadenza,
      descrizione: d.descrizione,
    }));
    localStorage.setItem('determinations', JSON.stringify(trimmed));
  };

  useEffect(() => {
    const fetchAll = async () => {
      if (navigator.onLine) {
        try {
          const data = await listDeterminations();
          setItems(data);
          saveLocal(data);
          return;
        } catch {
          // ignore
        }
      }
      const stored = localStorage.getItem('determinations');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const mapped = parsed.map((d: any) => ({
            ...d,
            descrizione: d.descrizione ?? d.description ?? '',
          }));
          setItems(mapped as Determination[]);
        } catch {
          // ignore
        }
      }
    };
    fetchAll();
  }, []);

  const reset = () => {
    setCapitolo('');
    setNumero('');
    setSomma('');
    setDescrizione('');
    setScadenza('');
    setEdit(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capitolo || !numero || !somma || !scadenza) return;

    if (edit) {
      const res = await withOffline(
        () =>
          updateDetermination(edit, {
            capitolo,
            numero,
            somma: parseFloat(somma),
            scadenza,
            descrizione,
          }),
        () => ({
          id: edit,
          capitolo,
          numero,
          somma: parseFloat(somma),
          scadenza,
          descrizione,
        })
      );
      const updated = items.map(d => (d.id === edit ? res : d));
      setItems(updated);
      saveLocal(updated);
    } else {
      const res = await withOffline(
        () =>
          createDetermination({
            capitolo,
            numero,
            somma: parseFloat(somma),
            scadenza,
            descrizione,
          }),
        () => ({
          id: Date.now().toString(),
          capitolo,
          numero,
          somma: parseFloat(somma),
          scadenza,
          descrizione,
        })
      );
      const updated = [...items, res];
      setItems(updated);
      saveLocal(updated);
    }

    reset();
  };

  const onEdit = (d: Determination) => {
    setEdit(d.id);
    setCapitolo(d.capitolo);
    setNumero(d.numero);
    setSomma(String(d.somma));
    setDescrizione(d.descrizione || '');
    setScadenza(d.scadenza);
  };
  const onDelete = async (id: string) => {
    await withoutResult(() => deleteDetermination(id));
    const updated = items.filter(d => d.id !== id);
    setItems(updated);
    saveLocal(updated);
  };

  return (
    <div className="list-page">
        <h2>Determine</h2>
        <form onSubmit={onSubmit} className="item-form">
        <input
          id="det-capitolo"
          data-testid="det-capitolo"
          placeholder="Capitolo"
          value={capitolo}
          onChange={e => setCapitolo(e.target.value)}
        />
        <input
          id="det-numero"
          data-testid="det-numero"
          placeholder="Numero"
          value={numero}
          onChange={e => setNumero(e.target.value)}
        />
        <input
          id="det-somma"
          data-testid="det-somma"
          type="number"
          step="0.01"
          placeholder="Somma"
          value={somma}
          onChange={e => setSomma(e.target.value)}
        />
        <textarea
          id="det-descrizione"
          data-testid="det-descrizione"
          placeholder="Descrizione"
          value={descrizione}
          onChange={e => setDescrizione(e.target.value)}
        />
        <label htmlFor="det-scadenza">Scadenza</label>
        <input
          id="det-scadenza"
          data-testid="det-scadenza"
          type="date"
          value={scadenza}
          onChange={e => setScadenza(e.target.value)}
        />
        <button data-testid="det-submit" type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button data-testid="det-cancel" type="button" onClick={reset}>Annulla</button>}
      </form>
      <details className="item-dropdown" open={!isMobile}>
        <summary>{isMobile ? 'Lista Determine salvate' : 'Determine salvate'}</summary>
      <table className="item-table determinations-table">
        <thead>
          <tr>
            <th>Capitolo</th>
            <th>Numero</th>
            <th>Somma</th>
            <th>Descrizione</th>
            <th>Scadenza</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(d => (
            <tr key={d.id}>
              <td className="digit-font">{d.capitolo}</td>
              <td className="digit-font">{d.numero}</td>
              <td className="digit-font">€{d.somma}</td>
              <td className="desc-cell">{d.descrizione}</td>
              <td className="digit-font">{new Date(d.scadenza).toLocaleDateString()}</td>
              <td>
                <button data-testid="det-edit" onClick={() => onEdit(d)}>
                  Modifica
                </button>
                <button data-testid="det-delete" onClick={() => onDelete(d.id)}>
                  Elimina
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </details>
      </div>
  );
};

export default DeterminationsPage;
