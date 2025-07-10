import { render, screen } from '@testing-library/react';
import UtilitaPage from '../UtilitaPage';
import PageTemplate from '../../components/PageTemplate';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { getUserStorageKey } from '../../utils/auth';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

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

    expect(screen.getByAltText(/google meet/i)).toBeInTheDocument();
    expect(screen.getByAltText(/zoom/i)).toBeInTheDocument();
    expect(screen.getByAltText(/microsoft teams/i)).toBeInTheDocument();
  });

  it('shows upcoming meeting events', () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-01T00:00:00Z'));
    localStorage.setItem(
      getUserStorageKey('events', null),
      JSON.stringify([
        {
          id: '1',
          title: 'Riunione staff',
          description: '',
          dateTime: '2023-05-02T10:00',
          endDateTime: '2023-05-02T11:00',
          isPublic: true,
        },
        {
          id: '2',
          title: 'Test evento',
          description: '',
          dateTime: '2023-05-02T12:00',
          endDateTime: '2023-05-02T13:00',
          isPublic: true,
        },
        {
          id: '3',
          title: 'Call annuale',
          description: '',
          dateTime: '2023-05-05T10:00',
          endDateTime: '2023-05-05T11:00',
          isPublic: true,
        },
      ]),
    );

    render(
      <MemoryRouter initialEntries={["/utilita"]}>
        <Routes>
          <Route element={<PageTemplate />}>
            <Route path="/utilita" element={<UtilitaPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Riunione staff/i)).toBeInTheDocument();
    expect(screen.queryByText('Test evento')).not.toBeInTheDocument();
    expect(screen.queryByText(/Call annuale/i)).not.toBeInTheDocument();
  });
});
