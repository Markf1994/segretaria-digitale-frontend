export async function withOffline<T>(online: () => Promise<T>, offline: () => T | Promise<T>): Promise<T> {
  if (navigator.onLine) {
    try {
      return await online();
    } catch {
      // ignore and fall back
    }
  }
  return await offline();
}

export async function withoutResult(online: () => Promise<void>): Promise<void> {
  if (navigator.onLine) {
    try {
      await online();
    } catch {
      // ignore when offline
    }
  }
}
