import { render, fireEvent, waitFor } from '@testing-library/react'
import ImportHorizontalCsv from '../ImportHorizontalCsv'
import { importHorizontalCsv } from '../../api/horizontalSignage'

jest.mock('../../api/horizontalSignage', () => ({
  __esModule: true,
  importHorizontalCsv: jest.fn(),
}))

const mockedImport = importHorizontalCsv as jest.MockedFunction<typeof importHorizontalCsv>

describe('ImportHorizontalCsv', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('calls API on file upload', async () => {
    mockedImport.mockResolvedValueOnce(new Blob())
    const { container } = render(<ImportHorizontalCsv />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['1'], 'test.csv')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockedImport).toHaveBeenCalledWith(file)
    })
  })
})
