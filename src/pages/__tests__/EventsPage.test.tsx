import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventsPage from '../EventsPage';
import api from '../../api/axios';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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
      'events',
      JSON.stringify([
        {
          id: '1',
          title: 'Test',
          description: 'desc',
          dateTime: '2023-01-01T10:00',
          isPublic: false,
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
