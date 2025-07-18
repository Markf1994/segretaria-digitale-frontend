import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VerticalTempSignagePage from '../VerticalTempSignagePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as tempApi from '../../api/temporarySignage'
import * as vertApi from '../../api/verticalSignage'

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

const mockedTemps = tempApi as jest.Mocked<typeof tempApi>
const mockedVerts = vertApi as jest.Mocked<typeof vertApi>

beforeEach(() => {
  jest.resetAllMocks()
  localStorage.clear()
  mockedTemps.listTemporarySignage.mockResolvedValue([])
  mockedVerts.listVerticalSignage.mockResolvedValue([])

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
          <Route path="/inventario" element={<VerticalTempSignagePage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('VerticalTempSignagePage', () => {
  it('creates temporary signage with year', async () => {
    renderPage()
    const addButtons = screen.getAllByRole('button', { name: /aggiungi/i })

    await userEvent.click(addButtons[0])
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
