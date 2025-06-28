import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoPage from '../TodoPage';
import * as todosApi from '../../api/todos';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../../api/todos', () => ({
  __esModule: true,
  listTodos: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

const mockedApi = todosApi as jest.Mocked<typeof todosApi>;

beforeEach(() => {
  localStorage.clear();
  mockedApi.listTodos.mockResolvedValue([]);
});

describe('TodoPage offline', () => {
  it('adds new todo offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    render(
      <MemoryRouter initialEntries={["/todo"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/todo" element={<TodoPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText('Attività'), 'Task 1');
    await userEvent.type(screen.getByLabelText('Scadenza'), '2023-06-01');
    await userEvent.click(screen.getByRole('button', { name: /aggiungi/i }));

    expect(await screen.findByText('Task 1')).toBeInTheDocument();
  });

  it('edits todo offline', async () => {
    localStorage.setItem('todos', JSON.stringify([{ id: '1', text: 'Task', due: '2023-01-01' }]));
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    render(
      <MemoryRouter initialEntries={["/todo"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/todo" element={<TodoPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Task');
    await userEvent.click(screen.getByRole('button', { name: /modifica/i }));

    await userEvent.clear(screen.getByLabelText('Attività'));
    await userEvent.type(screen.getByLabelText('Attività'), 'Task edited');
    await userEvent.clear(screen.getByLabelText('Scadenza'));
    await userEvent.type(screen.getByLabelText('Scadenza'), '2023-02-02');
    await userEvent.click(screen.getByRole('button', { name: /salva/i }));

    expect(await screen.findByText('Task edited')).toBeInTheDocument();
  });

  it('deletes todo offline', async () => {
    localStorage.setItem('todos', JSON.stringify([{ id: '1', text: 'Task', due: '2023-01-01' }]));
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });

    render(
      <MemoryRouter initialEntries={["/todo"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/todo" element={<TodoPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Task');
    await userEvent.click(screen.getByRole('button', { name: /elimina/i }));

    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });
});
