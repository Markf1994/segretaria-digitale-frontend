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

    await userEvent.type(screen.getByTestId('det-capitolo'), 'C1');
    await userEvent.type(screen.getByTestId('det-numero'), '001');
    await userEvent.type(screen.getByTestId('det-somma'), '10');
    await userEvent.type(screen.getByTestId('det-descrizione'), 'desc');
    await userEvent.type(screen.getByTestId('det-scadenza'), '2023-06-10');
    await userEvent.click(screen.getByTestId('det-submit'));

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
    await userEvent.click(screen.getByTestId('det-edit'));
    await userEvent.clear(screen.getByTestId('det-capitolo'));
    await userEvent.type(screen.getByTestId('det-capitolo'), 'B');
    await userEvent.clear(screen.getByTestId('det-numero'));
    await userEvent.type(screen.getByTestId('det-numero'), '2');
    await userEvent.clear(screen.getByTestId('det-somma'));
    await userEvent.type(screen.getByTestId('det-somma'), '6');
    await userEvent.clear(screen.getByTestId('det-descrizione'));
    await userEvent.type(screen.getByTestId('det-descrizione'), 'new');
    await userEvent.clear(screen.getByTestId('det-scadenza'));
    await userEvent.type(screen.getByTestId('det-scadenza'), '2023-02-02');
    await userEvent.click(screen.getByTestId('det-submit'));

    expect(await screen.findByText(/B/)).toBeInTheDocument();
  });
});
