import React, { useEffect, useState } from 'react';
import {
  listDeterminations,
  createDetermination,
  updateDetermination,
  deleteDetermination,
  Determination,
} from '../api/determinations';
import './ListPages.css';

const DeterminationsPage: React.FC = () => {
  const [items, setItems] = useState<Determination[]>([]);
  const [capitolo, setCapitolo] = useState('');
  const [numero, setNumero] = useState('');
  const [somma, setSomma] = useState('');
  const [scadenza, setScadenza] = useState('');
  const [edit, setEdit] = useState<string | null>(null);

  const saveLocal = (data: Determination[]): void => {
    localStorage.setItem('determinations', JSON.stringify(data));
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
          setItems(JSON.parse(stored) as Determination[]);
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
    setScadenza('');
    setEdit(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capitolo || !numero || !somma || !scadenza) return;

    if (edit) {
      if (navigator.onLine) {
        try {
          const res = await updateDetermination(edit, {
            capitolo,
            numero,
            somma: parseFloat(somma),
            scadenza,
          });
          const updated = items.map(d => (d.id === edit ? res : d));
          setItems(updated);
          saveLocal(updated);
        } catch {
          const updated = items.map(d =>
            d.id === edit
              ? { id: edit, capitolo, numero, somma: parseFloat(somma), scadenza }
              : d
          );
          setItems(updated);
          saveLocal(updated);
        }
      } else {
        const updated = items.map(d =>
          d.id === edit
            ? { id: edit, capitolo, numero, somma: parseFloat(somma), scadenza }
            : d
        );
        setItems(updated);
        saveLocal(updated);
      }
    } else {
      if (navigator.onLine) {
        try {
          const res = await createDetermination({
            capitolo,
            numero,
            somma: parseFloat(somma),
            scadenza,
          });
          const updated = [...items, res];
          setItems(updated);
          saveLocal(updated);
        } catch {
          const newItem: Determination = {
            id: Date.now().toString(),
            capitolo,
            numero,
            somma: parseFloat(somma),
            scadenza,
          };
          const updated = [...items, newItem];
          setItems(updated);
          saveLocal(updated);
        }
      } else {
        const newItem: Determination = {
          id: Date.now().toString(),
          capitolo,
          numero,
          somma: parseFloat(somma),
          scadenza,
        };
        const updated = [...items, newItem];
        setItems(updated);
        saveLocal(updated);
      }
    }

    reset();
  };

  const onEdit = (d: Determination) => {
    setEdit(d.id);
    setCapitolo(d.capitolo);
    setNumero(d.numero);
    setSomma(String(d.somma));
    setScadenza(d.scadenza);
  };
  const onDelete = async (id: string) => {
    if (navigator.onLine) {
      try {
        await deleteDetermination(id);
      } catch {
        // ignore
      }
    }
    const updated = items.filter(d => d.id !== id);
    setItems(updated);
    saveLocal(updated);
  };

  return (
    <div className="list-page">
      <h2>Determine</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input
          placeholder="Capitolo"
          value={capitolo}
          onChange={e => setCapitolo(e.target.value)}
        />
        <input
          placeholder="Numero"
          value={numero}
          onChange={e => setNumero(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Somma"
          value={somma}
          onChange={e => setSomma(e.target.value)}
        />
        <input
          type="date"
          value={scadenza}
          onChange={e => setScadenza(e.target.value)}
        />
        <button type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button type="button" onClick={reset}>Annulla</button>}
      </form>
      <table className="item-table">
        <thead>
          <tr>
            <th>Capitolo</th>
            <th>Numero</th>
            <th>Somma</th>
            <th>Scadenza</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(d => (
            <tr key={d.id}>
              <td>{d.capitolo}</td>
              <td>{d.numero}</td>
              <td>€{d.somma}</td>
              <td>{new Date(d.scadenza).toLocaleDateString()}</td>
              <td>
                <button onClick={() => onEdit(d)}>Modifica</button>
                <button onClick={() => onDelete(d.id)}>Elimina</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeterminationsPage;
