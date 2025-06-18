import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNotificheStore } from '../store/notifiche';

export default function Dashboard() {
  const [eventi, setEventi] = useState([]);
  const [todos, setTodos] = useState([]);
  const [determinazioni, setDeterminazioni] = useState([]);
  const setCount = useNotificheStore(s => s.setCount);

  useEffect(() => {
    const fetchData = async () => {
      const [eRes, tRes, dRes] = await Promise.all([
        api.get('/events'),
        api.get('/todo'),
        api.get('/determinazioni'),
      ]);
      setEventi(eRes.data);
      setTodos(tRes.data);
      setDeterminazioni(dRes.data);

      const notCount = eRes.data.length + tRes.data.length + dRes.data.length;
      setCount(notCount);
    };
    fetchData();
  }, [setCount]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <section className="mb-6">
        <h3 className="font-semibold">Eventi</h3>
        {eventi.length === 0 ? (
          <p>Nessun evento programmato</p>
        ) : (
          <ul>
            {eventi.map((e) => (
              <li key={e.id}>{e.titolo} - {new Date(e.data_ora).toLocaleString()}</li>
            ))}
          </ul>
        )}
      </section>
      <section className="mb-6">
        <h3 className="font-semibold">To Do</h3>
        {todos.length === 0 ? (
          <p>Nessuna attività da fare</p>
        ) : (
          <ul>
            {todos.map((t) => (
              <li key={t.id}>{t.descrizione} - {new Date(t.scadenza).toLocaleDateString()}</li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h3 className="font-semibold">Determinazioni</h3>
        {determinazioni.length === 0 ? (
          <p>Nessuna determinazione inserita</p>
        ) : (
          <ul>
            {determinazioni.map((d) => (
              <li key={d.id}>
                Capitolo: {d.capitolo}, Numero: {d.numero}, Somma: {d.somma}, Scadenza: {new Date(d.scadenza).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}