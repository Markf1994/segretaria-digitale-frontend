import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      {
        id: '1',
        tipo: 'Buco',
        priorita: 'Alta',
        data: '2024-01-01',
        descrizione: 'desc',
        stato: 'aperta',
        lat: 0,
        lng: 0,
      }
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

  it('shows form fields', () => {
    render(
      <MemoryRouter initialEntries={["/segnalazioni"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/segnalazioni" element={<SegnalazioniPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
    expect(screen.getByPlaceholderText(/stato/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toHaveAttribute('type', 'datetime-local')
  })

  it('adds marker after map click and form submit', async () => {
    mockedApi.createSegnalazione.mockResolvedValue({
      id: '1',
      tipo: '',
      priorita: '',
      data: '',
      descrizione: '',
      lat: 0,
      lng: 0,
    } as any)

    render(
      <MemoryRouter initialEntries={["/segnalazioni"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/segnalazioni" element={<SegnalazioniPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    const map = screen.getByTestId('map')
    expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(0)

    fireEvent.click(map)

    expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: /invia/i }))

    expect(mockedApi.createSegnalazione).toHaveBeenCalled()
    expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1)
  })
})
