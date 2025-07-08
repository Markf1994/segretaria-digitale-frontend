import { withOffline, withoutResult } from '../offline';

const originalNavigator = global.navigator;

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(global, 'navigator', {
    value: { ...(originalNavigator as any), onLine: value },
    configurable: true
  });
}

afterAll(() => {
  Object.defineProperty(global, 'navigator', { value: originalNavigator });
});

describe('withOffline', () => {
  afterEach(() => {
    // restore navigator to default
    setNavigatorOnline(true);
  });

  it('returns the result of the online callback when navigator.onLine is true', async () => {
    setNavigatorOnline(true);
    const online = jest.fn(async () => 'online');
    const offline = jest.fn(async () => 'offline');
    const result = await withOffline(online, offline);
    expect(result).toBe('online');
    expect(online).toHaveBeenCalled();
    expect(offline).not.toHaveBeenCalled();
  });

  it('falls back to the offline callback when the online callback rejects', async () => {
    setNavigatorOnline(true);
    const online = jest.fn(async () => {
      throw new Error('fail');
    });
    const offline = jest.fn(async () => 'offline');
    const result = await withOffline(online, offline);
    expect(result).toBe('offline');
    expect(online).toHaveBeenCalled();
    expect(offline).toHaveBeenCalled();
  });
});

describe('withoutResult', () => {
  afterEach(() => {
    setNavigatorOnline(true);
  });

  it('calls the online callback when online but suppresses errors', async () => {
    setNavigatorOnline(true);
    const online = jest.fn(async () => {
      throw new Error('boom');
    });
    await expect(withoutResult(online)).resolves.toBeUndefined();
    expect(online).toHaveBeenCalled();
  });
});
