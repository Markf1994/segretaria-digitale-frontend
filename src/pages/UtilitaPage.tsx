import React, { useEffect, useState } from 'react';
import { listPDFs } from '../api/pdfs';
import type { PDFFile } from '../api/types';
import './ListPages.css';

export default function UtilitaPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);

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


  return (
    <div className="list-page">
      <h2>Utilità</h2>
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
