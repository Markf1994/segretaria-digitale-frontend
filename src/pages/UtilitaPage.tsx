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
      <div className="meeting-links">
        <a
          href="https://meet.google.com/landing?pli=1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/meet.png" alt="Google Meet" />
        </a>
        <a
          href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=5e3ce6c0-2b1f-4285-8d4b-75ee78787346&scope=openId%20profile%20openid%20offline_access&redirect_uri=https%3A%2F%2Fteams.microsoft.com%2Fv2&client-request-id=0197c2c9-22ca-7789-a2e1-6168143993df&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=3.28.1&client_info=1&code_challenge=OEznWaAeaUqI6XVtFii8r0yzDNev1PjfzNRaqzUKTcw&code_challenge_method=S256&nonce=0197c2c9-22cb-7ad6-ae27-1b8f6901ff0b&state=eyJpZCI6IjAxOTdjMmM5LTIyY2ItN2U3MC1iYTUyLWI0OGVmNmE1Y2UxNyIsIm1ldGEiOnsiaW50ZXJhY3Rpb25UeXBlIjoicmVkaXJlY3QifX0%3D%7Chttps%3A%2F%2Fteams.microsoft.com%2Fv2%2F%3Fenablemcasfort21%3Dtrue&sso_reload=true"
          target="_blank"
          rel="noopener noreferrer"
        >
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
