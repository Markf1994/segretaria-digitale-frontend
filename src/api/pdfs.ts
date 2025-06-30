import api from './axios'
import type { PDFFile } from './types'

export const listPDFs = (): Promise<PDFFile[]> =>
  api.get<PDFFile[]>('/pdfs').then(r => r.data)

