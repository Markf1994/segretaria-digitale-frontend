import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { createSegnalazione, listSegnalazioni, Segnalazione } from '../api/segnalazioni'
import './ListPages.css'

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

  useEffect(() => {
    listSegnalazioni().then(setItems).catch(() => {})
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pos) return
    const res = await createSegnalazione({
      tipo,
      priorita,
      data,
      descrizione,
      stato,
      lat: pos[0],
      lng: pos[1]
    })
    setItems([...items, res])
    setTipo('')
    setPriorita('')
    setData(new Date().toISOString().slice(0, 16))
    setDescrizione('')
    setStato('')
    setPos(null)
  }

  return (
    <div className="list-page">
      <h2>Segnalazioni</h2>
      <h2 className="wip-warning">🚧 LAVORI IN CORSO 🚧</h2>
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
        <input
          placeholder="Stato"
          value={stato}
          onChange={e => setStato(e.target.value)}
        />
        <textarea placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} />
        <button type="submit">Invia</button>
      </form>
      <MapContainer center={[45.07, 7.69]} zoom={13} style={{ height: '400px', width: '100%' }} data-testid="map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <LocationMarker position={pos} onChange={setPos} />
        {items.map(s => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <div>
                <strong>{s.tipo}</strong>
              </div>
              {s.stato && <div>Stato: {s.stato}</div>}
              <div>{new Date(s.data).toLocaleString()}</div>
              <div>{s.descrizione}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default SegnalazioniPage
