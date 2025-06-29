import { getUserStorageKey } from '../auth';

describe('getUserStorageKey', () => {
  it('returns prefix when token missing', () => {
    expect(getUserStorageKey('todos', null)).toBe('todos');
  });

  it('adds user id from token', () => {
    const header = Buffer.from('{}').toString('base64');
    const payload = Buffer.from(JSON.stringify({ sub: '123' })).toString('base64');
    const token = `${header}.${payload}.sig`;
    expect(getUserStorageKey('todos', token)).toBe('todos_123');
  });
});
