import React, { useEffect, useState, useMemo } from 'react';
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../api/todos';
import { listDeterminations, Determination } from '../api/determinations';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import './ListPages.css';
import { useAuthStore } from '../store/auth';
import { getUserStorageKey } from '../utils/auth';

interface TodoItem {
  id: string;
  text: string;
  due: string;
  readonly?: boolean;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [edit, setEdit] = useState<string | null>(null);
  const isMobile = window.innerWidth <= 600;
  const token = useAuthStore(s => s.token);
  const storageKey = useMemo(
    () => getUserStorageKey('todos', token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)),
    [token]
  );

  const reset = () => { setText(''); setDue(''); setEdit(null); };

  const saveLocal = (data: TodoItem[]) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  useEffect(() => {
    const fetchTodos = async () => {
      let all: TodoItem[] = [];

      if (navigator.onLine) {
        try {
          const data = await listTodos();
          all = data.map(t => ({ id: t.id, text: t.descrizione, due: t.scadenza }));
        } catch {
          // ignore and try local storage
        }
      }

      if (!all.length) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try { all = JSON.parse(stored) as TodoItem[]; } catch {}
        }
      }

      let dets: Determination[] = [];
      if (navigator.onLine) {
        try {
          dets = await listDeterminations();
        } catch {
          // ignore and try local storage
        }
      }
      if (!dets.length) {
        const stored = localStorage.getItem('determinations');
        if (stored) {
          try { dets = JSON.parse(stored) as Determination[]; } catch {}
        }
      }

      const today = new Date();
      const detTodos = dets
        .filter(d => {
          const diff = differenceInCalendarDays(parseISO(d.scadenza), today);
          return diff >= 0 && diff <= 30;
        })
        .map(d => ({
          id: `det-${d.id}`,
          text: `Determina ${d.numero}`,
          due: d.scadenza,
          readonly: true,
        }));

      // remove previous determina reminders to avoid duplicates
      all = all.filter(t => !t.id.startsWith('det-'));
      all = [...all, ...detTodos];

      // ensure unique ids (in case of duplicates from storage)
      const map = new Map(all.map(t => [t.id, t]));
      const unique = Array.from(map.values());
      setTodos(unique);
      saveLocal(unique);
    };
    fetchTodos();
  }, [storageKey]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !due) return;

    if (edit) {
      if (navigator.onLine) {
        try {
          const res = await updateTodo(edit, {
            descrizione: text,
            scadenza: due,
          });
          const updated = todos.map(t =>
            t.id === edit
              ? { id: res.id, text: res.descrizione, due: res.scadenza }
              : t
          );
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
          const res = await createTodo({
            descrizione: text,
            scadenza: due,
          });
          const updated = [
            ...todos,
            { id: res.id, text: res.descrizione, due: res.scadenza },
          ];
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
        <input id="todo-text" data-testid="todo-text" placeholder="Attività" value={text} onChange={e => setText(e.target.value)} />
        <label htmlFor="todo-due">Scadenza</label>
        <input id="todo-due" data-testid="todo-due" type="date" value={due} onChange={e => setDue(e.target.value)} />
        <button data-testid="todo-submit" type="submit">{edit ? 'Salva' : 'Aggiungi'}</button>
        {edit && <button data-testid="todo-cancel" type="button" onClick={reset}>Annulla</button>}
      </form>
      <details className="item-dropdown" open={!isMobile}>
        <summary>{isMobile ? 'Lista to-do salvati' : 'Todo salvati'}</summary>
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
                {!t.readonly && (
                  <>
                    <button data-testid="todo-edit" onClick={() => onEdit(t)}>
                      Modifica
                    </button>
                    <button data-testid="todo-delete" onClick={() => onDelete(t.id)}>
                      Elimina
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </details>
      </div>
  );
}
