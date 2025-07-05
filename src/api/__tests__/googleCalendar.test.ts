import { createShiftEvents, signIn } from '../googleCalendar'

describe('createShiftEvents', () => {
  const insert = jest.fn().mockResolvedValue({})
  beforeEach(() => {
    ;(window as any).gapi = {
      client: { calendar: { events: { insert } } },
    }
    insert.mockClear()
  })

  it('creates an event for each slot', async () => {
    await createShiftEvents('cal', {
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
  })
})

describe('signIn', () => {
  it('waits for gapi.load before initializing client', async () => {
    const init = jest.fn().mockResolvedValue({})
    const sign = jest.fn().mockResolvedValue({})
    const load = jest.fn()
    ;(window as any).gapi = {
      load,
      client: { init },
      auth2: { getAuthInstance: () => ({ signIn: sign }) },
    }

    load.mockImplementation((_lib, opts) => {
      setTimeout(opts.callback, 0)
    })

    const promise = signIn()
    expect(load).toHaveBeenCalledWith(
      'client:auth2',
      expect.objectContaining({ callback: expect.any(Function), onerror: expect.any(Function) })
    )
    expect(init).not.toHaveBeenCalled()
    await promise
    expect(init).toHaveBeenCalled()
  })
})

