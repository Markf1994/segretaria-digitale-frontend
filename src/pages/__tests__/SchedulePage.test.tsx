import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulePage from '../SchedulePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import api from '../../api/axios'

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockedApi = api as jest.Mocked<typeof api>

beforeEach(() => {
  jest.resetAllMocks()
  mockedApi.get.mockResolvedValue({ data: [] })
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
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: '1', slot1: '08-10', user_id: 'u' }],
    })

    renderPage()

    expect(await screen.findByText('08-10')).toBeInTheDocument()
    expect(mockedApi.get).toHaveBeenCalledWith('/orari/')
  })

  it('adds a new turno', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { id: '2', slot1: '09-11', user_id: '123' },
    })

    renderPage()
    await screen.findByRole('button', { name: /aggiungi/i })

    await userEvent.type(screen.getByPlaceholderText(/slot 1/i), '09-11')
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }))

    expect(await screen.findByText('09-11')).toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: '',
      slot1: '09-11',
      slot2: null,
      slot3: null,
    })
    expect(
      (screen.getByPlaceholderText(/slot 1/i) as HTMLInputElement).value
    ).toBe('')
  })

  it('deletes a turno', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: '1', slot1: '07-09', user_id: 'u' }],
    })
    mockedApi.delete.mockResolvedValueOnce({})

    renderPage()

    await screen.findByText('07-09')
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }))

    expect(screen.queryByText('07-09')).not.toBeInTheDocument()
    expect(mockedApi.delete).toHaveBeenCalledWith('/orari/1')
  })
})
