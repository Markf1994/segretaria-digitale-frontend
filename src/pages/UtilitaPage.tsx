import React, { useEffect, useState } from 'react'
import { listPdfs, uploadPdf, PdfFile } from '../api/utilita'
import './ListPages.css'

export default function UtilitaPage() {
  const [items, setItems] = useState<PdfFile[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const isMobile = window.innerWidth <= 600

  const saveLocal = (data: PdfFile[]) => {
    localStorage.setItem('pdfs', JSON.stringify(data))
  }

  useEffect(() => {
    const fetchData = async () => {
      if (navigator.onLine) {
        try {
          const data = await listPdfs()
          setItems(data)
          saveLocal(data)
          return
        } catch {
          // ignore and try local storage
        }
      }
      const stored = localStorage.getItem('pdfs')
      if (stored) {
        try {
          setItems(JSON.parse(stored) as PdfFile[])
        } catch {
          // ignore
        }
      }
    }
    fetchData()
  }, [])

  const reset = () => {
    setFile(null)
    setTitle('')
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    let newItem: PdfFile | null = null
    if (navigator.onLine) {
      try {
        newItem = await uploadPdf(file, title)
      } catch {
        // ignore
      }
    }
    if (!newItem) {
      newItem = {
        id: Date.now().toString(),
        titolo: title,
        url: URL.createObjectURL(file),
      }
    }
    const updated = [...items, newItem]
    setItems(updated)
    saveLocal(updated)
    reset()
  }

  return (
    <div className="list-page">
      <h2>Utilità</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input
          id="util-title"
          placeholder="Titolo"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          id="util-file"
          type="file"
          accept="application/pdf"
          onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
        />
        <button type="submit">Carica</button>
      </form>
      <details className="item-dropdown" open={!isMobile}>
        <summary>{isMobile ? 'Lista PDF caricati' : 'PDF caricati'}</summary>
        <table className="item-table">
          <thead>
            <tr>
              <th>Titolo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id}>
                <td>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.titolo}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
