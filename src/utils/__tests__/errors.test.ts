import { getErrorDetail } from '../errors';

describe('getErrorDetail', () => {
  it('returns detail from JSON blob', async () => {
    const blob = new Blob([JSON.stringify({ detail: 'fail' })], { type: 'application/json' });
    const err: any = { response: { data: blob } };
    await expect(getErrorDetail(err)).resolves.toBe('fail');
  });

  it('falls back to blob text', async () => {
    const blob = new Blob(['plain error'], { type: 'text/plain' });
    const err: any = { response: { data: blob } };
    await expect(getErrorDetail(err)).resolves.toBe('plain error');
  });

  it('returns detail field when present', async () => {
    const err: any = { response: { data: { detail: 'bad' } } };
    await expect(getErrorDetail(err)).resolves.toBe('bad');
  });

  it('falls back to message', async () => {
    const err: any = { message: 'oops' };
    await expect(getErrorDetail(err)).resolves.toBe('oops');
  });
});
