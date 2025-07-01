export function decodeToken(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserId(token: string | null): string | null {
  if (!token) return null;
  const decoded = decodeToken(token);
  const id = decoded?.sub || decoded?.user_id || decoded?.id || decoded?.email;
  return id || null;
}

export function getUserStorageKey(prefix: string, token: string | null): string {
  if (!token) return prefix;
  const decoded = decodeToken(token);
  const id = decoded?.sub || decoded?.user_id || decoded?.id || decoded?.email;
  return id ? `${prefix}_${id}` : prefix;
}
