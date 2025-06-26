import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import './ListPages.css';

interface TodoItem { id: string; text: string; due: string; }

export default function TodoPage() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [edit, setEdit] = useState<string | null>(null);

  const reset = () => { setText(''); setDue(''); setEdit(null); };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !due) return;
    if (edit) {
      setTodos(todos.map(t => t.id === edit ? { ...t, text, due } : t));
    } else {
      setTodos([...todos, { id: Date.now().toString(), text, due }]);
    }
    reset();
  };

  const onEdit = (t: TodoItem) => { setEdit(t.id); setText(t.text); setDue(t.due); };
  const onDelete = (id: string) => setTodos(todos.filter(t => t.id !== id));

  return (
    <div className="list-page">
      <h2>To-Do</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input placeholder="Attività" value={text} onChange={e => setText(e.target.value)} />
        <input type="date" value={due} onChange={e => setDue(e.target.value)} />
        <button type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button type="button" onClick={reset}>Annulla</button>}
      </form>
      <ul className="item-list">
        {todos.map(t => (
          <li key={t.id}>
            <span>{t.text} – {new Date(t.due).toLocaleDateString()}</span>
            <div>
              <button onClick={() => onEdit(t)}>Modifica</button>
              <button onClick={() => onDelete(t.id)}>Elimina</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
