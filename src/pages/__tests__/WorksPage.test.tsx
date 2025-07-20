import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WorksPage from '../WorksPage'
import PageTemplate from '../../components/PageTemplate'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import * as worksApi from '../../api/works'

jest.mock('../../api/works', () => ({
  __esModule: true,
  listYears: jest.fn(),
  listByYear: jest.fn(),
  createWork: jest.fn(),
  updateWork: jest.fn(),
  deleteWork: jest.fn(),
  getPdf: jest.fn(),
}))

const mockedApi = worksApi as jest.Mocked<typeof worksApi>

beforeEach(() => {
  jest.resetAllMocks()
  mockedApi.listYears.mockResolvedValue([])
  mockedApi.listByYear.mockResolvedValue([])
  mockedApi.getPdf.mockResolvedValue(new Blob())
  mockedApi.createWork.mockResolvedValue({ id: '1', descrizione: 'Desc' } as any)
})

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/works"]}>
      <Routes>
        <Route element={<PageTemplate />}>
          <Route path="/works" element={<WorksPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('WorksPage', () => {
  it('adds work for selected year', async () => {
    mockedApi.listYears.mockResolvedValueOnce([2024])
    mockedApi.listByYear.mockResolvedValueOnce([])
    renderPage()

    await userEvent.selectOptions(screen.getByRole('combobox'), '2024')
    await userEvent.type(screen.getByTestId('work-desc'), 'Desc')
    await userEvent.click(screen.getByTestId('work-submit'))

    expect(mockedApi.createWork).toHaveBeenCalledWith({
      descrizione: 'Desc',
      azienda: undefined,
    })
  })

  it('downloads pdf', async () => {
    mockedApi.listYears.mockResolvedValueOnce([2023])
    mockedApi.listByYear.mockResolvedValueOnce([])
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const urlSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:1')
    renderPage()

    await userEvent.selectOptions(screen.getByRole('combobox'), '2023')
    await userEvent.click(screen.getByRole('button', { name: /pdf/i }))

    expect(mockedApi.getPdf).toHaveBeenCalledWith(2023)
    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')

    openSpy.mockRestore()
    urlSpy.mockRestore()
  })
})
