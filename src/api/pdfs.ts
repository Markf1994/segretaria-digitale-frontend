import api from './axios'
import type { PDFFile } from './types'

export const listPdfs = (): Promise<PDFFile[]> =>
  api.get<PDFFile[]>('/pdfs').then(r => r.data)

export const uploadPdf = (data: FormData): Promise<PDFFile> =>
  api.post<PDFFile>('/pdfs', data).then(r => r.data)

export const downloadPdf = (id: string): void => {
  const base = api.defaults.baseURL || ''
  const url = `${base}/pdfs/${id}`
  window.open(url, '_blank')
}

export interface SchedulePdfResult {
  blob: Blob
  warning?: string
}

export const getSchedulePdf = async (
  week: string,
): Promise<SchedulePdfResult> => {
  const res = await api.get('/orari/pdf', {
    params: { week },
    responseType: 'blob',
  })
  const warning = res.headers['x-warning'] as string | undefined
  return { blob: res.data, warning }
}

