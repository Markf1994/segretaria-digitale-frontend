import { render, screen } from '@testing-library/react'
import SegnalazioniPage from '../SegnalazioniPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as api from '../../api/segnalazioni'

jest.mock('../../api/segnalazioni', () => ({
  __esModule: true,
  listSegnalazioni: jest.fn(),
  createSegnalazione: jest.fn(),
}))

const mockedApi = api as jest.Mocked<typeof api>

beforeEach(() => {
  mockedApi.listSegnalazioni.mockResolvedValue([])
})

describe('SegnalazioniPage', () => {
  it('lists segnalazioni from api', async () => {
    mockedApi.listSegnalazioni.mockResolvedValue([
      { id: '1', tipo: 'Buco', priorita: 'Alta', data: '2024-01-01', descrizione: 'desc', lat: 0, lng: 0 }
    ])

    render(
      <MemoryRouter initialEntries={["/segnalazioni"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/segnalazioni" element={<SegnalazioniPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Buco')).toBeInTheDocument()
  })
})
