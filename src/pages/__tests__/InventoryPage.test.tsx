import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as devicesApi from '../../api/devices'
import * as tempApi from '../../api/temporarySignage'
import * as vertApi from '../../api/verticalSignage'

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


const mockedDevices = devicesApi as jest.Mocked<typeof devicesApi>
const mockedTemps = tempApi as jest.Mocked<typeof tempApi>
const mockedVerts = vertApi as jest.Mocked<typeof vertApi>


beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  mockedDevices.listDevices.mockResolvedValue([])
  mockedTemps.listTemporarySignage.mockResolvedValue([])
  mockedVerts.listVerticalSignage.mockResolvedValue([])

  mockedDevices.createDevice.mockResolvedValue({ id: '1', nome: 'Device 1' } as any)
  mockedTemps.createTemporarySignage.mockResolvedValue({
    id: 't1',
    luogo: 'Luogo',
    fine_validita: '2024-01-01',
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

})
