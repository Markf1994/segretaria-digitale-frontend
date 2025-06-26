import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './ListPages.css';

interface Determination { id: string; title: string; due: string; }

const DeterminationsPage: React.FC = () => {
  const [items, setItems] = useLocalStorage<Determination[]>('determinations', []);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [edit, setEdit] = useState<string | null>(null);

  const reset = () => { setTitle(''); setDue(''); setEdit(null); };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !due) return;
    if (edit) {
      setItems(items.map(d => d.id === edit ? { ...d, title, due } : d));
    } else {
      setItems([...items, { id: Date.now().toString(), title, due }]);
    }
    reset();
  };

  const onEdit = (d: Determination) => { setEdit(d.id); setTitle(d.title); setDue(d.due); };
  const onDelete = (id: string) => setItems(items.filter(d => d.id !== id));

  return (
    <div className="list-page">
      <h2>Determine</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input placeholder="Titolo" value={title} onChange={e => setTitle(e.target.value)} />
        <input type="date" value={due} onChange={e => setDue(e.target.value)} />
        <button type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button type="button" onClick={reset}>Annulla</button>}
      </form>
      <ul className="item-list">
        {items.map(d => (
          <li key={d.id}>
            <span>{d.title} – {new Date(d.due).toLocaleDateString()}</span>
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
