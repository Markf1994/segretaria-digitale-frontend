export async function getErrorDetail(err: any): Promise<string> {
  if (err.response?.data instanceof Blob) {
    const text = await err.response.data.text();
    try {
      const json = JSON.parse(text);
      return json.detail ?? text;
    } catch {
      return text;
    }
  }
  return err.response?.data?.detail ?? err.message;
}
