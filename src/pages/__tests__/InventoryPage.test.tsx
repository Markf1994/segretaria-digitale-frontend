import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as devicesApi from '../../api/devices'
import * as tempApi from '../../api/temporarySignage'
import * as vertApi from '../../api/verticalSignage'
import * as planApi from '../../api/horizontalPlans'
import * as horizApi from '../../api/horizontalSignage'

jest.mock('../../api/devices', () => ({
  __esModule: true,
  listDevices: jest.fn(),
  createDevice: jest.fn(),
  updateDevice: jest.fn(),
  deleteDevice: jest.fn(),
}))

jest.mock('../../api/temporarySignage', () => ({
  __esModule: true,
  listTemporarySignage: jest.fn(),
  createTemporarySignage: jest.fn(),
  updateTemporarySignage: jest.fn(),
  deleteTemporarySignage: jest.fn(),
}))

jest.mock('../../api/verticalSignage', () => ({
  __esModule: true,
  listVerticalSignage: jest.fn(),
  createVerticalSignage: jest.fn(),
  updateVerticalSignage: jest.fn(),
  deleteVerticalSignage: jest.fn(),
}))

jest.mock('../../api/horizontalPlans', () => ({
  __esModule: true,
  listHorizontalPlans: jest.fn(),
  createHorizontalPlan: jest.fn(),
  updateHorizontalPlan: jest.fn(),
  deleteHorizontalPlan: jest.fn(),
}))

jest.mock('../../api/horizontalSignage', () => ({
  __esModule: true,
  listHorizontalSignage: jest.fn(),
  createHorizontalSignage: jest.fn(),
  updateHorizontalSignage: jest.fn(),
  deleteHorizontalSignage: jest.fn(),
  getHorizontalSignagePdf: jest.fn(),
  listHorizontalSignageByPlan: jest.fn(),
}))

const mockedDevices = devicesApi as jest.Mocked<typeof devicesApi>
const mockedTemps = tempApi as jest.Mocked<typeof tempApi>
const mockedVerts = vertApi as jest.Mocked<typeof vertApi>
const mockedPlans = planApi as jest.Mocked<typeof planApi>
const mockedHoriz = horizApi as jest.Mocked<typeof horizApi>

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  mockedDevices.listDevices.mockResolvedValue([])
  mockedTemps.listTemporarySignage.mockResolvedValue([])
  mockedVerts.listVerticalSignage.mockResolvedValue([])
  mockedPlans.listHorizontalPlans.mockResolvedValue([])
  mockedHoriz.listHorizontalSignage.mockResolvedValue([])
  mockedHoriz.listHorizontalSignageByPlan.mockResolvedValue([])
  mockedHoriz.getHorizontalSignagePdf.mockResolvedValue(new Blob())
  mockedDevices.createDevice.mockResolvedValue({ id: '1', nome: 'Device 1' } as any)
  mockedTemps.createTemporarySignage.mockResolvedValue({
    id: 't1',
    luogo: 'Luogo',
    fine_validita: '2024-01-01',
  } as any)
  mockedHoriz.createHorizontalSignage.mockResolvedValue({
    id: 'h1',
    luogo: 'Luogo',
    data: '2024-01-01',
  } as any)
})

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/inventario']}>
      <Routes>
        <Route element={<PageTemplate />}>
          <Route path="/inventario" element={<InventoryPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('InventoryPage', () => {
  it('shows add buttons and opens device modal', async () => {
    renderPage()
    const addButtons = screen.getAllByRole('button', { name: /aggiungi/i })
    expect(addButtons.length).toBeGreaterThan(0)
    const dialog = screen.getAllByRole('dialog')[0]
    expect(dialog).not.toHaveAttribute('open')

    await userEvent.click(addButtons[0])

    expect(dialog).toHaveAttribute('open')
    expect(screen.getByTestId('dev-name')).toBeInTheDocument()
    expect(screen.getByTestId('dev-desc')).toBeInTheDocument()
    expect(screen.getByTestId('dev-year')).toBeInTheDocument()
  })

  it('saves and cancels via modal', async () => {
    renderPage()
    const addButtons = screen.getAllByRole('button', { name: /aggiungi/i })
    const dialog = screen.getAllByRole('dialog')[0]

    await userEvent.click(addButtons[0])
    await userEvent.type(screen.getByTestId('dev-name'), 'Device 1')
    await userEvent.type(screen.getByTestId('dev-desc'), 'Desc')
    await userEvent.type(screen.getByTestId('dev-year'), '2024')
    await userEvent.click(screen.getByTestId('dev-submit'))

    expect(mockedDevices.createDevice).toHaveBeenCalledWith({
      nome: 'Device 1',
      descrizione: 'Desc',
      anno: 2024,
      note: '',
    })
    await screen.findByText('Device 1')
    expect(dialog).not.toHaveAttribute('open')

    await userEvent.click(addButtons[0])
    await userEvent.type(screen.getByTestId('dev-name'), 'Device 2')
    await userEvent.type(screen.getByTestId('dev-desc'), 'Desc')
    await userEvent.type(screen.getByTestId('dev-year'), '2024')
    await userEvent.click(screen.getByTestId('dev-cancel'))

    expect(mockedDevices.createDevice).toHaveBeenCalledTimes(1)
    expect(dialog).not.toHaveAttribute('open')
    expect(screen.queryByText('Device 2')).not.toBeInTheDocument()
  })

  it('creates temporary signage with year', async () => {
    renderPage()
    const addButtons = screen.getAllByRole('button', { name: /aggiungi/i })

    await userEvent.click(addButtons[1])
    await userEvent.type(screen.getByTestId('temp-luogo'), 'Luogo')
    await userEvent.type(screen.getByTestId('temp-fine'), '2024-01-01')
    await userEvent.type(screen.getByTestId('temp-desc'), 'Desc')
    await userEvent.type(screen.getByTestId('temp-anno'), '2024')
    await userEvent.type(screen.getByTestId('temp-quant'), '3')
    await userEvent.click(screen.getByTestId('temp-submit'))

    expect(mockedTemps.createTemporarySignage).toHaveBeenCalledWith({
      luogo: 'Luogo',
      fine_validita: '2024-01-01',
      descrizione: 'Desc',
      anno: 2024,
      quantita: 3,
    })
  })

  it('opens interventions modal', async () => {
    mockedPlans.listHorizontalPlans.mockResolvedValueOnce([
      { id: 'p1', descrizione: 'Piano 1', anno: 2024 } as any,
    ])
    renderPage()

    const row = await screen.findByRole('row', { name: /piano 1/i })
    const seeBtn = within(row).getByRole('button', { name: /vedi interventi/i })
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs[4]).not.toHaveAttribute('open')

    await userEvent.click(seeBtn)

    expect(dialogs[4]).toHaveAttribute('open')
    expect(mockedHoriz.listHorizontalSignageByPlan).toHaveBeenCalledWith('p1')
  })

  it('adds horizontal intervention', async () => {
    mockedPlans.listHorizontalPlans.mockResolvedValueOnce([
      { id: 'p1', descrizione: 'Piano 1', anno: 2024 } as any,
    ])
    renderPage()

    const row = await screen.findByRole('row', { name: /piano 1/i })
    const seeBtn = within(row).getByRole('button', { name: /vedi interventi/i })
    await userEvent.click(seeBtn)

    const interventions = screen.getAllByRole('dialog')[4]
    await userEvent.click(within(interventions).getByRole('button', { name: /aggiungi/i }))

    const horizDialog = screen.getAllByRole('dialog')[5]
    const withinHoriz = within(horizDialog)
    const [luogoInput, dateInput, descInput] = withinHoriz.getAllByRole('textbox')
    await userEvent.type(luogoInput, 'Luogo')
    await userEvent.type(dateInput, '2024-01-01')
    await userEvent.type(descInput, 'Desc')
    await userEvent.type(withinHoriz.getByPlaceholderText('Quantità'), '2')
    await userEvent.click(withinHoriz.getByRole('button', { name: /aggiungi/i }))

    expect(mockedHoriz.createHorizontalSignage).toHaveBeenCalledWith({
      luogo: 'Luogo',
      data: '2024-01-01',
      descrizione: 'Desc',
      quantita: 2,
      piano_id: 'p1',
    })
  })

  it('downloads PDF by year', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const urlSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')

    renderPage()
    await userEvent.type(screen.getByTestId('hor-year'), '2023')
    await userEvent.click(screen.getByTestId('hor-pdf'))

    expect(mockedHoriz.getHorizontalSignagePdf).toHaveBeenCalledWith(2023)
    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')

    openSpy.mockRestore()
    urlSpy.mockRestore()
  })
})
