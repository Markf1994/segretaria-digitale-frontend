import React, { useRef, useState, ChangeEvent } from 'react';
import { importTurniExcel } from '../api/schedule';

interface ImportExcelProps {
  onComplete?: (success: boolean) => void;
}

export default function ImportExcel({ onComplete }: ImportExcelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const chooseFile = () => {
    if (!busy) fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage('');

    try {
      const pdfBlob = await importTurniExcel(file);
      const pdfURL = URL.createObjectURL(pdfBlob);
      const newWindow = window.open(pdfURL, '_blank');
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          URL.revokeObjectURL(pdfURL);
        });
      } else {
        setTimeout(() => URL.revokeObjectURL(pdfURL));
      }
      setMessage('File importato correttamente.');
      onComplete?.(true);
    } catch (error) {
      console.error('ImportExcel error:', error);
      setMessage("Errore durante l'importazione del file");
      onComplete?.(false);
    } finally {
      setBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={chooseFile}
        disabled={busy}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: '#A52019',
          color: '#fff',
          padding: '0.75rem 1rem',
          borderRadius: '9999px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}
      >
        {busy ? 'Caricamento…' : 'Importa Excel'}
      </button>

      {message && (
        <p className={message.startsWith('Errore') ? 'error' : 'success-message'}>
          {message}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
