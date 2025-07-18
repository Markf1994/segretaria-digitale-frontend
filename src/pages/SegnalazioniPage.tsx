import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41]
})

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { createSegnalazione, listSegnalazioni, Segnalazione } from '../api/segnalazioni'
import './ListPages.css'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/button'

const LocationMarker: React.FC<{
  position: [number, number] | null
  onChange: (p: [number, number]) => void
}> = ({ position, onChange }) => {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng])
    }
  })
  return position ? (
    <Marker position={position}>
      <Popup>Posizione segnalata</Popup>
    </Marker>
  ) : null
}

const SegnalazioniPage: React.FC = () => {
  const [items, setItems] = useState<Segnalazione[]>([])
  const [tipo, setTipo] = useState('')
  const [priorita, setPriorita] = useState('')
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 16))
  const [descrizione, setDescrizione] = useState('')
  const [stato, setStato] = useState('')
  const [pos, setPos] = useState<[number, number] | null>(null)
  const [error, setError] = useState('')
  const [showClosed, setShowClosed] = useState(false)
  const [showActive, setShowActive] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  const closedItems = items.filter(i => i.stato === 'Chiusa')
  const activeItems = items.filter(
    i => i.stato === 'Aperta' || i.stato === 'Attiva'
  )
  const progressItems = items.filter(i => i.stato === 'In lavorazione')

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listSegnalazioni()
        setItems(data)
      } catch {
        setError('Errore nel caricamento delle segnalazioni')
      }
    }
    fetch()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pos) return
    try {
      const res = await createSegnalazione({
        tipo,
        stato,
        priorita: priorita === "Alta" ? 1 : priorita === "Media" ? 2 : 3,
        data_segnalazione: data,
        descrizione,
        latitudine: pos[0],
        longitudine: pos[1]
      })
      setItems([...items, res])
      setTipo('')
      setPriorita('')
      setData(new Date().toISOString().slice(0, 16))
      setDescrizione('')
      setStato('')
      setPos(null)
    } catch {
      setError('Errore durante la creazione della segnalazione')
    }
  }

  return (
    <div className="list-page">
      <h2>Segnalazioni</h2>
      <h2 className="wip-warning">🚧 LAVORI IN CORSO 🚧</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit} className="item-form">
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="">Tipo</option>
          <option value="Piante">Piante</option>
          <option value="Animali">Animali</option>
          <option value="Danneggiamenti">Danneggiamenti</option>
          <option value="Reati">Reati</option>
          <option value="Altro">Altro</option>
        </select>
        <select value={priorita} onChange={e => setPriorita(e.target.value)}>
          <option value="">Priorità</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Bassa">Bassa</option>
        </select>
        <label htmlFor="data">Data</label>
        <input
          id="data"
          type="datetime-local"
          value={data}
          onChange={e => setData(e.target.value)}
        />
        <select
          aria-label="Stato"
          value={stato}
          onChange={e => setStato(e.target.value)}
        >
          <option value="">Stato</option>
          <option value="Aperta">Aperta</option>
          <option value="In lavorazione">In lavorazione</option>
          <option value="Chiusa">Chiusa</option>
        </select>
        <textarea placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} />
        <button type="submit">Invia</button>
      </form>
      <MapContainer center={[45.9229, 10.0644]} zoom={13} style={{ height: '400px', width: '100%' }} data-testid="map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <LocationMarker position={pos} onChange={setPos} />
        {items
          .filter(
            item =>
              item.stato === 'Aperta' ||
              item.stato === 'Attiva' ||
              item.stato === 'In lavorazione'
          )
          .map((item, idx) => (
          <Marker key={idx} position={[item.latitudine, item.longitudine]}>
            <Popup>
              <strong>{item.tipo}</strong>
              <br />
              {item.descrizione}
              <br />
              Priorità: {item.priorita}
              <br />
              Stato: {item.stato}
              <br />
              {new Date(item.data_segnalazione).toLocaleString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <Button type="button" onClick={() => setShowActive(true)}>
        Attive
      </Button>
      <Button type="button" onClick={() => setShowProgress(true)}>
        In lavorazione
      </Button>
      <Button type="button" onClick={() => setShowClosed(true)}>
        Completate
      </Button>
      <Modal
        open={showActive}
        onClose={() => setShowActive(false)}
        title="Segnalazioni attive"
      >
        <table className="item-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data</th>
              <th>Descrizione</th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map(item => (
              <tr key={item.id}>
                <td>{item.tipo}</td>
                <td>{new Date(item.data_segnalazione).toLocaleDateString()}</td>
                <td>{item.descrizione}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={() => setShowActive(false)}>Chiudi</Button>
      </Modal>
      <Modal
        open={showProgress}
        onClose={() => setShowProgress(false)}
        title="Segnalazioni in lavorazione"
      >
        <table className="item-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data</th>
              <th>Descrizione</th>
            </tr>
          </thead>
          <tbody>
            {progressItems.map(item => (
              <tr key={item.id}>
                <td>{item.tipo}</td>
                <td>{new Date(item.data_segnalazione).toLocaleDateString()}</td>
                <td>{item.descrizione}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={() => setShowProgress(false)}>Chiudi</Button>
      </Modal>
      <Modal
        open={showClosed}
        onClose={() => setShowClosed(false)}
        title="Segnalazioni completate"
      >
        <table className="item-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data</th>
              <th>Descrizione</th>
            </tr>
          </thead>
          <tbody>
            {closedItems.map(item => (
              <tr key={item.id}>
                <td>{item.tipo}</td>
                <td>{new Date(item.data_segnalazione).toLocaleDateString()}</td>
                <td>{item.descrizione}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={() => setShowClosed(false)}>Chiudi</Button>
      </Modal>
    </div>
  )
}

export default SegnalazioniPage
