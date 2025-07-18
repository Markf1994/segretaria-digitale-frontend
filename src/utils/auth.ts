export interface JwtPayload {
  sub?: string;
  user_id?: string;
  id?: string;
  email?: string;
  [key: string]: unknown;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    let payload = token.split('.')[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) payload += '=';
    const json = atob(payload);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserId(token: string | null): string | null {
  if (!token) return null;
  const decoded = decodeToken(token);
  const id = decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? decoded?.email;
  return id == null ? null : String(id);
}

export function getUserStorageKey(prefix: string, token: string | null): string {
  if (!token) return prefix;
  const decoded = decodeToken(token);
  const id = decoded?.sub ?? decoded?.user_id ?? decoded?.id ?? decoded?.email;
  return id != null ? `${prefix}_${String(id)}` : prefix;
}
