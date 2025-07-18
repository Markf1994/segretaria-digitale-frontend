import React, { useEffect, useState } from 'react'
import './ListPages.css'
import Modal from '../components/ui/Modal'
import {
  listHorizontalPlans,
  createHorizontalPlan,
  updateHorizontalPlan,
  deleteHorizontalPlan,
  HorizontalPlan,
} from '../api/horizontalPlans'
import {
  listHorizontalSignageByPlan,
  createHorizontalSignage,
  updateHorizontalSignage,
  getHorizontalSignagePdf,
  HorizontalSign,
} from '../api/horizontalSignage'

const HorizontalSignagePage: React.FC = () => {
  const [plans, setPlans] = useState<HorizontalPlan[]>([])
  const [planDesc, setPlanDesc] = useState('')
  const [planAnno, setPlanAnno] = useState('')
  const [planSearch, setPlanSearch] = useState('')
  const [planEdit, setPlanEdit] = useState<string | null>(null)
  const [planOpen, setPlanOpen] = useState(false)

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

  const savePlans = (p: HorizontalPlan[]) =>
    localStorage.setItem('horizontalPlans', JSON.stringify(p))

  const resetPlan = () => {
    setPlanDesc('')
    setPlanAnno('')
    setPlanEdit(null)
    setPlanOpen(false)
  }
  const resetHoriz = () => {
    setHorizLuogo('')
    setHorizData('')
    setHorizDesc('')
    setHorizQuant('')
    setHorizEdit(null)
    setHorizOpen(false)
  }

  const submitPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planDesc) return
    if (planEdit) {
      const res = await updateHorizontalPlan(planEdit, {
        descrizione: planDesc,
        anno: planAnno ? Number(planAnno) : undefined,
      })
      const updated = plans.map(p => (p.id === planEdit ? res : p))
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
    const newWindow = window.open(url, '_blank')
    if (newWindow) {
      newWindow.addEventListener('load', () => {
        URL.revokeObjectURL(url)
      })
    } else {
      setTimeout(() => URL.revokeObjectURL(url))
    }
  }

  return (
    <div className="list-page">
      <h2 className="wip-warning">🚧 LAVORI IN CORSO 🚧</h2>
      <div>
        <h2>Segnaletica Orizzontale</h2>
        <button type="button" onClick={() => { resetPlan(); setPlanOpen(true) }}>
          Aggiungi
        </button>
        <Modal
          open={planOpen}
          onClose={resetPlan}
          title={planEdit ? 'Modifica piano' : 'Nuovo piano'}
        >
          <form onSubmit={submitPlan} className="item-form">
            <input
              data-testid="plan-desc"
              placeholder="Descrizione"
              value={planDesc}
              onChange={e => setPlanDesc(e.target.value)}
            />
            <input
              data-testid="plan-anno"
              type="number"
              placeholder="Anno"
              value={planAnno}
              onChange={e => setPlanAnno(e.target.value)}
            />
            <button data-testid="plan-submit" type="submit">
              {planEdit ? 'Salva' : 'Aggiungi'}
            </button>
            <button data-testid="plan-cancel" type="button" onClick={resetPlan}>
              Annulla
            </button>
          </form>
        </Modal>
        <Modal
          open={interventionsOpen}
          onClose={() => {
            setInterventionsOpen(false)
            resetHoriz()
          }}
          title="Interventi"
        >
          <button
            type="button"
            onClick={() => {
              resetHoriz()
              setHorizOpen(true)
            }}
          >
            Aggiungi
          </button>
          <table className="item-table">
            <thead>
              <tr>
                <th>Luogo</th>
                <th>Data</th>
                <th>Descrizione</th>
                <th>Quantità</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {horizontals.map(h => (
                <tr key={h.id}>
                  <td>{h.luogo}</td>
                  <td>{h.data}</td>
                  <td>{h.descrizione}</td>
                  <td>{h.quantita}</td>
                  <td>
                    <button
                      onClick={() => {
                        setHorizEdit(h.id)
                        setHorizLuogo(h.luogo)
                        setHorizData(h.data)
                        setHorizDesc(h.descrizione || '')
                        setHorizQuant(h.quantita?.toString() || '')
                        setHorizOpen(true)
                      }}
                    >
                      Modifica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
        <Modal
          open={horizOpen}
          onClose={resetHoriz}
          title={horizEdit ? 'Modifica intervento' : 'Nuovo intervento'}
        >
          <form onSubmit={submitHoriz} className="item-form">
            <input
              placeholder="Luogo"
              value={horizLuogo}
              onChange={e => setHorizLuogo(e.target.value)}
            />
            <input
              type="date"
              value={horizData}
              onChange={e => setHorizData(e.target.value)}
            />
            <input
              placeholder="Descrizione"
              value={horizDesc}
              onChange={e => setHorizDesc(e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantità"
              value={horizQuant}
              onChange={e => setHorizQuant(e.target.value)}
            />
            <button type="submit">{horizEdit ? 'Salva' : 'Aggiungi'}</button>
            <button type="button" onClick={resetHoriz}>
              Annulla
            </button>
          </form>
        </Modal>
        <input
          placeholder="Cerca"
          value={planSearch}
          onChange={e => setPlanSearch(e.target.value)}
        />
        <table className="item-table">
          <thead>
            <tr>
              <th>Descrizione</th>
              <th>Anno</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {plans
              .filter(p =>
                p.descrizione.toLowerCase().includes(planSearch.toLowerCase())
              )
              .map(p => (
                <tr key={p.id}>
                  <td>{p.descrizione}</td>
                  <td>{p.anno}</td>
                  <td>
                    <button
                      onClick={() => {
                        setPlanEdit(p.id)
                        setPlanDesc(p.descrizione)
                        setPlanAnno(p.anno.toString())
                        setPlanOpen(true)
                      }}
                    >
                      Modifica
                    </button>
                    <button
                      onClick={async () => {
                        await deleteHorizontalPlan(p.id)
                        const u = plans.filter(x => x.id !== p.id)
                        setPlans(u)
                        savePlans(u)
                      }}
                    >
                      Elimina
                    </button>
                    <button
                      onClick={async () => {
                        setShowPlan(p.id)
                        const res = await listHorizontalSignageByPlan(p.id)
                        setHorizontals(res)
                        setInterventionsOpen(true)
                      }}
                    >
                      Vedi interventi
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="pdf-controls">
          <input
            data-testid="hor-year"
            placeholder="Anno"
            value={pdfYear}
            onChange={e => setPdfYear(e.target.value)}
          />
          <button data-testid="hor-pdf" type="button" onClick={onPdf}>
            PDF anno
          </button>
        </div>
      </div>
    </div>
  )
}

export default HorizontalSignagePage
