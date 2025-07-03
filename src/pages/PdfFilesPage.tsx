import React, { useEffect, useState } from 'react';
import { listPdfs, downloadPdf } from '../api/pdfs';
import type { PDFFile } from '../api/types';
import './ListPages.css';

export default function PdfFilesPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listPdfs();
        setPdfs(data);
      } catch {
        // ignore fetch errors
      }
    };
    fetch();
  }, []);

  const handleDownload = async (id: string) => {
    try {
      const blob = await downloadPdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      // ignore download errors
    }
  };

  return (
    <div className="list-page">
      <h2>File PDF</h2>
      <table className="item-table">
        <thead>
          <tr>
            <th>Titolo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pdfs.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>
                <button onClick={() => handleDownload(p.id)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
