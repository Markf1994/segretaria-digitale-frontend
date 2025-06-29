export function decodeToken(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserStorageKey(prefix: string, token: string | null): string {
  if (!token) return prefix;
  const decoded = decodeToken(token);
  const id = decoded?.sub || decoded?.user_id || decoded?.id || decoded?.email;
  return id ? `${prefix}_${id}` : prefix;
}
