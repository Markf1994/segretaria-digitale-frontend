import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as devicesApi from '../../api/devices'
import * as tempApi from '../../api/temporarySignage'
import * as vertApi from '../../api/verticalSignage'
import * as planApi from '../../api/horizontalPlans'
import * as horApi from '../../api/horizontalSignage'

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
  getHorizontalSignagePdf: jest.fn(),
}))

const mockedDevices = devicesApi as jest.Mocked<typeof devicesApi>
const mockedTemps = tempApi as jest.Mocked<typeof tempApi>
const mockedVerts = vertApi as jest.Mocked<typeof vertApi>
const mockedPlans = planApi as jest.Mocked<typeof planApi>
const mockedHoriz = horApi as jest.Mocked<typeof horApi>

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  mockedDevices.listDevices.mockResolvedValue([])
  mockedTemps.listTemporarySignage.mockResolvedValue([])
  mockedVerts.listVerticalSignage.mockResolvedValue([])
  mockedPlans.listHorizontalPlans.mockResolvedValue([])
  mockedHoriz.listHorizontalSignage.mockResolvedValue([])
  mockedHoriz.getHorizontalSignagePdf.mockResolvedValue(new Blob())
  mockedDevices.createDevice.mockResolvedValue({ id: '1', nome: 'Device 1' } as any)
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

  it('adds a new horizontal plan', async () => {
    mockedPlans.createHorizontalPlan.mockResolvedValue({ id: 'p1', descrizione: 'Plan 1', anno: 2024 } as any)

    renderPage()

    const addButtons = screen.getAllByRole('button', { name: /aggiungi/i })
    const dialog = screen.getAllByRole('dialog')[3]

    await userEvent.click(addButtons[3])
    await userEvent.type(screen.getByTestId('plan-desc'), 'Plan 1')
    await userEvent.type(screen.getByTestId('plan-anno'), '2024')
    await userEvent.click(screen.getByTestId('plan-submit'))

    expect(mockedPlans.createHorizontalPlan).toHaveBeenCalledWith({ descrizione: 'Plan 1', anno: 2024 })
    await screen.findByText('Plan 1')
    expect(dialog).not.toHaveAttribute('open')
  })

  it('opens interventions modal', async () => {
    mockedPlans.listHorizontalPlans.mockResolvedValueOnce([{ id: 'p1', descrizione: 'Plan 1', anno: 2024 }])
    mockedHoriz.listHorizontalSignage.mockResolvedValueOnce([
      { id: 'h1', luogo: 'Via Roma', data: '2024-01-01', descrizione: 'Segn', quantita: 1, piano_id: 'p1' },
    ])

    renderPage()

    await screen.findByText('Plan 1')

    const dialog = screen.getAllByRole('dialog')[4]
    expect(dialog).not.toHaveAttribute('open')

    await userEvent.click(screen.getByRole('button', { name: /vedi interventi/i }))

    expect(mockedHoriz.listHorizontalSignage).toHaveBeenCalled()
    expect(dialog).toHaveAttribute('open')
    expect(await screen.findByText('Via Roma')).toBeInTheDocument()
  })

  it('downloads PDF for horizontal signage', async () => {
    renderPage()

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const urlSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')

    await userEvent.type(screen.getByTestId('hor-year'), '2024')
    await userEvent.click(screen.getByTestId('hor-pdf'))

    expect(mockedHoriz.getHorizontalSignagePdf).toHaveBeenCalledWith(2024)
    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')

    openSpy.mockRestore()
    urlSpy.mockRestore()
  })
})
