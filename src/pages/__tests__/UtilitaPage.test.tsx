import { render, screen } from '@testing-library/react';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('UtilitaPage', () => {
  it('renders meeting service logos', () => {
    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByAltText(/microsoft teams/i)).toBeInTheDocument();
    expect(screen.getByAltText(/zoom/i)).toBeInTheDocument();
    expect(screen.getByAltText(/google meet/i)).toBeInTheDocument();
  });
});
