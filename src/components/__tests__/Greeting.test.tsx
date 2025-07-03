import { render, screen } from '@testing-library/react'
import Greeting from '../Greeting'
import { useAuthStore } from '../../store/auth'

jest.mock('../../store/auth')

const mockedUseAuthStore = useAuthStore as jest.Mock

const user = { id: '1', nome: 'Mario', email: 'mario@example.com' }

describe('Greeting', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('shows morning greeting', () => {
    mockedUseAuthStore.mockImplementation((sel: any) => sel({ user }))
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(9)
    render(<Greeting />)
    expect(screen.getByText(/Buongiorno Mario/i)).toBeInTheDocument()
  })

  it('shows afternoon greeting', () => {
    mockedUseAuthStore.mockImplementation((sel: any) => sel({ user }))
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15)
    render(<Greeting />)
    expect(screen.getByText(/Buon pomeriggio Mario/i)).toBeInTheDocument()
  })

  it('shows evening greeting', () => {
    mockedUseAuthStore.mockImplementation((sel: any) => sel({ user }))
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(20)
    render(<Greeting />)
    expect(screen.getByText(/Buonasera Mario/i)).toBeInTheDocument()
  })
})
