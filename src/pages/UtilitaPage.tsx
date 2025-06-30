import React, { useEffect, useState } from 'react';
import { listPDFs, uploadPDF } from '../api/pdfs';
import { listFiles, signIn as signInDrive } from '../api/googleDrive';
import type { PDFFile, DriveFile } from '../api/types';
import './ListPages.css';

export default function UtilitaPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const data = await listPDFs();
        setPdfs(data);
      } catch {
        // ignore errors fetching PDFs
      }
    };
    fetchPdfs();
  }, []);

  useEffect(() => {
    const fetchDrive = async () => {
      try {
        await signInDrive();
        const data = await listFiles();
        setDriveFiles(data);
      } catch {
        // ignore errors with Google Drive
      }
    };
    if (navigator.onLine) fetchDrive();
  }, []);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadPDF(file);
      setPdfs(p => [...p, uploaded]);
    } catch {
      // ignore upload errors
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="list-page">
      <h2>Utilità</h2>
      <form className="item-form">
        <input
          data-testid="pdf-input"
          type="file"
          accept="application/pdf"
          onChange={onChange}
        />
      </form>
      <ul className="item-list">
        {pdfs.map(p => (
          <li key={p.id}>
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              {p.name}
            </a>
          </li>
        ))}
      </ul>
      <div className="drive-files">
        {driveFiles.map(f => (
          <div key={f.id}>
            <a href={f.url} target="_blank" rel="noopener noreferrer">
              {f.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
