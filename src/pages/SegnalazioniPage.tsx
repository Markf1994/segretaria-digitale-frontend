import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { createSegnalazione, listSegnalazioni, Segnalazione } from '../api/segnalazioni'
import './ListPages.css'

const ClickMarker: React.FC<{ position: [number, number] | null; onChange: (p: [number, number]) => void }> = ({ position, onChange }) => {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng])
    }
  })
  return position ? <Marker position={position} /> : null
}

const SegnalazioniPage: React.FC = () => {
  const [items, setItems] = useState<Segnalazione[]>([])
  const [tipo, setTipo] = useState('')
  const [priorita, setPriorita] = useState('')
  const [data, setData] = useState('')
  const [descrizione, setDescrizione] = useState('')
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
      lat: pos[0],
      lng: pos[1]
    })
    setItems([...items, res])
  }

  return (
    <div className="list-page">
      <h2>Segnalazioni</h2>
      <h2>🚧 LAVORI IN CORSO 🚧</h2>
      <form onSubmit={onSubmit} className="item-form">
        <input placeholder="Tipo" value={tipo} onChange={e => setTipo(e.target.value)} />
        <input placeholder="Priorità" value={priorita} onChange={e => setPriorita(e.target.value)} />
        <label htmlFor="data">Data</label>
        <input id="data" type="date" value={data} onChange={e => setData(e.target.value)} />
        <textarea placeholder="Descrizione" value={descrizione} onChange={e => setDescrizione(e.target.value)} />
        <button type="submit">Invia</button>
      </form>
      <MapContainer center={[45.07, 7.69]} zoom={13} style={{ height: '400px', width: '100%' }} data-testid="map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <ClickMarker position={pos} onChange={setPos} />
        {items.map(s => (
          <Marker key={s.id} position={[s.lat, s.lng]}>
            <Popup>
              <strong>{s.tipo}</strong>
              <br />
              {s.descrizione}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default SegnalazioniPage
