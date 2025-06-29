import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeterminationsPage from '../DeterminationsPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

beforeEach(() => {
  localStorage.clear();
});

describe('DeterminationsPage', () => {
  it('creates a new determination', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/determinazioni"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/determinazioni" element={<DeterminationsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Capitolo'), 'C1');
    await userEvent.type(screen.getByPlaceholderText('Numero'), '001');
    await userEvent.type(screen.getByPlaceholderText('Somma'), '10');
    await userEvent.type(screen.getByPlaceholderText('Descrizione'), 'desc');
    await userEvent.type(screen.getByLabelText('Scadenza'), '2023-06-10');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText(/C1/)).toBeInTheDocument();
  });

  it('edits an existing determination', async () => {
    localStorage.setItem(
      'determinations',
      JSON.stringify([{ id: '1', capitolo: 'A', numero: '1', somma: 5, scadenza: '2023-01-01', descrizione: 'old' }])
    );

    const { container } = render(
      <MemoryRouter initialEntries={["/determinazioni"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/determinazioni" element={<DeterminationsPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/A/);
    await userEvent.click(screen.getByRole('button', { name: /modifica/i }));
    await userEvent.clear(screen.getByPlaceholderText('Capitolo'));
    await userEvent.type(screen.getByPlaceholderText('Capitolo'), 'B');
    await userEvent.clear(screen.getByPlaceholderText('Numero'));
    await userEvent.type(screen.getByPlaceholderText('Numero'), '2');
    await userEvent.clear(screen.getByPlaceholderText('Somma'));
    await userEvent.type(screen.getByPlaceholderText('Somma'), '6');
    await userEvent.clear(screen.getByPlaceholderText('Descrizione'));
    await userEvent.type(screen.getByPlaceholderText('Descrizione'), 'new');
    await userEvent.clear(screen.getByLabelText('Scadenza'));
    await userEvent.type(screen.getByLabelText('Scadenza'), '2023-02-02');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(await screen.findByText(/B/)).toBeInTheDocument();
  });
});
