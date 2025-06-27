import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoPage from '../TodoPage';
import api from '../../api/axios';

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

describe('TodoPage offline', () => {
  it('adds new todo offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    const { container } = render(<TodoPage />);

    await userEvent.type(screen.getByPlaceholderText('Attività'), 'Task 1');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.type(dateInput, '2023-06-01');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
  });

  it('edits todo offline', async () => {
    localStorage.setItem('todos', JSON.stringify([{ id: '1', text: 'Task', due: '2023-01-01' }]));
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    const { container } = render(<TodoPage />);

    await screen.findByText('Task');
    await userEvent.click(screen.getByRole('button', { name: /modifica/i }));

    await userEvent.clear(screen.getByPlaceholderText('Attività'));
    await userEvent.type(screen.getByPlaceholderText('Attività'), 'Task edited');
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, '2023-02-02');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(await screen.findByText('Task edited')).toBeInTheDocument();
  });

  it('deletes todo offline', async () => {
    localStorage.setItem('todos', JSON.stringify([{ id: '1', text: 'Task', due: '2023-01-01' }]));
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    render(<TodoPage />);

    await screen.findByText('Task');
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));

    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });
});
