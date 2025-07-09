import { render, screen, within } from '@testing-library/react';
import DashboardCalendar from '../DashboardCalendar';
import { useAuthStore } from '../../store/auth';
import * as gcApi from '../../api/googleCalendar';
import * as userApi from '../../api/users';

jest.mock('../../api/googleCalendar', () => ({
  __esModule: true,
  signIn: jest.fn(),
  listEvents: jest.fn(),
}));

jest.mock('../../api/users', () => ({
  __esModule: true,
  listUsers: jest.fn(),
}));

const mockedGcApi = gcApi as jest.Mocked<typeof gcApi>;
const mockedUserApi = userApi as jest.Mocked<typeof userApi>;

beforeEach(() => {
  localStorage.clear();
  useAuthStore.getState().setUser(null);
  jest.resetAllMocks();
  mockedGcApi.signIn.mockResolvedValue();
  mockedUserApi.listUsers.mockResolvedValue({ data: [] } as any);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DashboardCalendar', () => {
  it('renders seven days', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-03T00:00:00Z'));
    mockedGcApi.listEvents.mockResolvedValueOnce([] as any);

    render(<DashboardCalendar />);

    const headings = await screen.findAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(7);
  });

  it('places events under the correct day', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-03T00:00:00Z'));
    mockedGcApi.listEvents.mockResolvedValueOnce([
      { id: '1', summary: 'A', start: { date: '2023-05-01' } } as any,
      { id: '2', summary: 'B', start: { date: '2023-05-03' } } as any,
      { id: '3', summary: 'C', start: { date: '2023-05-05' } } as any,
    ]);

    render(<DashboardCalendar />);

    const monday = await screen.findByTestId('day-2023-05-01');
    const wednesday = screen.getByTestId('day-2023-05-03');
    const friday = screen.getByTestId('day-2023-05-05');

    expect(within(monday).getByText('A')).toBeInTheDocument();
    expect(within(wednesday).getByText('B')).toBeInTheDocument();
    expect(within(friday).getByText('C')).toBeInTheDocument();
  });
});
