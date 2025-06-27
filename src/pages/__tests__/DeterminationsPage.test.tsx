import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeterminationsPage from '../DeterminationsPage';

beforeEach(() => {
  localStorage.clear();
});

describe('DeterminationsPage', () => {
  it('creates a new determination', async () => {
    const { container } = render(<DeterminationsPage />);

    await userEvent.type(screen.getByPlaceholderText('Titolo'), 'Det 1');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, '2023-06-10');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText('Det 1')).toBeInTheDocument();
  });

  it('edits an existing determination', async () => {
    localStorage.setItem(
      'determinations',
      JSON.stringify([{ id: '1', title: 'Det', due: '2023-01-01' }])
    );

    const { container } = render(<DeterminationsPage />);

    await screen.findByText('Det');
    await userEvent.click(screen.getByRole('button', { name: /modifica/i }));
    await userEvent.clear(screen.getByPlaceholderText('Titolo'));
    await userEvent.type(screen.getByPlaceholderText('Titolo'), 'Updated');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2023-02-02');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(await screen.findByText('Updated')).toBeInTheDocument();
  });
});
