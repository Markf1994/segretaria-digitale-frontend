import React, { useEffect, useState } from 'react'
import './ListPages.css'
import Modal from '../components/ui/Modal'
import {
  listTemporarySignage,
  createTemporarySignage,
  updateTemporarySignage,
  deleteTemporarySignage,
  TemporarySign,
} from '../api/temporarySignage'
import {
  listVerticalSignage,
  createVerticalSignage,
  updateVerticalSignage,
  deleteVerticalSignage,
  VerticalSign,
} from '../api/verticalSignage'

const VerticalTempSignagePage: React.FC = () => {
  const [temps, setTemps] = useState<TemporarySign[]>([])
  const [tempLuogo, setTempLuogo] = useState('')
  const [tempFine, setTempFine] = useState('')
  const [tempDesc, setTempDesc] = useState('')
  const [tempAnno, setTempAnno] = useState('')
  const [tempQuant, setTempQuant] = useState('')
  const [tempSearch, setTempSearch] = useState('')
  const [tempEdit, setTempEdit] = useState<string | null>(null)

  const [verticals, setVerticals] = useState<VerticalSign[]>([])
  const [vertLuogo, setVertLuogo] = useState('')
  const [vertDesc, setVertDesc] = useState('')
  const [vertTipo, setVertTipo] = useState('')
  const [vertAnno, setVertAnno] = useState('')
  const [vertQuant, setVertQuant] = useState('')
  const [vertSearch, setVertSearch] = useState('')
  const [vertEdit, setVertEdit] = useState<string | null>(null)

  const [tempOpen, setTempOpen] = useState(false)
  const [vertOpen, setVertOpen] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const t = await listTemporarySignage()
        setTemps(t)
        localStorage.setItem('temps', JSON.stringify(t))
      } catch {
        const stored = localStorage.getItem('temps')
        if (stored) setTemps(JSON.parse(stored))
      }

      try {
        const v = await listVerticalSignage()
        setVerticals(v)
        localStorage.setItem('verticals', JSON.stringify(v))
      } catch {
        const stored = localStorage.getItem('verticals')
        if (stored) setVerticals(JSON.parse(stored))
      }
    }
    fetchAll()
  }, [])

  const saveTemps = (t: TemporarySign[]) =>
    localStorage.setItem('temps', JSON.stringify(t))
  const saveVerticals = (v: VerticalSign[]) =>
    localStorage.setItem('verticals', JSON.stringify(v))

  const resetTemp = () => {
    setTempLuogo('')
    setTempFine('')
    setTempDesc('')
    setTempAnno('')
    setTempQuant('')
    setTempEdit(null)
    setTempOpen(false)
  }
  const resetVert = () => {
    setVertLuogo('')
    setVertDesc('')
    setVertTipo('')
    setVertAnno('')
    setVertQuant('')
    setVertEdit(null)
    setVertOpen(false)
  }

  const submitTemp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempLuogo || !tempFine) return
    if (tempEdit) {
      const res = await updateTemporarySignage(tempEdit, {
        luogo: tempLuogo,
        fine_validita: tempFine,
        descrizione: tempDesc,
        quantita: tempQuant ? Number(tempQuant) : undefined,
        anno: tempAnno ? Number(tempAnno) : undefined,
      })
      const updated = temps.map(t => (t.id === tempEdit ? res : t))
      setTemps(updated)
      saveTemps(updated)
    } else {
      const res = await createTemporarySignage({
        luogo: tempLuogo,
        fine_validita: tempFine,
        descrizione: tempDesc,
        quantita: tempQuant ? Number(tempQuant) : undefined,
        anno: tempAnno ? Number(tempAnno) : undefined,
      })
      const updated = [...temps, res]
      setTemps(updated)
      saveTemps(updated)
    }
    resetTemp()
    setTempOpen(false)
  }

  const submitVert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vertLuogo || !vertDesc) return
    if (vertEdit) {
      const res = await updateVerticalSignage(vertEdit, {
        luogo: vertLuogo,
        descrizione: vertDesc,
        tipo: vertTipo,
        anno: vertAnno ? Number(vertAnno) : undefined,
        quantita: vertQuant ? Number(vertQuant) : undefined,
      })
      const updated = verticals.map(v => (v.id === vertEdit ? res : v))
      setVerticals(updated)
      saveVerticals(updated)
    } else {
      const res = await createVerticalSignage({
        luogo: vertLuogo,
        descrizione: vertDesc,
        tipo: vertTipo,
        anno: vertAnno ? Number(vertAnno) : undefined,
        quantita: vertQuant ? Number(vertQuant) : undefined,
      })
      const updated = [...verticals, res]
      setVerticals(updated)
      saveVerticals(updated)
    }
    resetVert()
    setVertOpen(false)
  }

  return (
    <div className="list-page">
      <div className="inventory-wrapper">
        <div className="temp-section">
          <h2>Segnaletica Temporanea</h2>
          <button
            type="button"
            onClick={() => {
              resetTemp()
              setTempOpen(true)
            }}
          >
            Aggiungi
          </button>
          <Modal
            open={tempOpen}
            onClose={resetTemp}
            title={tempEdit ? 'Modifica temporanea' : 'Nuova segnaletica'}
          >
            <form onSubmit={submitTemp} className="item-form">
              <input
                data-testid="temp-luogo"
                placeholder="Luogo"
                value={tempLuogo}
                onChange={e => setTempLuogo(e.target.value)}
              />
              <input
                data-testid="temp-fine"
                type="date"
                value={tempFine}
                onChange={e => setTempFine(e.target.value)}
              />
              <input
                data-testid="temp-desc"
                placeholder="Descrizione"
                value={tempDesc}
                onChange={e => setTempDesc(e.target.value)}
              />
              <input
                data-testid="temp-anno"
                type="number"
                placeholder="Anno"
                value={tempAnno}
                onChange={e => setTempAnno(e.target.value)}
              />
              <input
                data-testid="temp-quant"
                type="number"
                placeholder="Quantità"
                value={tempQuant}
                onChange={e => setTempQuant(e.target.value)}
              />
              <button data-testid="temp-submit" type="submit">
                {tempEdit ? 'Salva' : 'Aggiungi'}
              </button>
              <button
                data-testid="temp-cancel"
                type="button"
                onClick={resetTemp}
              >
                Annulla
              </button>
            </form>
          </Modal>
          <input
            placeholder="Cerca"
            value={tempSearch}
            onChange={e => setTempSearch(e.target.value)}
          />
          <table className="item-table">
            <thead>
              <tr>
                <th>Luogo</th>
                <th>Fine validità</th>
                <th>Descrizione</th>
                <th>Anno</th>
                <th>Quantità</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {temps
                .filter(t =>
                  t.luogo.toLowerCase().includes(tempSearch.toLowerCase()),
                )
                .map(t => (
                  <tr key={t.id}>
                    <td>{t.luogo}</td>
                    <td>{t.fine_validita}</td>
                    <td>{t.descrizione}</td>
                    <td>{t.anno}</td>
                    <td>{t.quantita}</td>
                    <td>
                      <button
                        onClick={() => {
                          setTempEdit(t.id)
                          setTempLuogo(t.luogo)
                          setTempFine(t.fine_validita)
                          setTempDesc(t.descrizione || '')
                          setTempAnno(t.anno?.toString() || '')
                          setTempQuant(t.quantita?.toString() || '')
                          setTempOpen(true)
                        }}
                      >
                        Modifica
                      </button>
                      <button
                        onClick={async () => {
                          await deleteTemporarySignage(t.id)
                          const u = temps.filter(x => x.id !== t.id)
                          setTemps(u)
                          saveTemps(u)
                        }}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="vertical-section">
          <h2>Segnaletica Verticale</h2>
          <button
            type="button"
            onClick={() => {
              resetVert()
              setVertOpen(true)
            }}
          >
            Aggiungi
          </button>
          <Modal
            open={vertOpen}
            onClose={resetVert}
            title={vertEdit ? 'Modifica verticale' : 'Nuova segnaletica'}
          >
            <form onSubmit={submitVert} className="item-form">
              <input
                data-testid="vert-luogo"
                placeholder="Luogo"
                value={vertLuogo}
                onChange={e => setVertLuogo(e.target.value)}
              />
              <input
                data-testid="vert-desc"
                placeholder="Descrizione"
                value={vertDesc}
                onChange={e => setVertDesc(e.target.value)}
              />
              <input
                data-testid="vert-tipo"
                placeholder="Tipo"
                value={vertTipo}
                onChange={e => setVertTipo(e.target.value)}
              />
              <input
                data-testid="vert-anno"
                type="number"
                placeholder="Anno"
                value={vertAnno}
                onChange={e => setVertAnno(e.target.value)}
              />
              <input
                data-testid="vert-quant"
                type="number"
                placeholder="Quantità"
                value={vertQuant}
                onChange={e => setVertQuant(e.target.value)}
              />
              <button data-testid="vert-submit" type="submit">
                {vertEdit ? 'Salva' : 'Aggiungi'}
              </button>
              <button
                data-testid="vert-cancel"
                type="button"
                onClick={resetVert}
              >
                Annulla
              </button>
            </form>
          </Modal>
          <input
            placeholder="Cerca"
            value={vertSearch}
            onChange={e => setVertSearch(e.target.value)}
          />
          <table className="item-table">
            <thead>
              <tr>
                <th>Luogo</th>
                <th>Descrizione</th>
                <th>Tipo</th>
                <th>Anno</th>
                <th>Quantità</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {verticals
                .filter(v =>
                  v.luogo.toLowerCase().includes(vertSearch.toLowerCase()),
                )
                .map(v => (
                  <tr key={v.id}>
                    <td>{v.luogo}</td>
                    <td>{v.descrizione}</td>
                    <td>{v.tipo}</td>
                    <td>{v.anno}</td>
                    <td>{v.quantita}</td>
                    <td>
                      <button
                        onClick={() => {
                          setVertEdit(v.id)
                          setVertLuogo(v.luogo)
                          setVertDesc(v.descrizione)
                          setVertTipo(v.tipo || '')
                          setVertAnno(v.anno?.toString() || '')
                          setVertQuant(v.quantita?.toString() || '')
                          setVertOpen(true)
                        }}
                      >
                        Modifica
                      </button>
                      <button
                        onClick={async () => {
                          await deleteVerticalSignage(v.id)
                          const u = verticals.filter(x => x.id !== v.id)
                          setVerticals(u)
                          saveVerticals(u)
                        }}
                      >
                        Elimina
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default VerticalTempSignagePage
