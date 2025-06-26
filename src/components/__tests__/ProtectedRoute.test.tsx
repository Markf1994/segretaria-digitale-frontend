import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '../../store/auth';

jest.mock('../../store/auth');

const mockedUseAuthStore = useAuthStore as jest.Mock;

describe('ProtectedRoute', () => {
  it('renders children when token exists', () => {
    mockedUseAuthStore.mockImplementation((sel: any) => sel({ token: 'abc' }));

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Private</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('redirects to login when token is missing', () => {
    mockedUseAuthStore.mockImplementation((sel: any) => sel({ token: null }));

    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Private</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
