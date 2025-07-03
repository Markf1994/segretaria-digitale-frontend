import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';
import api from '../../api/axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
});

describe('LoginPage', () => {
  it('navigates to dashboard on valid credentials', async () => {
    mockedApi.post.mockResolvedValue({ data: { access_token: 'tok' } });
    mockedApi.get.mockResolvedValue({ data: { id: '1', nome: 'test', email: 'e' } });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'u@e');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /accedi/i }));

    expect(await screen.findByText('Home')).toBeInTheDocument();
  });

  it('shows an error message on invalid credentials', async () => {
    mockedApi.post.mockRejectedValue(new Error('invalid'));

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'u@e');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /accedi/i }));

    expect(await screen.findByText('Credenziali errate')).toBeInTheDocument();
  });
});
