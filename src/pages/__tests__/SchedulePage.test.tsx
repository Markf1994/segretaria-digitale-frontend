import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SchedulePage from '../SchedulePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import api from '../../api/axios'
import * as pdfApi from '../../api/pdfs'
import * as gcApi from '../../api/googleCalendar'
import * as scheduleApi from '../../api/schedule'

jest.mock('../../components/ImportExcel', () => ({
  __esModule: true,
  default: ({ onComplete }: any) => (
    <button
      onClick={() => {
        const url = URL.createObjectURL(new Blob())
        window.open(url, '_blank')
        onComplete(true)
      }}
    >
      Importa
    </button>
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
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  signIn: jest.fn(),
}))

jest.mock('../../api/schedule', () => {
  const actual = jest.requireActual('../../api/schedule')
  return {
    __esModule: true,
    ...actual,
    deleteTurno: jest.fn(),
  }
})

const mockedApi = api as jest.Mocked<typeof api>
const mockedPdfApi = pdfApi as jest.Mocked<typeof pdfApi>
const mockedGcApi = gcApi as jest.Mocked<typeof gcApi>
const mockedScheduleApi = scheduleApi as jest.Mocked<typeof scheduleApi>

beforeEach(() => {
  jest.resetAllMocks()
  mockedApi.get.mockResolvedValue({ data: [] })
  mockedPdfApi.getSchedulePdf.mockResolvedValue(new Blob())
  mockedGcApi.createShiftEvents.mockResolvedValue([])
  mockedGcApi.updateEvent.mockResolvedValue({})
  mockedGcApi.deleteEvent.mockResolvedValue()
  mockedGcApi.signIn.mockResolvedValue()
  mockedScheduleApi.deleteTurno.mockResolvedValue()
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
              inizio_1: '08:00',
              fine_1: '10:00',
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

  it('filters turni by agent', async () => {
    mockedApi.get.mockImplementation(url => {
      if (url === '/users/')
        return Promise.resolve({
          data: [
            { id: 'a', email: 'a@e', nome: 'a' },
            { id: 'b', email: 'b@e', nome: 'b' },
          ],
        })
      if (url === '/orari/')
        return Promise.resolve({
          data: [
            {
              id: '1',
              giorno: '2023-01-01',
              inizio_1: '08:00',
              fine_1: '10:00',
              tipo: 'NORMALE',
              user_id: 'a',
            },
            {
              id: '2',
              giorno: '2023-01-02',
              inizio_1: '09:00',
              fine_1: '11:00',
              tipo: 'NORMALE',
              user_id: 'b',
            },
          ],
        })
      return Promise.resolve({ data: [] })
    })

    renderPage()

    await screen.findByRole('row', { name: /a\s+2023-01-01/i })
    await screen.findByRole('row', { name: /b\s+2023-01-02/i })

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[2], 'a')

    expect(screen.getByRole('row', { name: /a\s+2023-01-01/i })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /b\s+2023-01-02/i })).not.toBeInTheDocument()
  })

  it('shows only current week turni', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-03T00:00:00Z'))
    mockedApi.get.mockImplementation(url => {
      if (url === '/users/')
        return Promise.resolve({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
      if (url === '/orari/')
        return Promise.resolve({
          data: [
            {
              id: '1',
              giorno: '2023-05-03',
              inizio_1: '08:00',
              fine_1: '10:00',
              tipo: 'NORMALE',
              user_id: 'u',
            },
            {
              id: '2',
              giorno: '2023-04-28',
              inizio_1: '08:00',
              fine_1: '10:00',
              tipo: 'NORMALE',
              user_id: 'u',
            },
            {
              id: '3',
              giorno: '2023-05-10',
              inizio_1: '08:00',
              fine_1: '10:00',
              tipo: 'NORMALE',
              user_id: 'u',
            },
          ],
        })
      return Promise.resolve({ data: [] })
    })

    renderPage()

    await screen.findByRole('row', { name: /u\s+2023-05-03/i })

    expect(screen.getByRole('row', { name: /u\s+2023-05-03/i })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /2023-04-28/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /2023-05-10/i })).not.toBeInTheDocument()
  })

  it('adds a new turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '2',
        giorno: '2023-05-02',
        inizio_1: '09:00',
        fine_1: '11:00',
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
      inizio_1: '09:00',
      fine_1: '11:00',
      inizio_2: null,
      fine_2: null,
      inizio_3: null,
      fine_3: null,
      tipo: 'NORMALE',
      note: null,
    })
    expect((inputs[0] as HTMLInputElement).value).toBe('')
    expect(mockedGcApi.createShiftEvents).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      nome: 'u',
      giorno: '2023-05-02',
      tipo: 'NORMALE',
      colorId: undefined,
    }))
  })

  it('adds a new turno with tipo RIPOSO', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '3',
        giorno: '2023-05-03',
        inizio_1: null,
        fine_1: null,
        tipo: 'RIPOSO',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-03')


    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'RIPOSO')

    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-03/i })
    const cells = within(row).getAllByText('RIPOSO')
    expect(cells).toHaveLength(2)
    expect(within(row).getAllByText('—')).toHaveLength(4)
    expect(within(row).queryByText('10:00')).not.toBeInTheDocument()
    expect(within(row).queryByText('12:00')).not.toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-03',
      inizio_1: null,
      fine_1: null,
      inizio_2: null,
      fine_2: null,
      inizio_3: null,
      fine_3: null,
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
        inizio_1: null,
        fine_1: null,
        tipo: 'FESTIVO',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-04')


    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'FESTIVO')

    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-04/i })
    const cells = within(row).getAllByText('FESTIVO')
    expect(cells).toHaveLength(2)
    expect(within(row).getAllByText('—')).toHaveLength(4)
    expect(within(row).queryByText('11:00')).not.toBeInTheDocument()
    expect(within(row).queryByText('13:00')).not.toBeInTheDocument()
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-04',
      inizio_1: null,
      fine_1: null,
      inizio_2: null,
      fine_2: null,
      inizio_3: null,
      fine_3: null,
      tipo: 'FESTIVO',
      note: null,
    })
  })

  it('adds a new turno with tipo RECUPERO', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '5a',
        giorno: '2023-05-05',
        inizio_1: null,
        fine_1: null,
        tipo: 'RECUPERO',
        user_id: 'u',
      },
    })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-05')

    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'RECUPERO')

    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-05/i })
    const cells = within(row).getAllByText('RECUPERO')
    expect(cells).toHaveLength(2)
    expect(within(row).getAllByText('—')).toHaveLength(4)
    expect(mockedApi.post).toHaveBeenCalledWith('/orari/', {
      user_id: 'u',
      giorno: '2023-05-05',
      inizio_1: null,
      fine_1: null,
      inizio_2: null,
      fine_2: null,
      inizio_3: null,
      fine_3: null,
      tipo: 'RECUPERO',
      note: null,
    })
  })

  it('updates event when editing a turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '5',
        giorno: '2023-05-05',
        inizio_1: '09:00',
        fine_1: '11:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    mockedGcApi.createShiftEvents.mockResolvedValueOnce(['ev1'])

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-05')
    await userEvent.type(inputs[1], '09:00')
    await userEvent.type(inputs[2], '11:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-05/i })
    await userEvent.click(within(row).getByRole('button', { name: /modifica/i }))

    const editInputs = screen.getAllByRole('textbox')
    await userEvent.clear(editInputs[1])
    await userEvent.type(editInputs[1], '10:00')
    await userEvent.clear(editInputs[2])
    await userEvent.type(editInputs[2], '12:00')
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '5',
        giorno: '2023-05-05',
        inizio_1: '10:00',
        fine_1: '12:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    expect(mockedGcApi.updateEvent).toHaveBeenCalledWith(expect.any(String), 'ev1', expect.any(Object))
  })

  it('deletes a turno', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '6',
        giorno: '2023-05-06',
        inizio_1: '08:00',
        fine_1: '10:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    mockedGcApi.createShiftEvents.mockResolvedValueOnce(['evDel'])
    mockedScheduleApi.deleteTurno.mockResolvedValueOnce()

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-06')
    await userEvent.type(inputs[1], '08:00')
    await userEvent.type(inputs[2], '10:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-06/i })
    await userEvent.click(within(row).getByRole('button', { name: '🗑️' }))

    expect(screen.queryByText('08:00')).not.toBeInTheDocument()
    expect(mockedScheduleApi.deleteTurno).toHaveBeenCalledWith('6')
    expect(mockedGcApi.deleteEvent).toHaveBeenCalledWith(expect.any(String), 'evDel')
  })

  it('creates events after import', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          giorno: '2023-06-01',
          inizio_1: '08:00',
          fine_1: '10:00',
          tipo: 'NORMALE',
          user_id: 'u',
        },
      ],
    })

    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /importa/i }))

    expect(await screen.findByText('08:00')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
    expect(mockedGcApi.createShiftEvents).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ giorno: '2023-06-01', tipo: 'NORMALE' })
    )
  })

  it('shows imported shifts in table after import', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.get.mockResolvedValueOnce({
      data: [
        {
          id: '1',
          giorno: '2023-06-02',
          inizio_1: '09:00',
          fine_1: '11:00',
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

  it('opens PDF after import', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const urlSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')

    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /importa/i }))

    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')

    openSpy.mockRestore()
    urlSpy.mockRestore()
  })

  it('downloads weekly PDF', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-01T00:00:00Z'))
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })

    mockedPdfApi.getSchedulePdf.mockResolvedValueOnce({ blob: new Blob(), warning: undefined })

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

  it('shows warning when PDF API returns it', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-01T00:00:00Z'))
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedPdfApi.getSchedulePdf.mockResolvedValueOnce({ blob: new Blob(), warning: 'GC failed' })

    renderPage()
    await screen.findByRole('button', { name: /pdf settimana/i })
    await userEvent.click(screen.getByRole('button', { name: /pdf settimana/i }))

    expect(await screen.findByText('GC failed')).toBeInTheDocument()
  })

  it('shows error when creating calendar events fails', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedGcApi.createShiftEvents.mockRejectedValueOnce(new Error('fail'))

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-07')
    await userEvent.type(inputs[1], '08:00')
    await userEvent.type(inputs[2], '10:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument()
  })

  it('shows error when updating calendar events fails', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '7',
        giorno: '2023-05-08',
        inizio_1: '08:00',
        fine_1: '10:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    mockedGcApi.createShiftEvents.mockResolvedValueOnce(['ev7'])

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-08')
    await userEvent.type(inputs[1], '08:00')
    await userEvent.type(inputs[2], '10:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-08/i })
    await userEvent.click(within(row).getByRole('button', { name: /modifica/i }))

    const editInputs = screen.getAllByRole('textbox')
    await userEvent.type(editInputs[1], '09:00')
    await userEvent.type(editInputs[2], '11:00')
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '7',
        giorno: '2023-05-08',
        inizio_1: '09:00',
        fine_1: '11:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    mockedGcApi.updateEvent.mockRejectedValueOnce(new Error('fail'))
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument()
  })

  it('shows error when deleting calendar events fails', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '8',
        giorno: '2023-05-09',
        inizio_1: '08:00',
        fine_1: '10:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    mockedGcApi.createShiftEvents.mockResolvedValueOnce(['evDelErr'])
    mockedGcApi.deleteEvent.mockRejectedValueOnce(new Error('fail'))

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-09')
    await userEvent.type(inputs[1], '08:00')
    await userEvent.type(inputs[2], '10:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-09/i })
    await userEvent.click(within(row).getByRole('button', { name: '🗑️' }))

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument()
  })

  it('shows error and stores id when deleting turno fails', async () => {
    localStorage.clear()
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })
    mockedApi.get.mockResolvedValueOnce({ data: [] })
    mockedApi.post.mockResolvedValueOnce({
      data: {
        id: '9',
        giorno: '2023-05-10',
        inizio_1: '08:00',
        fine_1: '10:00',
        tipo: 'NORMALE',
        user_id: 'u',
      },
    })
    mockedScheduleApi.deleteTurno.mockRejectedValueOnce(new Error('fail'))

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })
    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-05-10')
    await userEvent.type(inputs[1], '08:00')
    await userEvent.type(inputs[2], '10:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-05-10/i })
    await userEvent.click(within(row).getByRole('button', { name: '🗑️' }))

    expect(await screen.findByText('Errore durante la cancellazione del turno')).toBeInTheDocument()
    expect(localStorage.getItem('pendingTurnoDeletes')).toBe(JSON.stringify(['9']))
  })

  it('retries pending deletes when back online', async () => {
    localStorage.setItem('pendingTurnoDeletes', JSON.stringify(['a1']))
    renderPage()

    window.dispatchEvent(new Event('online'))

    await waitFor(() => expect(mockedScheduleApi.deleteTurno).toHaveBeenCalledWith('a1'))
    expect(localStorage.getItem('pendingTurnoDeletes')).toBe(null)
  })
})

describe('SchedulePage offline', () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true })
  })

  it('loads turni from storage when offline', async () => {
    localStorage.setItem(
      'turni',
      JSON.stringify([
        {
          id: '1',
          user_id: 'u',
          giorno: '2023-01-01',
          inizio_1: '08:00',
          fine_1: '10:00',
          inizio_2: null,
          fine_2: null,
          inizio_3: null,
          fine_3: null,
          tipo: 'NORMALE',
          note: null,
        },
      ])
    )
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })

    renderPage()

    expect(await screen.findByRole('row', { name: /u\s+2023-01-01/i })).toBeInTheDocument()
    expect(mockedApi.get).toHaveBeenCalledWith('/users/')
    expect(mockedApi.get).not.toHaveBeenCalledWith('/orari/')
  })

  it('adds a turno offline', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })

    renderPage()
    await screen.findByRole('button', { name: /salva turno/i })

    const inputs = screen.getAllByRole('textbox')
    await userEvent.type(inputs[0], '2023-06-01')
    await userEvent.type(inputs[1], '09:00')
    await userEvent.type(inputs[2], '11:00')
    await userEvent.click(screen.getByRole('button', { name: /salva turno/i }))

    const row = await screen.findByRole('row', { name: /u\s+2023-06-01/i })
    expect(within(row).getByText('09:00')).toBeInTheDocument()
    expect(mockedApi.post).not.toHaveBeenCalled()
  })

  it('deletes a turno offline', async () => {
    localStorage.setItem(
      'turni',
      JSON.stringify([
        {
          id: '1',
          user_id: 'u',
          giorno: '2023-06-02',
          inizio_1: '08:00',
          fine_1: '10:00',
          inizio_2: null,
          fine_2: null,
          inizio_3: null,
          fine_3: null,
          tipo: 'NORMALE',
          note: null,
        },
      ])
    )
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 'u', email: 'u@e', nome: 'u' }] })

    renderPage()

    await screen.findByText('08:00')
    await userEvent.click(screen.getByRole('button', { name: '🗑️' }))

    expect(screen.queryByText('08:00')).not.toBeInTheDocument()
    expect(mockedScheduleApi.deleteTurno).not.toHaveBeenCalled()
    expect(localStorage.getItem('pendingTurnoDeletes')).toBe(JSON.stringify(['1']))
  })
})
