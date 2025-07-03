import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('UtilitaPage', () => {
  it('switches meeting iframe when selecting tabs', async () => {
    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTitle('Google Meet')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('tab-teams'));
    expect(screen.getByTitle('Microsoft Teams')).toBeInTheDocument();
  });
});
