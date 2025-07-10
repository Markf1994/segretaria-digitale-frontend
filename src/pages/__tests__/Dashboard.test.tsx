import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';


beforeEach(() => {
  localStorage.clear();
  useAuthStore.getState().setUser(null);
  jest.resetAllMocks();
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

  it('renders calendar iframe', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTitle('Calendario')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aggiorna calendario/i })).toBeInTheDocument();
  });

  it('shows Google events for the current week only', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-03T10:00:00Z'));
    localStorage.setItem(
      'events',
      JSON.stringify([
        { id: '1', title: 'DB', description: '', dateTime: '2023-05-04T10:00:00Z', isPublic: true, source: 'db' },
        { id: '2', title: 'GC week', description: '', dateTime: '2023-05-05T10:00:00Z', isPublic: true, source: 'gc' },
        { id: '3', title: 'GC next', description: '', dateTime: '2023-05-12T10:00:00Z', isPublic: true, source: 'gc' },
      ])
    );

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/GC week/)).toBeInTheDocument();
    expect(screen.queryByText(/DB/)).not.toBeInTheDocument();
    expect(screen.queryByText(/GC next/)).not.toBeInTheDocument();
  });

});

