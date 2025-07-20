import React, { useEffect, useState } from 'react'
import './ListPages.css'
import {
  listYears,
  listByYear,
  createWork,
  updateWork,
  deleteWork,
  getPdf,
  Work,
} from '../api/works'

export default function WorksPage() {
  const [years, setYears] = useState<number[]>([])
  const [year, setYear] = useState('')
  const [works, setWorks] = useState<Work[]>([])
  const [desc, setDesc] = useState('')
  const [company, setCompany] = useState('')
  const [edit, setEdit] = useState<string | null>(null)

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const y = await listYears()
        setYears(y)
      } catch {
        // ignore
      }
    }
    fetchYears()
  }, [])

  useEffect(() => {
    if (!year) return
    const fetchWorks = async () => {
      try {
        const w = await listByYear(Number(year))
        setWorks(w)
      } catch {
        setWorks([])
      }
    }
    fetchWorks()
  }, [year])

  const reset = () => {
    setDesc('')
    setCompany('')
    setEdit(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!year || !desc) return
    const payload = { descrizione: desc, azienda: company || undefined }
    let res: Work
    if (edit) {
      res = await updateWork(edit, payload)
      setWorks(works.map(w => (w.id === edit ? res : w)))
    } else {
      res = await createWork({ ...payload })
      setWorks([...works, res])
    }
    reset()
  }

  const onDelete = async (id: string) => {
    await deleteWork(id)
    setWorks(works.filter(w => w.id !== id))
  }

  const onPdf = async () => {
    if (!year) return
    const blob = await getPdf(Number(year))
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (win) {
      win.addEventListener('load', () => URL.revokeObjectURL(url))
    } else {
      setTimeout(() => URL.revokeObjectURL(url))
    }
  }

  return (
    <div className="list-page">
      <h2>Lavori</h2>
      <div>
        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value="">Seleziona anno</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button onClick={onPdf} disabled={!year}>PDF</button>
      </div>
      {year && (
        <>
          <form onSubmit={onSubmit} className="item-form">
            <input
              placeholder="Descrizione"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              data-testid="work-desc"
            />
            <input
              placeholder="Azienda (opzionale)"
              value={company}
              onChange={e => setCompany(e.target.value)}
              data-testid="work-company"
            />
            <button type="submit" data-testid="work-submit">
              {edit ? 'Salva' : 'Aggiungi'}
            </button>
            {edit && (
              <button type="button" onClick={reset} data-testid="work-cancel">
                Annulla
              </button>
            )}
          </form>
          <table className="item-table">
            <thead>
              <tr>
                <th>Descrizione</th>
                <th>Azienda</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {works.map(w => (
                <tr key={w.id}>
                  <td className="desc-cell">{w.descrizione}</td>
                  <td>{w.azienda}</td>
                  <td>
                    <button onClick={() => {setEdit(w.id);setDesc(w.descrizione);setCompany(w.azienda || '')}}>Modifica</button>
                    <button onClick={() => onDelete(w.id)}>Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
