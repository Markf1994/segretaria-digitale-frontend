import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SchedulePage from '../SchedulePage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

beforeEach(() => {
  localStorage.clear();
});

describe('SchedulePage', () => {
  it('loads shifts from localStorage', async () => {
    localStorage.setItem(
      'shifts',
      JSON.stringify([
        { id: '1', date: '2023-01-01', start: '08:00', end: '10:00', note: '' },
      ])
    );

    render(
      <MemoryRouter initialEntries={["/orari"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/orari" element={<SchedulePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('08:00')).toBeInTheDocument();
  });

  it('adds a new shift', async () => {
    render(
      <MemoryRouter initialEntries={["/orari"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/orari" element={<SchedulePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/data/i), '2023-06-01');
    await userEvent.type(screen.getByLabelText(/inizio/i), '09:00');
    await userEvent.type(screen.getByLabelText(/fine/i), '10:00');
    await userEvent.type(screen.getByPlaceholderText(/note/i), 'test');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText('09:00')).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem('shifts') || '[]');
    expect(stored[0].start).toBe('09:00');
  });
});
