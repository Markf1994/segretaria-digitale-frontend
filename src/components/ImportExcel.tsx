import React, { useRef, useState } from 'react'
import api from '../api/axios'

interface Props {
  onImported?: (turni: any[]) => void
}

export default function ImportExcel({ onImported }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onChoose = () => fileInput.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/import/xlsx', form, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      window.open(url, '_blank')
      try {
        const list = await api.get('/orari/')
        onImported?.(list.data)
      } catch {
        // ignore errors
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={onChoose} disabled={busy} style={{ marginBottom: '1rem' }}>
        {busy ? 'Caricamento…' : 'Importa Excel'}
      </button>
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
