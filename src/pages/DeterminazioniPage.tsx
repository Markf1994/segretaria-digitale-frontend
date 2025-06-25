import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function DeterminazioniPage() {
  const [determinazioni, setDeterminazioni] = useState([]);
  const [capitolo, setCapitolo] = useState('');
  const [numero, setNumero] = useState('');
  const [somma, setSomma] = useState('');
  const [scadenza, setScadenza] = useState('');

  useEffect(() => {
    fetchDeterminazioni();
  }, []);

  const fetchDeterminazioni = async () => {
    const res = await api.get('/determinazioni');
    setDeterminazioni(res.data);
  };

  const addDeterminazione = async () => {
    if (!capitolo || !numero || !somma || !scadenza) return;
    await api.post('/determinazioni', { capitolo, numero, somma: parseFloat(somma), scadenza });
    setCapitolo('');
    setNumero('');
    setSomma('');
    setScadenza('');
    fetchDeterminazioni();
  };

  const deleteDeterminazione = async (id) => {
    await api.delete(`/determinazioni/${id}`);
    fetchDeterminazioni();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Determinazioni</h2>
      <input
        className="border p-2 w-full mb-2"
        placeholder="Capitolo"
        value={capitolo}
        onChange={e => setCapitolo(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        placeholder="Numero"
        value={numero}
        onChange={e => setNumero(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="number"
        placeholder="Somma"
        value={somma}
        onChange={e => setSomma(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-2"
        type="date"
        value={scadenza}
        onChange={e => setScadenza(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={addDeterminazione}
      >
        Aggiungi
      </button>
      <ul className="mt-4">
        {determinazioni.map(det => (
          <li key={det.id} className="flex justify-between items-center mb-2">
            <span>
              Capitolo: {det.capitolo}, Numero: {det.numero}, Somma: {det.somma}, Scadenza: {new Date(det.scadenza).toLocaleDateString()}
            </span>
            <button
              className="bg-red-600 text-white px-2 py-1 rounded"
              onClick={() => deleteDeterminazione(det.id)}
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}