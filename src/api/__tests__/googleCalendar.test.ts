import { createShiftEvents, signIn } from '../googleCalendar'

describe('createShiftEvents', () => {
  const insert = jest.fn().mockResolvedValue({ result: { id: '1' } })
  beforeEach(() => {
    ;(window as any).gapi = {
      client: { calendar: { events: { insert } } },
    }
    insert.mockClear()
  })

  it('creates an event for each slot', async () => {
    const ids = await createShiftEvents('cal', {
      userEmail: 'u@e',
      giorno: '2023-05-01',
      slot1: { inizio: '08:00', fine: '09:00' },
      slot2: { inizio: '10:00', fine: '11:00' },
      note: 'note',
    })

    expect(insert).toHaveBeenCalledTimes(2)
    expect(insert).toHaveBeenCalledWith({
      calendarId: 'cal',
      resource: {
        summary: 'u@e',
        description: 'note',
        start: { dateTime: '2023-05-01T08:00' },
        end: { dateTime: '2023-05-01T09:00' },
      },
    })
    expect(ids).toEqual(['1', '1'])
  })
})

describe('signIn', () => {
  it('initializes google identity clients', async () => {
    const initialize = jest.fn()
    const initTokenClient = jest.fn().mockReturnValue({ requestAccessToken: jest.fn() })
    ;(window as any).google = {
      accounts: {
        id: { initialize },
        oauth2: { initTokenClient },
      },
    }

    await signIn()

    expect(initialize).toHaveBeenCalled()
    expect(initTokenClient).toHaveBeenCalled()
  })
})

