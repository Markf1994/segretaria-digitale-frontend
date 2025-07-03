import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PdfFilesPage from '../PdfFilesPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as pdfApi from '../../api/pdfs';

jest.mock('../../api/pdfs', () => ({
  __esModule: true,
  listPdfs: jest.fn(),
  downloadPdf: jest.fn(),
}));

const mockedApi = pdfApi as jest.Mocked<typeof pdfApi>;

beforeEach(() => {
  mockedApi.listPdfs.mockResolvedValue([]);
});

describe('PdfFilesPage', () => {
  it('lists PDFs and downloads file', async () => {
    mockedApi.listPdfs.mockResolvedValue([{ id: '1', name: 'file.pdf', url: '/file.pdf' }]);

    render(
      <MemoryRouter initialEntries={["/pdfs"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/pdfs" element={<PdfFilesPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('file.pdf')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(mockedApi.downloadPdf).toHaveBeenCalledWith('1');
  });
});
