import { decodeToken, getUserId, getUserStorageKey } from '../auth';

describe('decodeToken', () => {
  it('parses a jwt payload', () => {
    const header = Buffer.from('{}').toString('base64');
    const payload = Buffer.from(JSON.stringify({ sub: 'abc' })).toString('base64');
    const token = `${header}.${payload}.sig`;
    const decoded = decodeToken(token);
    expect(decoded).toEqual({ sub: 'abc' });
  });

  it('returns null for malformed token', () => {
    expect(decodeToken('bad')).toBeNull();
  });
});

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

  it('handles base64url tokens', () => {
    const base64Url = (b: Buffer) =>
      b
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    const header = base64Url(Buffer.from('{}'));
    const payload = base64Url(Buffer.from(JSON.stringify({ sub: 'xyz' })));
    const token = `${header}.${payload}.sig`;
    expect(getUserStorageKey('todos', token)).toBe('todos_xyz');
  });
});

describe('getUserId', () => {
  it('returns null when token missing', () => {
    expect(getUserId(null)).toBeNull();
  });

  it('extracts id from token', () => {
    const header = Buffer.from('{}').toString('base64');
    const payload = Buffer.from(JSON.stringify({ email: 'me@example.com' })).toString('base64');
    const token = `${header}.${payload}.sig`;
    expect(getUserId(token)).toBe('me@example.com');
  });

  it('returns string when id is numeric', () => {
    const header = Buffer.from('{}').toString('base64');
    const payload = Buffer.from(JSON.stringify({ sub: 42 })).toString('base64');
    const token = `${header}.${payload}.sig`;
    expect(getUserId(token)).toBe('42');
  });
});
