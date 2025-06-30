export interface GcEvent {
  id: string
  summary: string
  description?: string
  start?: {
    dateTime?: string
    date?: string
  }
  end?: {
    dateTime?: string
    date?: string
  }
  visibility?: string
}

export interface PDFFile {
  id: string
  name: string
  url: string
}
