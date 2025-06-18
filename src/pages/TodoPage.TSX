import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [descrizione, setDescrizione] = useState('');
  const [scadenza, setScadenza] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await api.get('/todo');
    setTodos(res.data);
  };

  const addTodo = async () => {
    if (!descrizione || !scadenza) return;
    await api.post('/todo', { descrizione, scadenza });
    setDescrizione('');
    setScadenza('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await api.delete(`/todo/${id}`);
    fetchTodos();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">To Do List</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Descrizione"
        value={descrizione}
        onChange={e => setDescrizione(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="date"
        value={scadenza}
        onChange={e => setScadenza(e.target.value)}
      />
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={addTodo}
      >
        Aggiungi
      </button>
      <ul className="mt-4">
        {todos.map(todo => (
          <li key={todo.id} className="flex justify-between items-center mb-2">
            <span>{todo.descrizione} - {new Date(todo.scadenza).toLocaleDateString()}</span>
            <button
              className="bg-red-600 text-white px-2 py-1 rounded"
              onClick={() => deleteTodo(todo.id)}
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}