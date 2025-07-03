import { getUtente } from '../users'
import api from '../axios'

jest.mock('../axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

const mockedApi = api as jest.Mocked<typeof api>

describe('getUtente', () => {
  it('requests user by email via query params', () => {
    getUtente('u@e')
    expect(mockedApi.get).toHaveBeenCalledWith('/users', { params: { email: 'u@e' } })
  })
})
