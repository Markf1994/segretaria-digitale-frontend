import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './ListPages.css';

interface TodoItem { id: string; text: string; due: string; }

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [edit, setEdit] = useState<string | null>(null);

  const reset = () => { setText(''); setDue(''); setEdit(null); };

  const saveLocal = (data: TodoItem[]) => {
    localStorage.setItem('todos', JSON.stringify(data));
  };

  useEffect(() => {
    const fetchTodos = async () => {
      if (navigator.onLine) {
        try {
          const res = await api.get<TodoItem[]>('/todos');
          setTodos(res.data);
          saveLocal(res.data);
          return;
        } catch {
          // use fallback
        }
      }
      const stored = localStorage.getItem('todos');
      if (stored) setTodos(JSON.parse(stored));
    };
    fetchTodos();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !due) return;

    if (edit) {
      if (navigator.onLine) {
        try {
          const res = await api.put<TodoItem>(`/todos/${edit}`, { text, due });
          const updated = todos.map(t => t.id === edit ? res.data : t);
          setTodos(updated);
          saveLocal(updated);
        } catch {
          const updated = todos.map(t => t.id === edit ? { ...t, text, due } : t);
          setTodos(updated);
          saveLocal(updated);
        }
      } else {
        const updated = todos.map(t => t.id === edit ? { ...t, text, due } : t);
        setTodos(updated);
        saveLocal(updated);
      }
    } else {
      if (navigator.onLine) {
        try {
          const res = await api.post<TodoItem>('/todos', { text, due });
          const updated = [...todos, res.data];
          setTodos(updated);
          saveLocal(updated);
        } catch {
          const newItem = { id: Date.now().toString(), text, due };
          const updated = [...todos, newItem];
          setTodos(updated);
          saveLocal(updated);
        }
      } else {
        const newItem = { id: Date.now().toString(), text, due };
        const updated = [...todos, newItem];
        setTodos(updated);
        saveLocal(updated);
      }
    }

    reset();
  };

  const onEdit = (t: TodoItem) => { setEdit(t.id); setText(t.text); setDue(t.due); };
  const onDelete = async (id: string) => {
    if (navigator.onLine) {
      try {
        await api.delete(`/todos/${id}`);
      } catch {
        // ignore
      }
    }
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    saveLocal(updated);
  };

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
