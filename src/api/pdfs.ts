import api from './axios'
import type { PDFFile } from './types'

export const listPDFs = (): Promise<PDFFile[]> =>
  api.get<PDFFile[]>('/pdfs').then(r => r.data)

export const uploadPDF = (file: File): Promise<PDFFile> => {
  const data = new FormData()
  data.append('file', file)
  return api.post<PDFFile>('/pdfs', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}
