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
  const [items, setItems] = useLocalStorage<Determination[]>(
    'determinations-v2',
    []
  );
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
    const parsedSomma = parseFloat(somma);
    if (isNaN(parsedSomma)) return;
    if (edit) {
      setItems(
        items.map(d =>
          d.id === edit
            ? { ...d, capitolo, numero, somma: parsedSomma, scadenza }
            : d
        )
      );
    } else {
      setItems([
        ...items,
        { id: Date.now().toString(), capitolo, numero, somma: parsedSomma, scadenza },
      ]);
    }
    reset();
  };

  const onEdit = (d: Determination) => {
    setEdit(d.id);
    setCapitolo(d.capitolo);
    setNumero(d.numero);
    setSomma(d.somma.toString());
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
          placeholder="Somma"
          value={somma}
          onChange={e => setSomma(e.target.value)}
        />
        <input
          type="datetime-local"
          value={scadenza}
          onChange={e => setScadenza(e.target.value)}
        />
        <button type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button type="button" onClick={reset}>Annulla</button>}
      </form>
      <ul className="item-list">
        {items.map(d => (
          <li key={d.id}>
            <span>
              {d.capitolo}/{d.numero} – {d.somma} –{' '}
              {new Date(d.scadenza).toLocaleString()}
            </span>
            <div>
              <button onClick={() => onEdit(d)}>Modifica</button>
              <button onClick={() => onDelete(d.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DeterminationsPage;
