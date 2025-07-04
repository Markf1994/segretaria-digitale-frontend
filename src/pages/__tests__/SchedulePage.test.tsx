import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulePage from '../SchedulePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import api from '../../api/axios'
import * as pdfApi from '../../api/pdfs'
import * as gcApi from '../../api/googleCalendar'

jest.mock('../../components/ImportExcel', () => ({
  __esModule: true,
  default: ({ onComplete }: any) => (
    <button onClick={() => onComplete(true)}>Importa</button>
  ),
}))

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.mock('../../api/pdfs', () => ({
  __esModule: true,
  getSchedulePdf: jest.fn(),
}))

jest.mock('../../api/googleCalendar', () => ({
  __esModule: true,
  createShiftEvents: jest.fn(),
}))

const mockedApi = api as jest.Mocked<typeof api>
const mockedPdfApi = pdfApi as jest.Mocked<typeof pdfApi>
const mockedGcApi = gcApi as jest.Mocked<typeof gcApi>

beforeEach(() => {
  jest.resetAllMocks()
  mockedApi.get.mockResolvedValue({ data: [] })
  mockedPdfApi.getSchedulePdf.mockResolvedValue(new Blob())
  mockedGcApi.createShiftEvents.mockResolvedValue()
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
      if (url === '/users/') return Promise.resolve({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
      if (url === '/orari/')
        return Promise.resolve({
          data: [
            {
              id: '1',
              giorno: '2023-01-01',
              slot1_inizio: '08:00',
              slot1_fine: '10:00',
              tipo: 'NORMALE',
              user_id: 'u',
            },
          ],
        })
      return Promise.resolve({ data: [] })
    })

    renderPage()

    const row = await screen.findByRole('row', { name: /u\s+2023-01-01/i })
    expect(row).toBeInTheDocument()
    expect(mockedApi.get).toHaveBeenCalledWith('/users/')
    expect(mockedApi.get).toHaveBeenCalledWith('/orari/')
  })

  it('adds a new turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '2',
        giorno: '2023-05-02',
        slot1_inizio: '09:00',
        slot1_fine: '11:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })
    expect(screen.getByRole('option', { name: 'u' })).toBeInTheDocument()

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-02')
    await userEvent.type(inputs[1], '09:00')
    await userEvent.type(inputs[2], '11:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-02/i })
    expect(within(row).getByText('09:00')).toBeInTheDocument()
    expect(within(row).getByText('11:00')).toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-02',
      slot1_inizio: '09:00',
      slot1_fine: '11:00',
      slot2_inizio: null,
      slot2_fine: null,
      slot3_inizio: null,
      slot3_fine: null,
      tipo: 'NORMALE',
      note: null,
    })
    expect((inputs[0] as HTMLInputElement).value).toBe('')
    expect(mockedGcApi.createShiftEvents).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      userEmail: 'u@e',
      giorno: '2023-05-02',
    }))
  })

  it('adds a new turno with tipo RIPOSO', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '3',
        giorno: '2023-05-03',
        slot1_inizio: '10:00',
        slot1_fine: '12:00',
        tipo: 'RIPOSO',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-03')
    await userEvent.type(inputs[1], '10:00')
    await userEvent.type(inputs[2], '12:00')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'RIPOSO')

    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-03/i })
    expect(within(row).getByText('10:00')).toBeInTheDocument()
    expect(within(row).getByText('12:00')).toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-03',
      slot1_inizio: '10:00',
      slot1_fine: '12:00',
      slot2_inizio: null,
      slot2_fine: null,
      slot3_inizio: null,
      slot3_fine: null,
      tipo: 'RIPOSO',
      note: null,
    })
  })

  it('adds a new turno with tipo FESTIVO', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '4',
        giorno: '2023-05-04',
        slot1_inizio: '11:00',
        slot1_fine: '13:00',
        tipo: 'FESTIVO',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-04')
    await userEvent.type(inputs[1], '11:00')
    await userEvent.type(inputs[2], '13:00')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'FESTIVO')

    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-04/i })
    expect(within(row).getByText('11:00')).toBeInTheDocument()
    expect(within(row).getByText('13:00')).toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-04',
      slot1_inizio: '11:00',
      slot1_fine: '13:00',
      slot2_inizio: null,
      slot2_fine: null,
      slot3_inizio: null,
      slot3_fine: null,
      tipo: 'FESTIVO',
      note: null,
    })
  })

  it('deletes a turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          giorno: '2023-01-01',
          slot1_inizio: '07:00',
          slot1_fine: '09:00',
          tipo: 'NORMALE',
          user_id: 'u',
        },
      ],
    })
    mockedApi.delete.mockResolvedValueOnce({})

    renderPage()

    await screen.findByText('07:00')
    await userEvent.click(screen.getByRole('button', { name: '🗑️' }))

    expect(screen.queryByText('07:00')).not.toBeInTheDocument()
    expect(mockedApi.delete).toHaveBeenCalledWith('/orari/1')
  })

  it('creates events after import', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          giorno: '2023-06-01',
          slot1_inizio: '08:00',
          slot1_fine: '10:00',
          tipo: 'NORMALE',
          user_id: 'u',
        },
      ],
    })

    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /importa/i }))

    expect(await screen.findByText('08:00')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(mockedGcApi.createShiftEvents).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ giorno: '2023-06-01' }))
  })

  it('shows imported shifts in table after import', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          giorno: '2023-06-02',
          slot1_inizio: '09:00',
          slot1_fine: '11:00',
          tipo: 'NORMALE',
          user_id: 'u',
        },
      ],
    })

    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /importa/i }))

    const tables = await screen.findAllByRole('table')
    expect(tables).toHaveLength(2)
    expect(within(tables[1]).getByText('u')).toBeInTheDocument()
    expect(within(tables[1]).getByText('2023-06-02')).toBeInTheDocument()
  })

  it('downloads weekly PDF', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-01T00:00:00Z'))
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })

    renderPage()
    await screen.findByRole('button', { name: /pdf settimana/i })

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const urlSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')

    await userEvent.click(screen.getByRole('button', { name: /pdf settimana/i }))

    expect(mockedPdfApi.getSchedulePdf).toHaveBeenCalledWith('2023-W18')
    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')

    openSpy.mockRestore()
    urlSpy.mockRestore()
  })
})
