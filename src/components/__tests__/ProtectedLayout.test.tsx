import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import ProtectedLayout from '../ProtectedLayout';

const Dummy: React.FC = () => <div>Dummy Page</div>;

describe('ProtectedLayout', () => {
  it('shows navigation, sidebar buttons and footer', () => {
    render(
      <MemoryRouter>
        <ProtectedLayout>
          <Dummy />
        </ProtectedLayout>
      </MemoryRouter>
    );

    // navigation links
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();
    expect(screen.getByText('📅 Eventi')).toBeInTheDocument();
    expect(screen.getByText('📝 To-Do')).toBeInTheDocument();
    expect(screen.getByText('📄 Determine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /esci/i })).toBeInTheDocument();

    // footer
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© M.Fenaroli ${currentYear}`, 'i'))
    ).toBeInTheDocument();
  });
});
