import { render, fireEvent, waitFor } from '@testing-library/react'
import ImportHorizontalExcel from '../ImportHorizontalExcel'
import * as horizApi from '../../api/horizontalSignage'

jest.mock('../../api/horizontalSignage', () => ({
  __esModule: true,
  importHorizontalExcel: jest.fn(),
}))

const mockedImport = horizApi.importHorizontalExcel as jest.MockedFunction<typeof horizApi.importHorizontalExcel>

describe('ImportHorizontalExcel', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('calls API when file selected', async () => {
    mockedImport.mockResolvedValueOnce(new Blob())

    const { container } = render(<ImportHorizontalExcel />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['1'], 'test.xlsx')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockedImport).toHaveBeenCalledWith(file)
    })
  })
})
