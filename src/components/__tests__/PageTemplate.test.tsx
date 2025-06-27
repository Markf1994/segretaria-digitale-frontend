import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import PageTemplate from '../PageTemplate';

const Dummy: React.FC = () => <div>Dummy Page</div>;

describe('PageTemplate', () => {
  it('shows navigation, sidebar buttons and footer', () => {
    render(
      <MemoryRouter>
        <PageTemplate>
          <Dummy />
        </PageTemplate>
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
