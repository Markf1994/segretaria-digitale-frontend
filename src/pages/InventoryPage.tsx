import React, { useEffect, useState } from 'react'
import './ListPages.css'
import Modal from '../components/ui/modal'
import {
  listDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  Device,
} from '../api/devices'
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
import {
  listHorizontalSignage,
  createHorizontalSignage,
  updateHorizontalSignage,
  deleteHorizontalSignage,
  getHorizontalSignagePdf,
  HorizontalSign,
} from '../api/horizontalSignage'

const InventoryPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [devName, setDevName] = useState('')
  const [devNotes, setDevNotes] = useState('')
  const [devSearch, setDevSearch] = useState('')
  const [devEdit, setDevEdit] = useState<string | null>(null)

  const [temps, setTemps] = useState<TemporarySign[]>([])
  const [tempLuogo, setTempLuogo] = useState('')
  const [tempFine, setTempFine] = useState('')
  const [tempSearch, setTempSearch] = useState('')
  const [tempEdit, setTempEdit] = useState<string | null>(null)

  const [verticals, setVerticals] = useState<VerticalSign[]>([])
  const [vertLuogo, setVertLuogo] = useState('')
  const [vertDesc, setVertDesc] = useState('')
  const [vertSearch, setVertSearch] = useState('')
  const [vertEdit, setVertEdit] = useState<string | null>(null)

  const [horizontals, setHorizontals] = useState<HorizontalSign[]>([])
  const [horLuogo, setHorLuogo] = useState('')
  const [horData, setHorData] = useState('')
  const [horSearch, setHorSearch] = useState('')
  const [horEdit, setHorEdit] = useState<string | null>(null)
  const [pdfYear, setPdfYear] = useState('')

  const [showDevModal, setShowDevModal] = useState(false)
  const [showTempModal, setShowTempModal] = useState(false)
  const [showVertModal, setShowVertModal] = useState(false)
  const [showHorModal, setShowHorModal] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const d = await listDevices()
        setDevices(d)
        localStorage.setItem('devices', JSON.stringify(d))
      } catch {
        const stored = localStorage.getItem('devices')
        if (stored) setDevices(JSON.parse(stored))
      }

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

      try {
        const h = await listHorizontalSignage()
        setHorizontals(h)
        localStorage.setItem('horizontals', JSON.stringify(h))
      } catch {
        const stored = localStorage.getItem('horizontals')
        if (stored) setHorizontals(JSON.parse(stored))
      }
    }
    fetchAll()
  }, [])

  const saveDevices = (d: Device[]) => localStorage.setItem('devices', JSON.stringify(d))
  const saveTemps = (t: TemporarySign[]) => localStorage.setItem('temps', JSON.stringify(t))
  const saveVerticals = (v: VerticalSign[]) => localStorage.setItem('verticals', JSON.stringify(v))
  const saveHorizontals = (h: HorizontalSign[]) => localStorage.setItem('horizontals', JSON.stringify(h))

  const resetDevice = () => { setDevName(''); setDevNotes(''); setDevEdit(null) }
  const resetTemp = () => { setTempLuogo(''); setTempFine(''); setTempEdit(null) }
  const resetVert = () => { setVertLuogo(''); setVertDesc(''); setVertEdit(null) }
  const resetHor = () => { setHorLuogo(''); setHorData(''); setHorEdit(null) }

  const submitDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!devName) return
    if (devEdit) {
      const res = await updateDevice(devEdit, { nome: devName, note: devNotes })
      const updated = devices.map(d => d.id === devEdit ? res : d)
      setDevices(updated)
      saveDevices(updated)
    } else {
      const res = await createDevice({ nome: devName, note: devNotes })
      const updated = [...devices, res]
      setDevices(updated)
      saveDevices(updated)
    }
    resetDevice()
    setShowDevModal(false)
  }

  const submitTemp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempLuogo || !tempFine) return
    if (tempEdit) {
      const res = await updateTemporarySignage(tempEdit, { luogo: tempLuogo, fine_validita: tempFine, note: '' })
      const updated = temps.map(t => t.id === tempEdit ? res : t)
      setTemps(updated)
      saveTemps(updated)
    } else {
      const res = await createTemporarySignage({ luogo: tempLuogo, fine_validita: tempFine, note: '' })
      const updated = [...temps, res]
      setTemps(updated)
      saveTemps(updated)
    }
    resetTemp()
    setShowTempModal(false)
  }

  const submitVert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vertLuogo || !vertDesc) return
    if (vertEdit) {
      const res = await updateVerticalSignage(vertEdit, { luogo: vertLuogo, descrizione: vertDesc })
      const updated = verticals.map(v => v.id === vertEdit ? res : v)
      setVerticals(updated)
      saveVerticals(updated)
    } else {
      const res = await createVerticalSignage({ luogo: vertLuogo, descrizione: vertDesc })
      const updated = [...verticals, res]
      setVerticals(updated)
      saveVerticals(updated)
    }
    resetVert()
    setShowVertModal(false)
  }

  const submitHor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!horLuogo || !horData) return
    if (horEdit) {
      const res = await updateHorizontalSignage(horEdit, { luogo: horLuogo, data: horData })
      const updated = horizontals.map(h => h.id === horEdit ? res : h)
      setHorizontals(updated)
      saveHorizontals(updated)
    } else {
      const res = await createHorizontalSignage({ luogo: horLuogo, data: horData })
      const updated = [...horizontals, res]
      setHorizontals(updated)
      saveHorizontals(updated)
    }
    resetHor()
    setShowHorModal(false)
  }

  const onPdf = async () => {
    if (!pdfYear) return
    const blob = await getHorizontalSignagePdf(Number(pdfYear))
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="list-page">
      <div>
        <h2>Dispositivi</h2>
        <button type="button" onClick={() => { resetDevice(); setShowDevModal(true) }}>Aggiungi</button>
        <input placeholder="Cerca" value={devSearch} onChange={e => setDevSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Nome</th><th>Note</th><th></th></tr>
          </thead>
          <tbody>
            {devices.filter(d => d.nome.toLowerCase().includes(devSearch.toLowerCase())).map(d => (
              <tr key={d.id}>
                <td>{d.nome}</td>
                <td>{d.note}</td>
                <td>
                  <button onClick={() => { setDevEdit(d.id); setDevName(d.nome); setDevNotes(d.note || ''); setShowDevModal(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteDevice(d.id); const u = devices.filter(x => x.id !== d.id); setDevices(u); saveDevices(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={showDevModal} onClose={() => { setShowDevModal(false); resetDevice() }}>
          <form onSubmit={submitDevice} className="item-form">
            <input data-testid="dev-name" placeholder="Nome" value={devName} onChange={e => setDevName(e.target.value)} />
            <input data-testid="dev-notes" placeholder="Note" value={devNotes} onChange={e => setDevNotes(e.target.value)} />
            <button data-testid="dev-submit" type="submit">{devEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="dev-cancel" type="button" onClick={() => { setShowDevModal(false); resetDevice() }}>Annulla</button>
          </form>
        </Modal>
      </div>

      <div>
        <h2>Segnaletica Temporanea</h2>
        <button type="button" onClick={() => { resetTemp(); setShowTempModal(true) }}>Aggiungi</button>
        <input placeholder="Cerca" value={tempSearch} onChange={e => setTempSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Luogo</th><th>Fine validità</th><th></th></tr>
          </thead>
          <tbody>
            {temps.filter(t => t.luogo.toLowerCase().includes(tempSearch.toLowerCase())).map(t => (
              <tr key={t.id}>
                <td>{t.luogo}</td>
                <td>{t.fine_validita}</td>
                <td>
                  <button onClick={() => { setTempEdit(t.id); setTempLuogo(t.luogo); setTempFine(t.fine_validita); setShowTempModal(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteTemporarySignage(t.id); const u = temps.filter(x => x.id !== t.id); setTemps(u); saveTemps(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={showTempModal} onClose={() => { setShowTempModal(false); resetTemp() }}>
          <form onSubmit={submitTemp} className="item-form">
            <input data-testid="temp-luogo" placeholder="Luogo" value={tempLuogo} onChange={e => setTempLuogo(e.target.value)} />
            <input data-testid="temp-fine" type="date" value={tempFine} onChange={e => setTempFine(e.target.value)} />
            <button data-testid="temp-submit" type="submit">{tempEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="temp-cancel" type="button" onClick={() => { setShowTempModal(false); resetTemp() }}>Annulla</button>
          </form>
        </Modal>
      </div>

      <div>
        <h2>Segnaletica Verticale</h2>
        <button type="button" onClick={() => { resetVert(); setShowVertModal(true) }}>Aggiungi</button>
        <input placeholder="Cerca" value={vertSearch} onChange={e => setVertSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Luogo</th><th>Descrizione</th><th></th></tr>
          </thead>
          <tbody>
            {verticals.filter(v => v.luogo.toLowerCase().includes(vertSearch.toLowerCase())).map(v => (
              <tr key={v.id}>
                <td>{v.luogo}</td>
                <td>{v.descrizione}</td>
                <td>
                  <button onClick={() => { setVertEdit(v.id); setVertLuogo(v.luogo); setVertDesc(v.descrizione); setShowVertModal(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteVerticalSignage(v.id); const u = verticals.filter(x => x.id !== v.id); setVerticals(u); saveVerticals(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={showVertModal} onClose={() => { setShowVertModal(false); resetVert() }}>
          <form onSubmit={submitVert} className="item-form">
            <input data-testid="vert-luogo" placeholder="Luogo" value={vertLuogo} onChange={e => setVertLuogo(e.target.value)} />
            <input data-testid="vert-desc" placeholder="Descrizione" value={vertDesc} onChange={e => setVertDesc(e.target.value)} />
            <button data-testid="vert-submit" type="submit">{vertEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="vert-cancel" type="button" onClick={() => { setShowVertModal(false); resetVert() }}>Annulla</button>
          </form>
        </Modal>

        <h2>Segnaletica Orizzontale</h2>
        <button type="button" onClick={() => { resetHor(); setShowHorModal(true) }}>Aggiungi</button>
        <input placeholder="Cerca" value={horSearch} onChange={e => setHorSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Luogo</th><th>Data</th><th></th></tr>
          </thead>
          <tbody>
            {horizontals.filter(h => h.luogo.toLowerCase().includes(horSearch.toLowerCase())).map(h => (
              <tr key={h.id}>
                <td>{h.luogo}</td>
                <td>{h.data}</td>
                <td>
                  <button onClick={() => { setHorEdit(h.id); setHorLuogo(h.luogo); setHorData(h.data); setShowHorModal(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteHorizontalSignage(h.id); const u = horizontals.filter(x => x.id !== h.id); setHorizontals(u); saveHorizontals(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={showHorModal} onClose={() => { setShowHorModal(false); resetHor() }}>
          <form onSubmit={submitHor} className="item-form">
            <input data-testid="hor-luogo" placeholder="Luogo" value={horLuogo} onChange={e => setHorLuogo(e.target.value)} />
            <input data-testid="hor-data" type="date" value={horData} onChange={e => setHorData(e.target.value)} />
            <button data-testid="hor-submit" type="submit">{horEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="hor-cancel" type="button" onClick={() => { setShowHorModal(false); resetHor() }}>Annulla</button>
          </form>
        </Modal>
        <div className="pdf-controls">
          <input data-testid="hor-year" placeholder="Anno" value={pdfYear} onChange={e => setPdfYear(e.target.value)} />
          <button data-testid="hor-pdf" type="button" onClick={onPdf}>PDF anno</button>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage
