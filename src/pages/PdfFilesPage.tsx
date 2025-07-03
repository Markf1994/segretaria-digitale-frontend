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

  return (
    <div className="list-page">
      <h2>PDF</h2>
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
              <td className="desc-cell">{p.name}</td>
              <td>
                <button onClick={() => downloadPdf(p.id)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
