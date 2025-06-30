import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as pdfApi from '../../api/pdfs';

jest.mock('../../api/pdfs', () => ({
  __esModule: true,
  listPDFs: jest.fn(),
  uploadPDF: jest.fn(),
}));

const mockedApi = pdfApi as jest.Mocked<typeof pdfApi>;

beforeEach(() => {
  mockedApi.listPDFs.mockResolvedValue([]);
  mockedApi.uploadPDF.mockImplementation(async file => ({
    id: '1',
    name: file.name,
    url: '/'+file.name,
  }));
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

  it('uploads new PDF', async () => {
    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const file = new File(['a'], 'new.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByTestId('pdf-input'), file);

    expect(mockedApi.uploadPDF).toHaveBeenCalledWith(file);
    expect(await screen.findByText('new.pdf')).toBeInTheDocument();
  });
});
