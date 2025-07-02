import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import React from 'react';
import PageTemplate from '../PageTemplate';

const Dummy: React.FC = () => <div>Dummy Page</div>;

describe('PageTemplate', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('displays greeting when user token exists', () => {
    const payload = btoa(JSON.stringify({ nome: 'test' }));
    localStorage.setItem('token', `xx.${payload}.yy`);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/" element={<Dummy />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
    expect(screen.getByText(new RegExp(`${salutation} test`, 'i'))).toBeInTheDocument();
  });
});
