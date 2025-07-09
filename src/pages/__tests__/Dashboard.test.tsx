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

});

