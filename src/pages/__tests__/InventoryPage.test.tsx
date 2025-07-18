import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InventoryPage from '../InventoryPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as devicesApi from '../../api/devices'


jest.mock('../../api/devices', () => ({
  __esModule: true,
  listDevices: jest.fn(),
  createDevice: jest.fn(),
  updateDevice: jest.fn(),
  deleteDevice: jest.fn(),
}))




const mockedDevices = devicesApi as jest.Mocked<typeof devicesApi>


beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  mockedDevices.listDevices.mockResolvedValue([])

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


})
