import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeterminationsPage from '../DeterminationsPage';

beforeEach(() => {
  localStorage.clear();
});

describe('DeterminationsPage', () => {
  it('loads determinations from localStorage', async () => {
    localStorage.setItem(
      'determinations-v2',
      JSON.stringify([
        {
          id: '1',
          capitolo: 'A',
          numero: '1',
          somma: 10,
          scadenza: '2023-01-01T00:00',
        },
      ])
    );

    render(<DeterminationsPage />);

    expect(await screen.findByText(/A\/1/)).toBeInTheDocument();
  });

  it('adds new determination offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      value: false,
      configurable: true,
    });

    const { container } = render(<DeterminationsPage />);

    await userEvent.type(screen.getByPlaceholderText('Capitolo'), 'B');
    await userEvent.type(screen.getByPlaceholderText('Numero'), '2');
    await userEvent.type(screen.getByPlaceholderText('Somma'), '20');
    const dateInput = container.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await userEvent.type(dateInput, '2023-05-01T12:00');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText(/B\/2/)).toBeInTheDocument();
  });
});
