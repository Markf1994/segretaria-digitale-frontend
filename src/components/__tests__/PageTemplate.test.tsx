import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import PageTemplate from '../PageTemplate';
import api from '../../api/axios';
import { useAuthStore } from '../../store/auth';

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const Dummy: React.FC = () => <div>Dummy Page</div>;

describe('PageTemplate', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().setToken(null);
    useAuthStore.getState().setUser(null);
    jest.resetAllMocks();
  });

  it('shows navigation, sidebar buttons and footer', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dummy />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // navigation links
    expect(screen.getByText('🏠 Dashboard')).toBeInTheDocument();
    expect(screen.getByText('📅 Eventi')).toBeInTheDocument();
    expect(screen.getByText('📝 To-Do')).toBeInTheDocument();
    expect(screen.getByText('🕑 Orari')).toBeInTheDocument();
    expect(screen.getByText('📄 Determine')).toBeInTheDocument();
    expect(
      screen.getByText(/🕑\s*Orari/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /esci/i })).toBeInTheDocument();

    // footer
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© M.Fenaroli ${currentYear}`, 'i'))
    ).toBeInTheDocument();
  });

  it('displays greeting when user profile is fetched', async () => {
    useAuthStore.getState().setToken('tok');
    mockedApi.get.mockResolvedValueOnce({ data: { id: '1', nome: 'test', email: 'e' } });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dummy />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');

    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
    expect(await screen.findByText(new RegExp(`${salutation}  test`, 'i'))).toBeInTheDocument();
  });

  it('shows placeholder greeting when fetching profile fails', async () => {
    useAuthStore.getState().setToken('tok');
    mockedApi.get.mockRejectedValueOnce(new Error('fail'));

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dummy />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(mockedApi.get).toHaveBeenCalledWith('/users/me');

    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
    expect(await screen.findByText(new RegExp(`^${salutation}$`, 'i'))).toBeInTheDocument();
  });
});
