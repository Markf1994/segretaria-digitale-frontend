import React, { useEffect, useState } from 'react'
import './ListPages.css'
import Modal from '../components/ui/Modal'
import ImportHorizontalExcel from '../components/ImportHorizontalExcel'
import {
  listHorizontalYears,
  listHorizontalByYear,
  getHorizontalSignagePdf,
  HorizontalSign,
} from '../api/horizontalSignage'

const HorizontalSignagePage: React.FC = () => {
  const [years, setYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [interventions, setInterventions] = useState<HorizontalSign[]>([])
  const [interventionsOpen, setInterventionsOpen] = useState(false)

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const y = await listHorizontalYears()
        setYears(y)
        localStorage.setItem('horizontalYears', JSON.stringify(y))
      } catch {
        const stored = localStorage.getItem('horizontalYears')
        if (stored) setYears(JSON.parse(stored))
      }
    }
    fetchYears()
  }, [])

  const handleOpenInterventions = async (year: number) => {
    setSelectedYear(year)
    const res = await listHorizontalByYear(year)
    setInterventions(res)
    setInterventionsOpen(true)
  }

  const handlePdf = async (year: number) => {
    const blob = await getHorizontalSignagePdf(year)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="list-page">
      <div>
        <h2>Segnaletica Orizzontale</h2>
        <table className="item-table">
          <thead>
            <tr>
              <th>Anno</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {years.map(y => (
              <tr key={y}>
                <td>{y}</td>
                <td>
                  <button onClick={() => handleOpenInterventions(y)}>
                    Vedi interventi
                  </button>
                  <button onClick={() => handlePdf(y)}>PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal
          open={interventionsOpen}
          onClose={() => setInterventionsOpen(false)}
          title={`Interventi ${selectedYear ?? ''}`}
        >
          <table className="item-table">
            <thead>
              <tr>
                <th>Azienda</th>
                <th>Descrizione</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map(i => (
                <tr key={i.id}>
                  <td>{i.luogo}</td>
                  <td>{i.descrizione}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      </div>
      <ImportHorizontalExcel />
    </div>
  )
}

export default HorizontalSignagePage
