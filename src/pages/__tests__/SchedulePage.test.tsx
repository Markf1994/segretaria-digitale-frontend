import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulePage from '../SchedulePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import api from '../../api/axios'
import * as gc from '../../api/googleCalendar'

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../api/googleCalendar', () => ({
  __esModule: true,
  signIn: jest.fn(),
  createShiftEvent: jest.fn(),
}))

const mockedGc = gc as jest.Mocked<typeof gc>

const mockedApi = api as jest.Mocked<typeof api>

beforeEach(() => {
  jest.resetAllMocks()
  mockedApi.get.mockResolvedValue({ data: [] })
  mockedGc.signIn.mockResolvedValue()
  mockedGc.createShiftEvent.mockResolvedValue([] as any)
})

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/orari"]}>
      <Routes>
        <Route element={<PageTemplate />}>
          <Route path="/orari" element={<SchedulePage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('SchedulePage', () => {
  it('loads turni from API', async () => {
    mockedApi.get.mockImplementation(url => {
      if (url === '/users/') return Promise.resolve({ data: [{ id: 'u', email: 'u@e' }] })
      if (url === '/orari/') return Promise.resolve({ data: [{ id: '1', giorno: '2023-01-01', slot1: { inizio: '08:00', fine: '10:00' }, tipo: 'NORMALE', user_id: 'u' }] })
      return Promise.resolve({ data: [] })
    })

    renderPage()

    expect(await screen.findByText('08:00–10:00')).toBeInTheDocument()
    expect(mockedApi.get).toHaveBeenCalledWith('/users/')
    expect(mockedApi.get).toHaveBeenCalledWith('/orari/')
  })

  it('adds a new turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '2',
        giorno: '2023-05-02',
        slot1: { inizio: '09:00', fine: '11:00' },
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-02')
    await userEvent.type(inputs[1], '09:00')
    await userEvent.type(inputs[2], '11:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    expect(await screen.findByText('09:00–11:00')).toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-02',
      slot1: { inizio: '09:00', fine: '11:00' },
      tipo: 'NORMALE',
      note: undefined,
    })
    expect((inputs[0] as HTMLInputElement).value).toBe('')
    expect(mockedGc.createShiftEvent).toHaveBeenCalled()
  })

  it('deletes a turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: '1', giorno: '2023-01-01', slot1: { inizio: '07:00', fine: '09:00' }, tipo: 'NORMALE', user_id: 'u' }] })
    mockedApi.delete.mockResolvedValueOnce({})

    renderPage()

    await screen.findByText('07:00–09:00')
    await userEvent.click(screen.getByRole('button', { name: '🗑️' }))

    expect(screen.queryByText('07:00–09:00')).not.toBeInTheDocument()
    expect(mockedApi.delete).toHaveBeenCalledWith('/orari/1')
  })
})
