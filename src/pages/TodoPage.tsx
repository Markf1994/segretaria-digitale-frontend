import React, { useEffect, useState } from 'react';
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../api/todos';
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
          const data = await listTodos();
          setTodos(data);
          saveLocal(data);
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
          const res = await updateTodo(edit, { text, due });
          const updated = todos.map(t => (t.id === edit ? res : t));
          setTodos(updated);
          saveLocal(updated);
        } catch {
          const updated = todos.map(t =>
            t.id === edit ? { ...t, text, due } : t
          );
          setTodos(updated);
          saveLocal(updated);
        }
      } else {
        const updated = todos.map(t =>
          t.id === edit ? { ...t, text, due } : t
        );
        setTodos(updated);
        saveLocal(updated);
      }
    } else {
      if (navigator.onLine) {
        try {
          const res = await createTodo({ text, due });
          const updated = [...todos, res];
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
        await deleteTodo(id);
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
        <label htmlFor="todo-text">Attività</label>
        <input id="todo-text" placeholder="Attività" value={text} onChange={e => setText(e.target.value)} />
        <label htmlFor="todo-due">Scadenza</label>
        <input id="todo-due" type="date" value={due} onChange={e => setDue(e.target.value)} />
        <button type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button type="button" onClick={reset}>Annulla</button>}
      </form>
      <table className="item-table">
        <thead>
          <tr>
            <th>Attività</th>
            <th>Scadenza</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {todos.map(t => (
            <tr key={t.id}>
              <td>{t.text}</td>
              <td>{new Date(t.due).toLocaleDateString()}</td>
              <td>
                <button onClick={() => onEdit(t)}>Modifica</button>
                <button onClick={() => onDelete(t.id)}>Elimina</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
