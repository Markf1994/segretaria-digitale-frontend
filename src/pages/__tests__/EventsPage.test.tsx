import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventsPage from '../EventsPage';
import api from '../../api/axios';
import * as gcApi from '../../api/googleCalendar';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { getUserStorageKey } from '../../utils/auth';

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../api/googleCalendar', () => ({
  __esModule: true,
  signIn: jest.fn(),
  listEvents: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGcApi = gcApi as jest.Mocked<typeof gcApi>;

beforeEach(() => {
  localStorage.clear();
  mockedApi.get.mockResolvedValue({ data: [] });
  mockedGcApi.signIn.mockResolvedValue();
  mockedGcApi.listEvents.mockResolvedValue([] as any);
  mockedGcApi.createEvent.mockResolvedValue({} as any);
  mockedGcApi.updateEvent.mockResolvedValue({} as any);
  mockedGcApi.deleteEvent.mockResolvedValue();
});

describe('EventsPage', () => {
  it('loads events from localStorage', async () => {
    localStorage.setItem(
      getUserStorageKey('events', null),
      JSON.stringify([
        {
          id: '1',
          title: 'Test',
          description: 'desc',
          dateTime: '2023-01-01T10:00',
          isPublic: true,
          source: 'db',
        },
      ])
    );

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Test')).toBeInTheDocument();
  });

  it('filters events by owner and visibility from localStorage', async () => {
    const header = Buffer.from('{}').toString('base64');
    const payload = Buffer.from(JSON.stringify({ sub: '123' })).toString('base64');
    const token = `${header}.${payload}.sig`;
    localStorage.setItem('token', token);
    localStorage.setItem(
      getUserStorageKey('events', token),
      JSON.stringify([
        { id: '1', title: 'Mine', description: '', dateTime: '2023-01-01T10:00', isPublic: false, owner_id: '123', source: 'db' },
        { id: '2', title: 'Other', description: '', dateTime: '2023-01-02T10:00', isPublic: false, owner_id: '456', source: 'db' },
        { id: '3', title: 'Public', description: '', dateTime: '2023-01-03T10:00', isPublic: true, owner_id: '456', source: 'db' },
      ])
    );

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Mine')).toBeInTheDocument();
    expect(await screen.findByText('Public')).toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  it('handles numeric owner_id values', async () => {
    const header = Buffer.from('{}').toString('base64');
    const payload = Buffer.from(JSON.stringify({ sub: 123 })).toString('base64');
    const token = `${header}.${payload}.sig`;
    localStorage.setItem('token', token);
    localStorage.setItem(
      getUserStorageKey('events', token),
      JSON.stringify([
        { id: '1', title: 'Mine', description: '', dateTime: '2023-01-01T10:00', isPublic: false, owner_id: 123, source: 'db' },
        { id: '2', title: 'Other', description: '', dateTime: '2023-01-02T10:00', isPublic: false, owner_id: 999, source: 'db' },
      ])
    );

    render(
      <MemoryRouter initialEntries={['/events']}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Mine')).toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  it('adds new event offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByTestId('title-input'), 'My Event');
    await userEvent.type(screen.getByTestId('description-input'), 'Desc');
    await userEvent.type(screen.getByTestId('date-input'), '2023-05-01T12:00');
    await userEvent.click(screen.getByLabelText(/pubblico/i));
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText('My Event')).toBeInTheDocument();
  });

  it('passes visibility when creating a calendar event', async () => {
    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByTestId('title-input'), 'My Event');
    await userEvent.type(screen.getByTestId('description-input'), 'Desc');
    await userEvent.type(screen.getByTestId('date-input'), '2023-05-01T12:00');
    await userEvent.click(screen.getByLabelText(/pubblico/i));
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(mockedGcApi.createEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ visibility: 'public' })
    );
  });

  it('shows error when calendar sign-in fails', async () => {
    mockedGcApi.signIn.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}> 
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument();
  });

  it('shows error when creating calendar event fails', async () => {
    mockedGcApi.createEvent.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}> 
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByTestId('title-input'), 'My Event');
    await userEvent.type(screen.getByTestId('description-input'), 'Desc');
    await userEvent.type(screen.getByTestId('date-input'), '2023-05-01T12:00');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument();
  });

  it('shows error when updating calendar event fails', async () => {
    mockedGcApi.listEvents.mockResolvedValueOnce([
      { id: '1', summary: 'Ev', start: { dateTime: '2023-01-01T10:00' }, end: { dateTime: '2023-01-01T11:00' } } as any,
    ]);
    mockedGcApi.updateEvent.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}> 
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Ev');
    await userEvent.click(screen.getByText('Modifica'));
    await userEvent.type(screen.getByTestId('title-input'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument();
  });

  it('passes visibility when updating a calendar event', async () => {
    mockedGcApi.listEvents.mockResolvedValueOnce([
      { id: '1', summary: 'Ev', start: { dateTime: '2023-01-01T10:00' }, end: { dateTime: '2023-01-01T11:00' } } as any,
    ]);

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Ev');
    await userEvent.click(screen.getByText('Modifica'));
    await userEvent.type(screen.getByTestId('title-input'), 'x');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(mockedGcApi.updateEvent).toHaveBeenCalledWith(
      expect.any(String),
      '1',
      expect.objectContaining({ visibility: 'private' })
    );
  });

  it('shows error when deleting calendar event fails', async () => {
    mockedGcApi.listEvents.mockResolvedValueOnce([
      { id: '1', summary: 'Ev', start: { dateTime: '2023-01-01T10:00' }, end: { dateTime: '2023-01-01T11:00' } } as any,
    ]);
    mockedGcApi.deleteEvent.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <Routes>
          <Route element={<PageTemplate />}> 
            <Route path="/events" element={<EventsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Ev');
    await userEvent.click(screen.getByText('Elimina'));

    expect(await screen.findByText('Errore di accesso al calendario')).toBeInTheDocument();
  });
});
