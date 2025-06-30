import { render, screen } from '@testing-library/react';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as pdfApi from '../../api/pdfs';
import * as driveApi from '../../api/googleDrive';

jest.mock('../../api/pdfs', () => ({
  __esModule: true,
  listPDFs: jest.fn(),
}));

jest.mock('../../api/googleDrive', () => ({
  __esModule: true,
  signIn: jest.fn(),
  listDriveFiles: jest.fn(),
}));

const mockedApi = pdfApi as jest.Mocked<typeof pdfApi>;
const mockedDriveApi = driveApi as jest.Mocked<typeof driveApi>;

beforeEach(() => {
  mockedApi.listPDFs.mockResolvedValue([]);
  mockedDriveApi.signIn.mockResolvedValue();
  mockedDriveApi.listDriveFiles.mockResolvedValue([]);
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

  it('shows files from Drive', async () => {
    mockedDriveApi.listDriveFiles.mockResolvedValue([{ id: 'd1', name: 'drive.pdf' } as any]);

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
