import api from './axios'
import type { PDFFile } from './types'

export const listPDFs = (): Promise<PDFFile[]> =>
  api.get<PDFFile[]>('/pdfs').then(r => r.data)

export const getSchedulePdf = (week: string): Promise<Blob> =>
  api
    .get('/orari/pdf', { params: { week }, responseType: 'blob' })
    .then(r => r.data)

