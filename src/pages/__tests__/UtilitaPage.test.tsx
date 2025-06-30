import { render, screen } from '@testing-library/react';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as pdfApi from '../../api/pdfs';

jest.mock('../../api/pdfs', () => ({
  __esModule: true,
  listPDFs: jest.fn(),
}));

const mockedApi = pdfApi as jest.Mocked<typeof pdfApi>;

beforeEach(() => {
  mockedApi.listPDFs.mockResolvedValue([]);
});

describe('UtilitaPage', () => {
  it('shows PDFs from API', async () => {
    mockedApi.listPDFs.mockResolvedValue([{ id: '1', name: 'doc.pdf', url: '/doc.pdf' }]);

    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('doc.pdf')).toBeInTheDocument();
  });


});
