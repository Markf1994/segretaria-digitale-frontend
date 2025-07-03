import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportExcel from '../ImportExcel'
import api from '../../api/axios'

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('ImportExcel', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('revokes object URL after successful import', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: new Blob() })

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    const createSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:1')
    const revokeSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const { container } = render(<ImportExcel />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['1'], 'test.xlsx')
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank')
    })
    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith('blob:1')
    })

    openSpy.mockRestore()
    createSpy.mockRestore()
    revokeSpy.mockRestore()
  })
})
