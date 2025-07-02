import { createShiftEvent } from '../googleCalendar'

const insertMock = jest.fn()

beforeEach(() => {
  insertMock.mockReset()
  ;(window as any).gapi = {
    client: { calendar: { events: { insert: insertMock } } },
  } as any
  insertMock.mockResolvedValue({ result: { id: '1' } })
})

test('creates calendar events for each slot', async () => {
  await createShiftEvent({
    calendarId: 'cal',
    summary: 'User',
    date: '2023-05-01',
    slot1: { inizio: '08:00', fine: '10:00' },
    slot2: { inizio: '11:00', fine: '12:00' },
  })

  expect(insertMock).toHaveBeenCalledTimes(2)
  expect(insertMock).toHaveBeenCalledWith({
    calendarId: 'cal',
    resource: {
      summary: 'User',
      description: undefined,
      start: { dateTime: '2023-05-01T08:00' },
      end: { dateTime: '2023-05-01T10:00' },
    },
  })
})
