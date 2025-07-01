import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SchedulePage from '../SchedulePage';
import api from '../../api/axios';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../../api/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  __esModule: true,
  useQuery: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedUseQuery = useQuery as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  mockedUseQuery.mockReturnValue({ data: [], isLoading: false });
});

describe('SchedulePage', () => {
  it('loads shifts from API', async () => {
    mockedUseQuery.mockReturnValue({
      data: [
        { id: '1', date: '2023-01-01', start: '08:00', end: '10:00', note: '' },
      ],
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={["/orari"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/orari" element={<SchedulePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('08:00')).toBeInTheDocument();
  });

  it('opens modal on "Nuovo turno" click', async () => {
    render(
      <MemoryRouter initialEntries={["/orari"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/orari" element={<SchedulePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /nuovo turno/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
