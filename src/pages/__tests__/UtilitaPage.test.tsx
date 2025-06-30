import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as pdfApi from '../../api/pdfs';
import * as driveApi from '../../api/googleDrive';

jest.mock('../../api/pdfs', () => ({
  __esModule: true,
  listPDFs: jest.fn(),
  uploadPDF: jest.fn(),
}));

jest.mock('../../api/googleDrive', () => ({
  __esModule: true,
  listFiles: jest.fn(),
  signIn: jest.fn(),
}));

const mockedApi = pdfApi as jest.Mocked<typeof pdfApi>;
const mockedDriveApi = driveApi as jest.Mocked<typeof driveApi>;

beforeEach(() => {
  mockedApi.listPDFs.mockResolvedValue([]);
  mockedApi.uploadPDF.mockImplementation(async file => ({
    id: '1',
    name: file.name,
    url: '/'+file.name,
  }));
  mockedDriveApi.listFiles.mockResolvedValue([]);
  mockedDriveApi.signIn.mockResolvedValue();
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

  it('shows Google Drive files', async () => {
    mockedDriveApi.listFiles.mockResolvedValue([
      { id: 'g1', name: 'drive.pdf', url: '/view' }
    ]);

    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('drive.pdf')).toBeInTheDocument();
  });
});
