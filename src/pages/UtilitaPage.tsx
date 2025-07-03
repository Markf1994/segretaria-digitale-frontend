import React, { useEffect, useState } from 'react';
import { listPdfs } from '../api/pdfs';
import type { PDFFile } from '../api/types';
import './ListPages.css';
import { TEAMS_URL } from '../constants';

export default function UtilitaPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const data = await listPdfs();
        setPdfs(data);
      } catch {
        // ignore errors fetching PDFs
      }
    };
    fetchPdfs();
  }, []);


  return (
    <div className="list-page">
      <h2>Utilità</h2>
      <div className="meeting-links">
        <a
          href="https://meet.google.com/landing?pli=1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/meet.png" alt="Google Meet" />
        </a>
        <a href={TEAMS_URL} target="_blank" rel="noopener noreferrer">
          <img src="/teams.png" alt="Microsoft Teams" />
        </a>
        <a
          href="https://zoom.us/it/signin#/login"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/zoom.png" alt="Zoom" />
        </a>
      </div>
      <ul className="item-list">
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
