import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoPage from '../TodoPage';
import * as todosApi from '../../api/todos';
import * as detApi from '../../api/determinations';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../../api/todos', () => ({
  __esModule: true,
  listTodos: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

jest.mock('../../api/determinations', () => ({
  __esModule: true,
  listDeterminations: jest.fn(),
}));

const mockedApi = todosApi as jest.Mocked<typeof todosApi>;
const mockedDetApi = detApi as jest.Mocked<typeof detApi>;

beforeEach(() => {
  localStorage.clear();
  mockedApi.listTodos.mockResolvedValue([]);
  mockedDetApi.listDeterminations.mockResolvedValue([] as any);
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

    await userEvent.type(screen.getByTestId('todo-text'), 'Task 1');
    await userEvent.type(screen.getByTestId('todo-due'), '2023-06-01');
    await userEvent.click(screen.getByTestId('todo-submit'));

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
    await userEvent.click(screen.getByTestId('todo-edit'));

    await userEvent.clear(screen.getByTestId('todo-text'));
    await userEvent.type(screen.getByTestId('todo-text'), 'Task edited');
    await userEvent.clear(screen.getByTestId('todo-due'));
    await userEvent.type(screen.getByTestId('todo-due'), '2023-02-02');
    await userEvent.click(screen.getByTestId('todo-submit'));

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
    await userEvent.click(screen.getByTestId('todo-delete'));

    expect(screen.queryByText('Task')).not.toBeInTheDocument();
  });

  it('shows determinations due within a month', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-01T00:00:00Z'));
    localStorage.setItem(
      'determinations',
      JSON.stringify([
        {
          id: '1',
          capitolo: 'C1',
          numero: '001',
          somma: 5,
          scadenza: '2023-05-15',
          descrizione: 'desc',
        },
        {
          id: '2',
          capitolo: 'C1',
          numero: '002',
          somma: 5,
          scadenza: '2023-08-01',
          descrizione: 'desc',
        },
      ])
    );
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

    expect(await screen.findByText('Determina 001')).toBeInTheDocument();
    expect(screen.queryByText('Determina 002')).not.toBeInTheDocument();
  });
});
