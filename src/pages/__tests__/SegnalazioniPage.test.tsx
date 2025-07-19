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
  updateSegnalazione: jest.fn(),
}))

const mockedApi = api as jest.Mocked<typeof api>

beforeEach(() => {
  mockedApi.listSegnalazioni.mockResolvedValue([])
  mockedApi.updateSegnalazione.mockResolvedValue({} as any)
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
    expect(selects).toHaveLength(3)
    expect(
      screen.getByRole('combobox', { name: /stato/i })
    ).toBeInTheDocument()
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

  it('handles closed segnalazioni', async () => {
    mockedApi.listSegnalazioni.mockResolvedValue([
      {
        id: '1',
        tipo: 'Buco',
        priorita: 'Alta',
        data: '2024-01-01',
        descrizione: 'desc',
        stato: 'Aperta',
        latitudine: 0,
        longitudine: 0,
      },
      {
        id: '2',
        tipo: 'Rifiuti',
        priorita: 'Bassa',
        data: '2024-01-02',
        descrizione: 'desc2',
        stato: 'Chiusa',
        latitudine: 1,
        longitudine: 1,
      },
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

    const map = await screen.findByTestId('map')
    expect(map.querySelectorAll('.leaflet-marker-icon')).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: /completate/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Rifiuti')).toBeInTheDocument()
  })

  it('changes segnalazione status from popup', async () => {
    mockedApi.listSegnalazioni.mockResolvedValue([
      {
        id: '1',
        tipo: 'Buco',
        priorita: 'Alta',
        data: '2024-01-01',
        descrizione: 'desc',
        stato: 'aperta',
        latitudine: 0,
        longitudine: 0,
      },
    ])
    mockedApi.updateSegnalazione.mockResolvedValue({
      id: '1',
      tipo: 'Buco',
      priorita: 'Alta',
      data: '2024-01-01',
      descrizione: 'desc',
      stato: 'chiusa',
      latitudine: 0,
      longitudine: 0,
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

    const map = await screen.findByTestId('map')
    const marker = map.querySelector('.leaflet-marker-icon') as HTMLElement
    fireEvent.click(marker)

    const select = await screen.findByLabelText(/stato segnalazione/i)
    await userEvent.selectOptions(select, 'chiusa')

    expect(mockedApi.updateSegnalazione).toHaveBeenCalledWith('1', {
      stato: 'chiusa',
    })
    expect((select as HTMLSelectElement).value).toBe('chiusa')
  })

  it('changes segnalazione status from modal', async () => {
    mockedApi.listSegnalazioni.mockResolvedValue([
      {
        id: '1',
        tipo: 'Buco',
        priorita: 'Alta',
        data: '2024-01-01',
        descrizione: 'desc',
        stato: 'aperta',
        latitudine: 0,
        longitudine: 0,
      },
    ])
    mockedApi.updateSegnalazione.mockResolvedValue({
      id: '1',
      tipo: 'Buco',
      priorita: 'Alta',
      data: '2024-01-01',
      descrizione: 'desc',
      stato: 'chiusa',
      latitudine: 0,
      longitudine: 0,
    } as any)

    render(
      <MemoryRouter initialEntries={['/segnalazioni']}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/segnalazioni" element={<SegnalazioniPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: /attive/i }))
    const select = await screen.findByLabelText(/stato segnalazione/i)
    await userEvent.selectOptions(select, 'chiusa')

    expect(mockedApi.updateSegnalazione).toHaveBeenCalledWith('1', {
      stato: 'chiusa',
    })
    expect((select as HTMLSelectElement).value).toBe('chiusa')
  })
})
