import React, { useEffect, useState } from 'react';
import { listPDFs } from '../api/pdfs';
import { signIn as driveSignIn, listDriveFiles } from '../api/googleDrive';
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
    const fetchDrive = async () => {
      try {
        await driveSignIn('plcastionedellapresolana@gmail.com');
        const data = await listDriveFiles();
        setDriveFiles(data);
      } catch {
        // ignore errors fetching Drive files
      }
    };
    fetchPdfs();
    fetchDrive();
  }, []);


  return (
    <div className="list-page">
      <h2>Utilità</h2>
      <ul className="item-list">
        {driveFiles.map(f => (
          <li key={`drive-${f.id}`}>{f.name}</li>
        ))}
        {pdfs.map(p => (
          <li key={p.id}>
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              {p.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
