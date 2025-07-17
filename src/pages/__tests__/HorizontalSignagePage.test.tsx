import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HorizontalSignagePage from '../HorizontalSignagePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as planApi from '../../api/horizontalPlans'
import * as horizApi from '../../api/horizontalSignage'

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

const mockedPlans = planApi as jest.Mocked<typeof planApi>
const mockedHoriz = horizApi as jest.Mocked<typeof horizApi>

beforeEach(() => {
  jest.resetAllMocks()
  mockedPlans.listHorizontalPlans.mockResolvedValue([])
  mockedHoriz.listHorizontalSignage.mockResolvedValue([])
  mockedHoriz.listHorizontalSignageByPlan.mockResolvedValue([])
  mockedHoriz.getHorizontalSignagePdf.mockResolvedValue(new Blob())
  mockedHoriz.createHorizontalSignage.mockResolvedValue({
    id: 'h1',
    luogo: 'Luogo',
    data: '2024-01-01',
  } as any)
})

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/segnaletica-orizzontale']}>
      <Routes>
        <Route element={<PageTemplate />}>
          <Route path="/segnaletica-orizzontale" element={<HorizontalSignagePage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('HorizontalSignagePage', () => {
  it('opens interventions modal', async () => {
    mockedPlans.listHorizontalPlans.mockResolvedValueOnce([
      { id: 'p1', descrizione: 'Piano 1', anno: 2024 } as any,
    ])
    renderPage()

    const row = await screen.findByRole('row', { name: /piano 1/i })
    const seeBtn = within(row).getByRole('button', { name: /vedi interventi/i })
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs[1]).not.toHaveAttribute('open')

    await userEvent.click(seeBtn)

    expect(dialogs[1]).toHaveAttribute('open')
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

    const interventions = screen.getAllByRole('dialog')[1]
    await userEvent.click(within(interventions).getByRole('button', { name: /aggiungi/i }))

    const horizDialog = screen.getAllByRole('dialog')[2]
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
