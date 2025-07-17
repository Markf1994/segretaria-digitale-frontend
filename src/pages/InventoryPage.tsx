import React, { useEffect, useState } from 'react'
import './ListPages.css'
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
  getHorizontalSignagePdf,
  HorizontalSign,
} from '../api/horizontalSignage'
import {
  listHorizontalPlans,
  createHorizontalPlan,
  updateHorizontalPlan,
  deleteHorizontalPlan,
  HorizontalPlan,
} from '../api/horizontalPlans'

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

  const [plans, setPlans] = useState<HorizontalPlan[]>([])
  const [planDescr, setPlanDescr] = useState('')
  const [planYear, setPlanYear] = useState('')
  const [planSearch, setPlanSearch] = useState('')
  const [planEdit, setPlanEdit] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<HorizontalPlan | null>(null)
  const [planInterventions, setPlanInterventions] = useState<HorizontalSign[]>([])
  const planDialog = React.useRef<HTMLDialogElement>(null)
  const intervDialog = React.useRef<HTMLDialogElement>(null)
  const [pdfYear, setPdfYear] = useState('')

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
        const p = await listHorizontalPlans()
        setPlans(p)
        localStorage.setItem('horPlans', JSON.stringify(p))
      } catch {
        const stored = localStorage.getItem('horPlans')
        if (stored) setPlans(JSON.parse(stored))
      }
    }
    fetchAll()
  }, [])

  const saveDevices = (d: Device[]) => localStorage.setItem('devices', JSON.stringify(d))
  const saveTemps = (t: TemporarySign[]) => localStorage.setItem('temps', JSON.stringify(t))
  const saveVerticals = (v: VerticalSign[]) => localStorage.setItem('verticals', JSON.stringify(v))
  const savePlans = (p: HorizontalPlan[]) =>
    localStorage.setItem('horPlans', JSON.stringify(p))

  const resetDevice = () => { setDevName(''); setDevNotes(''); setDevEdit(null) }
  const resetTemp = () => { setTempLuogo(''); setTempFine(''); setTempEdit(null) }
  const resetVert = () => { setVertLuogo(''); setVertDesc(''); setVertEdit(null) }
  const resetPlan = () => { setPlanDescr(''); setPlanYear(''); setPlanEdit(null) }

  const openPlanForm = (p?: HorizontalPlan) => {
    if (p) {
      setPlanEdit(p.id)
      setPlanDescr(p.descrizione)
      setPlanYear(String(p.anno))
    } else {
      resetPlan()
    }
    planDialog.current?.showModal()
  }

  const closePlanForm = () => {
    planDialog.current?.close()
    resetPlan()
  }

  const openInterventions = async (p: HorizontalPlan) => {
    const data = await listHorizontalSignage(p.id)
    setSelectedPlan(p)
    setPlanInterventions(data)
    intervDialog.current?.showModal()
  }

  const closeInterventions = () => {
    intervDialog.current?.close()
    setSelectedPlan(null)
    setPlanInterventions([])
  }

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
  }

  const submitPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planDescr || !planYear) return
    if (planEdit) {
      const res = await updateHorizontalPlan(planEdit, {
        descrizione: planDescr,
        anno: Number(planYear),
      })
      const updated = plans.map(p => (p.id === planEdit ? res : p))
      setPlans(updated)
      savePlans(updated)
    } else {
      const res = await createHorizontalPlan({
        descrizione: planDescr,
        anno: Number(planYear),
      })
      const updated = [...plans, res]
      setPlans(updated)
      savePlans(updated)
    }
    resetPlan()
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
        <form onSubmit={submitDevice} className="item-form">
          <input data-testid="dev-name" placeholder="Nome" value={devName} onChange={e => setDevName(e.target.value)} />
          <input data-testid="dev-notes" placeholder="Note" value={devNotes} onChange={e => setDevNotes(e.target.value)} />
          <button data-testid="dev-submit" type="submit">{devEdit ? 'Salva' : 'Aggiungi'}</button>
          {devEdit && <button data-testid="dev-cancel" type="button" onClick={resetDevice}>Annulla</button>}
        </form>
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
                  <button onClick={() => { setDevEdit(d.id); setDevName(d.nome); setDevNotes(d.note || '') }}>Modifica</button>
                  <button onClick={async () => { await deleteDevice(d.id); const u = devices.filter(x => x.id !== d.id); setDevices(u); saveDevices(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Segnaletica Temporanea</h2>
        <form onSubmit={submitTemp} className="item-form">
          <input data-testid="temp-luogo" placeholder="Luogo" value={tempLuogo} onChange={e => setTempLuogo(e.target.value)} />
          <input data-testid="temp-fine" type="date" value={tempFine} onChange={e => setTempFine(e.target.value)} />
          <button data-testid="temp-submit" type="submit">{tempEdit ? 'Salva' : 'Aggiungi'}</button>
          {tempEdit && <button data-testid="temp-cancel" type="button" onClick={resetTemp}>Annulla</button>}
        </form>
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
                  <button onClick={() => { setTempEdit(t.id); setTempLuogo(t.luogo); setTempFine(t.fine_validita) }}>Modifica</button>
                  <button onClick={async () => { await deleteTemporarySignage(t.id); const u = temps.filter(x => x.id !== t.id); setTemps(u); saveTemps(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Segnaletica Verticale</h2>
        <form onSubmit={submitVert} className="item-form">
          <input data-testid="vert-luogo" placeholder="Luogo" value={vertLuogo} onChange={e => setVertLuogo(e.target.value)} />
          <input data-testid="vert-desc" placeholder="Descrizione" value={vertDesc} onChange={e => setVertDesc(e.target.value)} />
          <button data-testid="vert-submit" type="submit">{vertEdit ? 'Salva' : 'Aggiungi'}</button>
          {vertEdit && <button data-testid="vert-cancel" type="button" onClick={resetVert}>Annulla</button>}
        </form>
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
                  <button onClick={() => { setVertEdit(v.id); setVertLuogo(v.luogo); setVertDesc(v.descrizione) }}>Modifica</button>
                  <button onClick={async () => { await deleteVerticalSignage(v.id); const u = verticals.filter(x => x.id !== v.id); setVerticals(u); saveVerticals(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Segnaletica Orizzontale</h2>
        <button type="button" onClick={() => openPlanForm()}>Nuovo piano</button>
        <input placeholder="Cerca" value={planSearch} onChange={e => setPlanSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Descrizione</th><th>Anno</th><th></th></tr>
          </thead>
          <tbody>
            {plans.filter(p => p.descrizione.toLowerCase().includes(planSearch.toLowerCase())).map(p => (
              <tr key={p.id}>
                <td>{p.descrizione}</td>
                <td>{p.anno}</td>
                <td>
                  <button onClick={() => openPlanForm(p)}>Modifica</button>
                  <button onClick={() => openInterventions(p)}>Vedi interventi</button>
                  <button onClick={async () => { await deleteHorizontalPlan(p.id); const u = plans.filter(x => x.id !== p.id); setPlans(u); savePlans(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pdf-controls">
          <input data-testid="hor-year" placeholder="Anno" value={pdfYear} onChange={e => setPdfYear(e.target.value)} />
          <button data-testid="hor-pdf" type="button" onClick={onPdf}>PDF anno</button>
        </div>
        <dialog ref={planDialog}>
          <form onSubmit={submitPlan} className="item-form">
            <input placeholder="Descrizione" value={planDescr} onChange={e => setPlanDescr(e.target.value)} />
            <input placeholder="Anno" value={planYear} onChange={e => setPlanYear(e.target.value)} />
            <button type="submit">{planEdit ? 'Salva' : 'Aggiungi'}</button>
            <button type="button" onClick={closePlanForm}>Annulla</button>
          </form>
        </dialog>
        <dialog ref={intervDialog}>
          <h3>Interventi</h3>
          <table className="item-table">
            <thead>
              <tr><th>Luogo</th><th>Data</th></tr>
            </thead>
            <tbody>
              {planInterventions.map(i => (
                <tr key={i.id}>
                  <td>{i.luogo}</td>
                  <td>{i.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={closeInterventions}>Chiudi</button>
        </dialog>
      </div>
    </div>
  )
}

export default InventoryPage
