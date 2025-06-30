import api from './axios'

export interface PdfFile {
  id: string
  titolo: string
  url: string
}

export const listPdfs = (): Promise<PdfFile[]> =>
  api.get<PdfFile[]>('/utilita').then(r => r.data)

export const uploadPdf = (
  file: File,
  titolo: string
): Promise<PdfFile> => {
  const data = new FormData()
  data.append('file', file)
  data.append('titolo', titolo)
  return api
    .post<PdfFile>('/utilita', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => r.data)
}
