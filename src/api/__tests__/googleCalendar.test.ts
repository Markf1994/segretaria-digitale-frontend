import { createShiftEvents, signIn, formatDateTime } from '../googleCalendar'

describe('createShiftEvents', () => {
  const fetchMock = jest.fn()
  beforeEach(() => {
    ;(global as any).fetch = fetchMock
    fetchMock.mockResolvedValue({ json: () => Promise.resolve({ id: '1' }) })
    fetchMock.mockClear()
  })

  it('creates an event for each slot', async () => {
    const ids = await createShiftEvents('cal', {
      nome: 'u',
      giorno: '2023-05-01',
      slot1: { inizio: '08:00', fine: '09:00' },
      slot2: { inizio: '10:00', fine: '11:00' },
      note: 'note',
      colorId: '5',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/cal/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          summary: 'turno u',
          description: 'note',
          start: { dateTime: formatDateTime('2023-05-01T08:00:00') },
          end: { dateTime: formatDateTime('2023-05-01T09:00:00') },
          colorId: '5',
        }),
      }),
    )
    expect(ids).toEqual(['1', '1'])
  })

  it('creates events without slot1', async () => {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve({ id: '1' }) })

    const ids = await createShiftEvents('cal', {
      nome: 'u',
      giorno: '2023-05-02',
      slot2: { inizio: '10:00', fine: '11:00' },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/cal/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          summary: 'turno u',
          description: undefined,
          start: { dateTime: formatDateTime('2023-05-02T10:00:00') },
          end: { dateTime: formatDateTime('2023-05-02T11:00:00') },
        }),
      }),
    )
    expect(ids).toEqual(['1'])
  })

  it('maps tipo to colorId', async () => {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve({ id: '1' }) })

    await createShiftEvents('cal', {
      userEmail: 'u@e',
      giorno: '2023-05-03',
      slot1: { inizio: '08:00', fine: '09:00' },
      tipo: 'NORMALE',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/cal/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(
          expect.objectContaining({ colorId: '1' })
        ),
      }),
    )
  })

  it('maps nome to colorId', async () => {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve({ id: '1' }) })

    await createShiftEvents('cal', {
      nome: 'Ag.Sc. Fenaroli Marco',
      giorno: '2023-05-04',
      slot1: { inizio: '08:00', fine: '09:00' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/calendar/v3/calendars/cal/events',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(
          expect.objectContaining({ colorId: '10' })
        ),
      }),
    )
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

