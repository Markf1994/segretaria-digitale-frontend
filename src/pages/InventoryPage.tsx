import React, { useEffect, useState } from 'react'
import './ListPages.css'
import Modal from '../components/ui/Modal'
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
  createHorizontalSignage,
  updateHorizontalSignage,
  listHorizontalSignageByPlan,
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
  const [devDesc, setDevDesc] = useState('')
  const [devYear, setDevYear] = useState('')
  const [devNotes, setDevNotes] = useState('')
  const [devSearch, setDevSearch] = useState('')
  const [devEdit, setDevEdit] = useState<string | null>(null)

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

  const [devOpen, setDevOpen] = useState(false)
  const [tempOpen, setTempOpen] = useState(false)
  const [vertOpen, setVertOpen] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)

  const [plans, setPlans] = useState<HorizontalPlan[]>([])
  const [planDesc, setPlanDesc] = useState('')
  const [planAnno, setPlanAnno] = useState('')
  const [planSearch, setPlanSearch] = useState('')
  const [planEdit, setPlanEdit] = useState<string | null>(null)

  const [horizontals, setHorizontals] = useState<HorizontalSign[]>([])
  const [showPlan, setShowPlan] = useState<string | null>(null)
  const [horizLuogo, setHorizLuogo] = useState('')
  const [horizData, setHorizData] = useState('')
  const [horizDesc, setHorizDesc] = useState('')
  const [horizQuant, setHorizQuant] = useState('')
  const [horizEdit, setHorizEdit] = useState<string | null>(null)
  const [horizOpen, setHorizOpen] = useState(false)
  const [interventionsOpen, setInterventionsOpen] = useState(false)
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
        localStorage.setItem('horizontalPlans', JSON.stringify(p))
      } catch {
        const stored = localStorage.getItem('horizontalPlans')
        if (stored) setPlans(JSON.parse(stored))
      }
    }
    fetchAll()
  }, [])

  const saveDevices = (d: Device[]) => localStorage.setItem('devices', JSON.stringify(d))
  const saveTemps = (t: TemporarySign[]) => localStorage.setItem('temps', JSON.stringify(t))
  const saveVerticals = (v: VerticalSign[]) => localStorage.setItem('verticals', JSON.stringify(v))
  const savePlans = (p: HorizontalPlan[]) => localStorage.setItem('horizontalPlans', JSON.stringify(p))

  const resetDevice = () => {
    setDevName('');
    setDevDesc('');
    setDevYear('');
    setDevNotes('');
    setDevEdit(null);
    setDevOpen(false);
  }
  const resetTemp = () => { setTempLuogo(''); setTempFine(''); setTempDesc(''); setTempAnno(''); setTempQuant(''); setTempEdit(null); setTempOpen(false) }
  const resetVert = () => { setVertLuogo(''); setVertDesc(''); setVertTipo(''); setVertAnno(''); setVertQuant(''); setVertEdit(null); setVertOpen(false) }
  const resetPlan = () => { setPlanDesc(''); setPlanAnno(''); setPlanEdit(null); setPlanOpen(false) }
  const resetHoriz = () => {
    setHorizLuogo('')
    setHorizData('')
    setHorizDesc('')
    setHorizQuant('')
    setHorizEdit(null)
    setHorizOpen(false)
  }

  const submitDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!devName) return
    const payload = {
      nome: devName,
      descrizione: devDesc || undefined,
      anno: devYear ? Number(devYear) : undefined,
      note: devNotes,
    }
    if (devEdit) {
      const res = await updateDevice(devEdit, payload)
      const updated = devices.map(d => d.id === devEdit ? res : d)
      setDevices(updated)
      saveDevices(updated)
    } else {
      const res = await createDevice(payload)
      const updated = [...devices, res]
      setDevices(updated)
      saveDevices(updated)
    }
    resetDevice()
    setDevOpen(false)
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
      const updated = temps.map(t => t.id === tempEdit ? res : t)
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
        quantita: vertQuant ? Number(vertQuant) : undefined
      })
      const updated = verticals.map(v => v.id === vertEdit ? res : v)
      setVerticals(updated)
      saveVerticals(updated)
    } else {
      const res = await createVerticalSignage({
        luogo: vertLuogo,
        descrizione: vertDesc,
        tipo: vertTipo,
        anno: vertAnno ? Number(vertAnno) : undefined,
        quantita: vertQuant ? Number(vertQuant) : undefined
      })
      const updated = [...verticals, res]
      setVerticals(updated)
      saveVerticals(updated)
    }
    resetVert()
    setVertOpen(false)
  }

  const submitPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planDesc) return
    if (planEdit) {
      const res = await updateHorizontalPlan(planEdit, {
        descrizione: planDesc,
        anno: planAnno ? Number(planAnno) : undefined,
      })
      const updated = plans.map(p => p.id === planEdit ? res : p)
      setPlans(updated)
      savePlans(updated)
    } else {
      const res = await createHorizontalPlan({
        descrizione: planDesc,
        anno: planAnno ? Number(planAnno) : undefined,
      })
      const updated = [...plans, res]
      setPlans(updated)
      savePlans(updated)
    }
    resetPlan()
    setPlanOpen(false)
  }

  const submitHoriz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!horizLuogo || !horizData || !showPlan) return
    const payload = {
      luogo: horizLuogo,
      data: horizData,
      descrizione: horizDesc || undefined,
      quantita: horizQuant ? Number(horizQuant) : undefined,
      piano_id: showPlan,
    }
    if (horizEdit) {
      const res = await updateHorizontalSignage(horizEdit, payload)
      const updated = horizontals.map(h => (h.id === horizEdit ? res : h))
      setHorizontals(updated)
    } else {
      const res = await createHorizontalSignage(payload)
      setHorizontals([...horizontals, res])
    }
    resetHoriz()
  }

  const onPdf = async () => {
    if (!pdfYear) return
    const blob = await getHorizontalSignagePdf(Number(pdfYear))
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="list-page">
      <h2 className="wip-warning">🚧 LAVORI IN CORSO 🚧</h2>
      <div>
        <h2>Dispositivi</h2>
        <button type="button" onClick={() => { resetDevice(); setDevOpen(true); }}>Aggiungi</button>
        <Modal open={devOpen} onClose={resetDevice} title={devEdit ? 'Modifica dispositivo' : 'Nuovo dispositivo'}>
          <form onSubmit={submitDevice} className="item-form">
            <input data-testid="dev-name" placeholder="Nome" value={devName} onChange={e => setDevName(e.target.value)} />
            <input data-testid="dev-desc" placeholder="Descrizione" value={devDesc} onChange={e => setDevDesc(e.target.value)} />
            <input data-testid="dev-year" type="number" placeholder="Anno" value={devYear} onChange={e => setDevYear(e.target.value)} />
            <input data-testid="dev-notes" placeholder="Note" value={devNotes} onChange={e => setDevNotes(e.target.value)} />
            <button data-testid="dev-submit" type="submit">{devEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="dev-cancel" type="button" onClick={resetDevice}>Annulla</button>
          </form>
        </Modal>
        <input placeholder="Cerca" value={devSearch} onChange={e => setDevSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Nome</th><th>Descrizione</th><th>Anno</th><th>Note</th><th></th></tr>
          </thead>
          <tbody>
            {devices.filter(d => d.nome.toLowerCase().includes(devSearch.toLowerCase())).map(d => (
              <tr key={d.id}>
                <td>{d.nome}</td>
                <td>{d.descrizione}</td>
                <td>{d.anno}</td>
                <td>{d.note}</td>
                <td>
                  <button onClick={() => {
                    setDevEdit(d.id);
                    setDevName(d.nome);
                    setDevDesc(d.descrizione || '');
                    setDevYear(d.anno?.toString() || '');
                    setDevNotes(d.note || '');
                    setDevOpen(true);
                  }}>Modifica</button>
                  <button onClick={async () => { await deleteDevice(d.id); const u = devices.filter(x => x.id !== d.id); setDevices(u); saveDevices(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Segnaletica Temporanea</h2>
        <button type="button" onClick={() => { resetTemp(); setTempOpen(true); }}>Aggiungi</button>
        <Modal open={tempOpen} onClose={resetTemp} title={tempEdit ? 'Modifica temporanea' : 'Nuova segnaletica'}>
          <form onSubmit={submitTemp} className="item-form">
            <input data-testid="temp-luogo" placeholder="Luogo" value={tempLuogo} onChange={e => setTempLuogo(e.target.value)} />
            <input data-testid="temp-fine" type="date" value={tempFine} onChange={e => setTempFine(e.target.value)} />
            <input data-testid="temp-desc" placeholder="Descrizione" value={tempDesc} onChange={e => setTempDesc(e.target.value)} />
            <input data-testid="temp-anno" type="number" placeholder="Anno" value={tempAnno} onChange={e => setTempAnno(e.target.value)} />
            <input data-testid="temp-quant" type="number" placeholder="Quantità" value={tempQuant} onChange={e => setTempQuant(e.target.value)} />
            <button data-testid="temp-submit" type="submit">{tempEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="temp-cancel" type="button" onClick={resetTemp}>Annulla</button>
          </form>
        </Modal>
        <input placeholder="Cerca" value={tempSearch} onChange={e => setTempSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Luogo</th><th>Fine validità</th><th>Descrizione</th><th>Anno</th><th>Quantità</th><th></th></tr>
          </thead>
          <tbody>
            {temps.filter(t => t.luogo.toLowerCase().includes(tempSearch.toLowerCase())).map(t => (
              <tr key={t.id}>
                <td>{t.luogo}</td>
                <td>{t.fine_validita}</td>
                <td>{t.descrizione}</td>
                <td>{t.anno}</td>
                <td>{t.quantita}</td>
                <td>
                  <button onClick={() => { setTempEdit(t.id); setTempLuogo(t.luogo); setTempFine(t.fine_validita); setTempDesc(t.descrizione || ''); setTempAnno(t.anno?.toString() || ''); setTempQuant(t.quantita?.toString() || ''); setTempOpen(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteTemporarySignage(t.id); const u = temps.filter(x => x.id !== t.id); setTemps(u); saveTemps(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Segnaletica Verticale</h2>
        <button type="button" onClick={() => { resetVert(); setVertOpen(true); }}>Aggiungi</button>
        <Modal open={vertOpen} onClose={resetVert} title={vertEdit ? 'Modifica verticale' : 'Nuova segnaletica'}>
          <form onSubmit={submitVert} className="item-form">
            <input data-testid="vert-luogo" placeholder="Luogo" value={vertLuogo} onChange={e => setVertLuogo(e.target.value)} />
            <input data-testid="vert-desc" placeholder="Descrizione" value={vertDesc} onChange={e => setVertDesc(e.target.value)} />
            <input data-testid="vert-tipo" placeholder="Tipo" value={vertTipo} onChange={e => setVertTipo(e.target.value)} />
            <input data-testid="vert-anno" type="number" placeholder="Anno" value={vertAnno} onChange={e => setVertAnno(e.target.value)} />
            <input data-testid="vert-quant" type="number" placeholder="Quantità" value={vertQuant} onChange={e => setVertQuant(e.target.value)} />
            <button data-testid="vert-submit" type="submit">{vertEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="vert-cancel" type="button" onClick={resetVert}>Annulla</button>
          </form>
        </Modal>
        <input placeholder="Cerca" value={vertSearch} onChange={e => setVertSearch(e.target.value)} />
        <table className="item-table">
          <thead>
            <tr><th>Luogo</th><th>Descrizione</th><th>Tipo</th><th>Anno</th><th>Quantità</th><th></th></tr>
          </thead>
          <tbody>
            {verticals.filter(v => v.luogo.toLowerCase().includes(vertSearch.toLowerCase())).map(v => (
              <tr key={v.id}>
                <td>{v.luogo}</td>
                <td>{v.descrizione}</td>
                <td>{v.tipo}</td>
                <td>{v.anno}</td>
                <td>{v.quantita}</td>
                <td>
                  <button onClick={() => { setVertEdit(v.id); setVertLuogo(v.luogo); setVertDesc(v.descrizione); setVertTipo(v.tipo || ''); setVertAnno(v.anno?.toString() || ''); setVertQuant(v.quantita?.toString() || ''); setVertOpen(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteVerticalSignage(v.id); const u = verticals.filter(x => x.id !== v.id); setVerticals(u); saveVerticals(u) }}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Segnaletica Orizzontale</h2>
        <button type="button" onClick={() => { resetPlan(); setPlanOpen(true); }}>Aggiungi</button>
        <Modal open={planOpen} onClose={resetPlan} title={planEdit ? 'Modifica piano' : 'Nuovo piano'}>
          <form onSubmit={submitPlan} className="item-form">
            <input data-testid="plan-desc" placeholder="Descrizione" value={planDesc} onChange={e => setPlanDesc(e.target.value)} />
            <input data-testid="plan-anno" type="number" placeholder="Anno" value={planAnno} onChange={e => setPlanAnno(e.target.value)} />
            <button data-testid="plan-submit" type="submit">{planEdit ? 'Salva' : 'Aggiungi'}</button>
            <button data-testid="plan-cancel" type="button" onClick={resetPlan}>Annulla</button>
          </form>
        </Modal>
        <Modal open={interventionsOpen} onClose={() => { setInterventionsOpen(false); resetHoriz() }} title="Interventi">
          <button type="button" onClick={() => { resetHoriz(); setHorizOpen(true) }}>Aggiungi</button>
          <table className="item-table">
            <thead>
              <tr><th>Luogo</th><th>Data</th><th>Descrizione</th><th>Quantità</th><th></th></tr>
            </thead>
            <tbody>
              {horizontals.map(h => (
                <tr key={h.id}>
                  <td>{h.luogo}</td>
                  <td>{h.data}</td>
                  <td>{h.descrizione}</td>
                  <td>{h.quantita}</td>
                  <td>
                    <button onClick={() => {
                      setHorizEdit(h.id)
                      setHorizLuogo(h.luogo)
                      setHorizData(h.data)
                      setHorizDesc(h.descrizione || '')
                      setHorizQuant(h.quantita?.toString() || '')
                      setHorizOpen(true)
                    }}>Modifica</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
        <Modal open={horizOpen} onClose={resetHoriz} title={horizEdit ? 'Modifica intervento' : 'Nuovo intervento'}>
          <form onSubmit={submitHoriz} className="item-form">
            <input placeholder="Luogo" value={horizLuogo} onChange={e => setHorizLuogo(e.target.value)} />
            <input type="date" value={horizData} onChange={e => setHorizData(e.target.value)} />
            <input placeholder="Descrizione" value={horizDesc} onChange={e => setHorizDesc(e.target.value)} />
            <input type="number" placeholder="Quantità" value={horizQuant} onChange={e => setHorizQuant(e.target.value)} />
            <button type="submit">{horizEdit ? 'Salva' : 'Aggiungi'}</button>
            <button type="button" onClick={resetHoriz}>Annulla</button>
          </form>
        </Modal>
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
                  <button onClick={() => { setPlanEdit(p.id); setPlanDesc(p.descrizione); setPlanAnno(p.anno.toString()); setPlanOpen(true) }}>Modifica</button>
                  <button onClick={async () => { await deleteHorizontalPlan(p.id); const u = plans.filter(x => x.id !== p.id); setPlans(u); savePlans(u) }}>Elimina</button>
                  <button onClick={async () => {
                    setShowPlan(p.id)
                    const res = await listHorizontalSignageByPlan(p.id)
                    setHorizontals(res)
                    setInterventionsOpen(true)
                  }}>Vedi interventi</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pdf-controls">
          <input data-testid="hor-year" placeholder="Anno" value={pdfYear} onChange={e => setPdfYear(e.target.value)} />
          <button data-testid="hor-pdf" type="button" onClick={onPdf}>PDF anno</button>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage
