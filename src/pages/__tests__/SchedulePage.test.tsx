import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulePage from '../SchedulePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as api from '../../api/schedule'

jest.mock('../../api/schedule', () => ({
  __esModule: true,
  listTurni: jest.fn(),
  createTurno: jest.fn(),
  deleteTurno: jest.fn(),
}))

const mockedApi = api as jest.Mocked<typeof api>

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  mockedApi.listTurni.mockResolvedValue([])
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
    mockedApi.listTurni.mockResolvedValue([
      { id: '1', slot1: '08-10', user_id: 'u' },
    ] as any)

    renderPage()

    expect(await screen.findByText('08-10')).toBeInTheDocument()
  })

  it('adds a new turno', async () => {
    mockedApi.createTurno.mockResolvedValue({
      id: '2',
      slot1: '09-11',
      user_id: '123',
    } as any)

    const header = Buffer.from('{}').toString('base64')
    const payload = Buffer.from(JSON.stringify({ sub: '123' })).toString('base64')
    const token = `${header}.${payload}.sig`
    localStorage.setItem('token', token)

    renderPage()
    await screen.findByRole('button', { name: /aggiungi/i })

    await userEvent.type(screen.getByPlaceholderText(/slot 1/i), '09-11')
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }))

    expect(await screen.findByText('09-11')).toBeInTheDocument()
    expect(mockedApi.createTurno).toHaveBeenCalled()
    expect(
      (screen.getByPlaceholderText(/slot 1/i) as HTMLInputElement).value
    ).toBe('')
  })

  it('deletes a turno', async () => {
    mockedApi.listTurni.mockResolvedValue([
      { id: '1', slot1: '07-09', user_id: 'u' },
    ] as any)
    mockedApi.deleteTurno.mockResolvedValue()

    renderPage()

    await screen.findByText('07-09')
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }))

    expect(screen.queryByText('07-09')).not.toBeInTheDocument()
    expect(mockedApi.deleteTurno).toHaveBeenCalledWith('1')
  })
})
