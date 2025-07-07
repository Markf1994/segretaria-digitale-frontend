import { createShiftEvents, signIn } from '../googleCalendar'

describe('createShiftEvents', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    ;(global as any).fetch = fetchMock
    fetchMock.mockResolvedValue({ json: () => Promise.resolve({ id: '1' }) })
    fetchMock.mockClear()
  })

  it('creates an event for each slot', async () => {
    const ids = await createShiftEvents('cal', {
      userEmail: 'u@e',
      giorno: '2023-05-01',
      slot1: { inizio: '08:00', fine: '09:00' },
      slot2: { inizio: '10:00', fine: '11:00' },
      note: 'note',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/cal/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          summary: 'u@e',
          description: 'note',
          start: { dateTime: '2023-05-01T08:00' },
          end: { dateTime: '2023-05-01T09:00' },
        }),
      }),
    )
    expect(ids).toEqual(['1', '1'])
  })
})

describe('signIn', () => {
  it('initializes google identity clients', async () => {
    const initialize = jest.fn()
    const requestAccessToken = jest.fn()
    const initTokenClient = jest.fn().mockReturnValue({ requestAccessToken })
    ;(window as any).google = {
      accounts: {
        id: { initialize },
        oauth2: { initTokenClient },
      },
    }

    await signIn()

    expect(initialize).toHaveBeenCalled()
    expect(initTokenClient).toHaveBeenCalled()
    expect(requestAccessToken).toHaveBeenCalled()
  })
})

