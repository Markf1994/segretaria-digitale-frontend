import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './ListPages.css';

interface Determination {
  id: string;
  capitolo: string;
  numero: string;
  somma: number;
  scadenza: string;
}

const DeterminationsPage: React.FC = () => {
  const [items, setItems] = useLocalStorage<Determination[]>('determinations', []);
  const [capitolo, setCapitolo] = useState('');
  const [numero, setNumero] = useState('');
  const [somma, setSomma] = useState('');
  const [scadenza, setScadenza] = useState('');
  const [edit, setEdit] = useState<string | null>(null);

  const reset = () => {
    setCapitolo('');
    setNumero('');
    setSomma('');
    setScadenza('');
    setEdit(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capitolo || !numero || !somma || !scadenza) return;
    if (edit) {
      setItems(items.map(d =>
        d.id === edit
          ? {
              ...d,
              capitolo,
              numero,
              somma: parseFloat(somma),
              scadenza,
            }
          : d
      ));
    } else {
      setItems([
        ...items,
        {
          id: Date.now().toString(),
          capitolo,
          numero,
          somma: parseFloat(somma),
          scadenza,
        },
      ]);
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
  const onDelete = (id: string) => setItems(items.filter(d => d.id !== id));

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
