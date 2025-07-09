import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as gcApi from '../../api/googleCalendar';
import * as userApi from '../../api/users';
import { useAuthStore } from '../../store/auth';

jest.mock('../../api/googleCalendar', () => ({
  __esModule: true,
  signIn: jest.fn(),
  listEvents: jest.fn(),
}));

jest.mock('../../api/users', () => ({
  __esModule: true,
  listUsers: jest.fn(),
}));

const mockedGcApi = gcApi as jest.Mocked<typeof gcApi>;
const mockedUserApi = userApi as jest.Mocked<typeof userApi>;

beforeEach(() => {
  localStorage.clear();
  useAuthStore.getState().setUser(null);
  jest.resetAllMocks();
  mockedGcApi.signIn.mockResolvedValue();
  mockedGcApi.listEvents.mockResolvedValue([] as any);
  mockedUserApi.listUsers.mockResolvedValue({ data: [] } as any);
});

describe('Dashboard', () => {
  it('deletes todo from dashboard', async () => {
    localStorage.setItem(
      'todos',
      JSON.stringify([{ id: '1', text: 'Task', due: '2023-01-01' }])
    );
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>            
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Task');
    await userEvent.click(screen.getByTestId('dashboard-delete'));

    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });

  it('shows only user and generic calendar events', async () => {
    useAuthStore.getState().setUser({ id: '1', nome: 'Me', email: 'me@e' });
    mockedUserApi.listUsers.mockResolvedValueOnce({
      data: [
        { id: '1', email: 'me@e' },
        { id: '2', email: 'other@e' },
      ],
    } as any);
    mockedGcApi.listEvents.mockResolvedValueOnce([
      { id: '1', summary: 'me@e', start: { date: '2023-01-01' } } as any,
      { id: '2', summary: 'other@e', start: { date: '2023-01-02' } } as any,
      { id: '3', summary: 'Meeting', start: { date: '2023-01-03' } } as any,
    ]);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('me@e')).toBeInTheDocument();
    expect(await screen.findByText('Meeting')).toBeInTheDocument();
    expect(screen.queryByText('other@e')).not.toBeInTheDocument();
  });
});

