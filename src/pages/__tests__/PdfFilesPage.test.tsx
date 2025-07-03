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
  mockedApi.downloadPdf.mockResolvedValue(new Blob());
});

describe('PdfFilesPage', () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/pdfs"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/pdfs" element={<PdfFilesPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  it('shows titles from API', async () => {
    mockedApi.listPdfs.mockResolvedValueOnce([
      { id: '1', name: 'doc.pdf', url: '/doc.pdf' },
    ]);

    renderPage();

    expect(await screen.findByText('doc.pdf')).toBeInTheDocument();
  });

  it('downloads file on click', async () => {
    mockedApi.listPdfs.mockResolvedValueOnce([
      { id: '1', name: 'doc.pdf', url: '/doc.pdf' },
    ]);

    renderPage();

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const urlSpy = jest
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:1');

    await userEvent.click(await screen.findByRole('button', { name: /download/i }));

    expect(mockedApi.downloadPdf).toHaveBeenCalledWith('1');
    expect(openSpy).toHaveBeenCalledWith('blob:1', '_blank');

    openSpy.mockRestore();
    urlSpy.mockRestore();
  });
});
