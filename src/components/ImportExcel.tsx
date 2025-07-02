import React, { useRef, useState } from 'react';
import api from '../api/axios';

export default function ImportExcel({
  onComplete,
}: {
  onComplete?: (success: boolean) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const onChoose = () => fileInput.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setMessage('');
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/import/xlsx', form, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, '_blank');
      setMessage('File importato correttamente');
      onComplete?.(true);
    } catch (err) {
      console.error(err);
      setMessage('Errore durante l\'import');
      onComplete?.(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={onChoose} disabled={busy} style={{ marginBottom: '1rem' }}>
        {busy ? 'Caricamento…' : 'Importa Excel'}
      </button>
      {message && (
        <p className={message.startsWith('Errore') ? 'error' : 'success-message'}>
          {message}
        </p>
      )}
      <input
        ref={fileInput}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={onFile}
      />
    </>
  );
}
