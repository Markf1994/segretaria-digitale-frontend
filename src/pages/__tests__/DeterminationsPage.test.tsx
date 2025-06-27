import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeterminationsPage from '../DeterminationsPage';
import ProtectedLayout from '../../components/ProtectedLayout';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  localStorage.clear();
});

describe('DeterminationsPage', () => {
  it('creates a new determination', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProtectedLayout>
          <DeterminationsPage />
        </ProtectedLayout>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText('Capitolo'), 'C1');
    await userEvent.type(screen.getByLabelText('Numero'), '001');
    await userEvent.type(screen.getByLabelText('Somma'), '10');
    await userEvent.type(screen.getByLabelText('Scadenza'), '2023-06-10');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText(/C1/)).toBeInTheDocument();
  });

  it('edits an existing determination', async () => {
    localStorage.setItem(
      'determinations',
      JSON.stringify([{ id: '1', capitolo: 'A', numero: '1', somma: 5, scadenza: '2023-01-01' }])
    );

    const { container } = render(
      <MemoryRouter>
        <ProtectedLayout>
          <DeterminationsPage />
        </ProtectedLayout>
      </MemoryRouter>
    );

    await screen.findByText(/A/);
    await userEvent.click(screen.getByRole('button', { name: /modifica/i }));
    await userEvent.clear(screen.getByLabelText('Capitolo'));
    await userEvent.type(screen.getByLabelText('Capitolo'), 'B');
    await userEvent.clear(screen.getByLabelText('Numero'));
    await userEvent.type(screen.getByLabelText('Numero'), '2');
    await userEvent.clear(screen.getByLabelText('Somma'));
    await userEvent.type(screen.getByLabelText('Somma'), '6');
    await userEvent.clear(screen.getByLabelText('Scadenza'));
    await userEvent.type(screen.getByLabelText('Scadenza'), '2023-02-02');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(await screen.findByText(/B/)).toBeInTheDocument();
  });
});
