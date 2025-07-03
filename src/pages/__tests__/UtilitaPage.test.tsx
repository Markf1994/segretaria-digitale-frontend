import { render, screen } from '@testing-library/react';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('UtilitaPage', () => {
  it('renders meeting service links', () => {
    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /google meet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /microsoft teams/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom/i })).toBeInTheDocument();
  });
});
