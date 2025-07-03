describe('axios request interceptor', () => {
  const api = require('../axios').default
  const { useAuthStore } = require('../../store/auth')

  beforeEach(() => {
    useAuthStore.getState().setToken('test-token')
  })

  it('does not set Authorization header for /login requests', () => {
    const fulfilled = api.interceptors.request.handlers[0].fulfilled
    const config = fulfilled({ url: '/login', headers: {} })
    expect(config.headers.Authorization).toBeUndefined()
  })
})

