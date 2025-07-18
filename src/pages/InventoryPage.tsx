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

const InventoryPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [devName, setDevName] = useState('')
  const [devDesc, setDevDesc] = useState('')
  const [devYear, setDevYear] = useState('')
  const [devNotes, setDevNotes] = useState('')
  const [devSearch, setDevSearch] = useState('')
  const [devEdit, setDevEdit] = useState<string | null>(null)

  const [devOpen, setDevOpen] = useState(false)

  useEffect(() => {
    const fetchDevicesList = async () => {
      try {
        const d = await listDevices()
        setDevices(d)
        localStorage.setItem('devices', JSON.stringify(d))
      } catch {
        const stored = localStorage.getItem('devices')
        if (stored) setDevices(JSON.parse(stored))
      }
    }
    fetchDevicesList()
  }, [])

  const saveDevices = (d: Device[]) => localStorage.setItem('devices', JSON.stringify(d))

  const resetDevice = () => {
    setDevName('');
    setDevDesc('');
    setDevYear('');
    setDevNotes('');
    setDevEdit(null);
    setDevOpen(false);
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




  return (
    <div className="list-page">
      <h2 className="wip-warning">🚧 LAVORI IN CORSO 🚧</h2>
      <div className="inventory-wrapper devices-only">
        <div className="devices-section">
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
    </div>
  </div>
  )
}

export default InventoryPage
