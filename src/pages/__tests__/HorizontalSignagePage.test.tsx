import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HorizontalSignagePage from '../HorizontalSignagePage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as horizApi from '../../api/horizontalSignage'

jest.mock('../../api/horizontalSignage', () => ({
  __esModule: true,
  listHorizontalYears: jest.fn(),
  listHorizontalByYear: jest.fn(),
  getHorizontalSignagePdf: jest.fn(),
}))

const mockedHoriz = horizApi as jest.Mocked<typeof horizApi>

beforeEach(() => {
  jest.resetAllMocks()
  mockedHoriz.listHorizontalYears.mockResolvedValue([])
  mockedHoriz.listHorizontalByYear.mockResolvedValue([])
  mockedHoriz.getHorizontalSignagePdf.mockResolvedValue(new Blob())
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
    mockedHoriz.listHorizontalYears.mockResolvedValueOnce([2024])
    mockedHoriz.listHorizontalByYear.mockResolvedValueOnce([
      { id: 'i1', luogo: 'Az', descrizione: 'Desc', data: '2024-01-01' } as any,
    ])
    renderPage()

    const row = await screen.findByRole('row', { name: /2024/i })
    const seeBtn = within(row).getByRole('button', { name: /vedi interventi/i })
    const dialog = screen.getByRole('dialog')
    expect(dialog).not.toHaveAttribute('open')

    await userEvent.click(seeBtn)

    expect(mockedHoriz.listHorizontalByYear).toHaveBeenCalledWith(2024)
    expect(dialog).toHaveAttribute('open')
    expect(within(dialog).getByText('Az')).toBeInTheDocument()
  })

  it('downloads PDF by year', async () => {
    mockedHoriz.listHorizontalYears.mockResolvedValueOnce([2023])
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const urlSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')

    renderPage()

    const row = await screen.findByRole('row', { name: /2023/i })
    const pdfBtn = within(row).getByRole('button', { name: /pdf/i })
    await userEvent.click(pdfBtn)

    expect(mockedHoriz.getHorizontalSignagePdf).toHaveBeenCalledWith(2023)
    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')

    openSpy.mockRestore()
    urlSpy.mockRestore()
  })

  it('shows import button', async () => {
    renderPage()
    expect(await screen.findByRole('button', { name: /importa excel/i })).toBeInTheDocument()
  })
})
