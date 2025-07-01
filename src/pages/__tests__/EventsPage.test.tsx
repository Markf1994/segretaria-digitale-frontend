import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventsPage from '../EventsPage';
import api from '../../api/axios';
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

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  localStorage.clear();
  mockedApi.get.mockResolvedValue({ data: [] });
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
        { id: '1', title: 'Mine', description: '', dateTime: '2023-01-01T10:00', isPublic: false, owner_id: '123' },
        { id: '2', title: 'Other', description: '', dateTime: '2023-01-02T10:00', isPublic: false, owner_id: '456' },
        { id: '3', title: 'Public', description: '', dateTime: '2023-01-03T10:00', isPublic: true, owner_id: '456' },
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
});
