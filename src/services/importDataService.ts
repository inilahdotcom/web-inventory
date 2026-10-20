import { api } from '@/lib/axios'

// 1. Detail error validasi per baris
export interface ImportErrorDetail {
  row: number
  column: string
  reason: string
}

// 2. Format baris data preview
export interface ImportPreviewData {
  rowNumber: number
  assetCode: string
  name: string
  categoryName: string
  brandName: string
  quantity: number
  unit: string
  condition: string
  status: string
  price: number
  purchaseDate: string
  locationName: string
  holder: string
  description: string
  isDuplicate: boolean
}

// 3. Response dari GET /api/assets/import/preview
export interface ImportPreviewResponse {
  totalRows: number
  validCount: number
  failedCount: number
  validData: ImportPreviewData[]
  errors: ImportErrorDetail[]
}

// 4. Body Request untuk POST /api/assets/import/execute
export interface ExecuteImportPayload {
  mode: 'skip' | 'reject' | 'update'
  items: ImportPreviewData[]
}

// 5. Response dari POST /api/assets/import/execute
export interface ImportExecuteResponse {
  insertedCount: number
  updatedCount: number
  skippedCount: number
  failedCount: number
  errors: ImportErrorDetail[]
}

export const importService = {
  // 1. Download Template Excel Import
  downloadTemplate: async (): Promise<Blob> => {
    const res = await api.get('/assets/import/template', {
      responseType: 'blob',
    })
    return res.data
  },

  // 2. Upload & Preview File Excel (multipart/form-data key: "file")
  previewImport: async (file: File): Promise<ImportPreviewResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await api.post('/assets/import/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data?.data
  },

  // 3. Eksekusi Import (Mengirim JSON Payload dari hasil preview)
  executeImport: async (payload: ExecuteImportPayload): Promise<ImportExecuteResponse> => {
    const res = await api.post('/assets/import/execute', payload)
    return res.data?.data
  },

  // 4. Export Excel
  exportExcel: async (params?: Record<string, any>): Promise<Blob> => {
    const res = await api.get('/assets/export/excel', {
      params,
      responseType: 'blob',
    })
    return res.data
  },

  // 5. Export PDF
  exportPDF: async (params?: Record<string, any>): Promise<Blob> => {
    const res = await api.get('/assets/export/pdf', {
      params,
      responseType: 'blob',
    })
    return res.data
  },
}