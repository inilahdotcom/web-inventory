export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024

const allowedDocumentTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
])

type DocumentFile = { size: number; type: string }

export function validateAssetDocument(
  file: DocumentFile | null,
  documentType: string,
  warrantyExpiresAt: string
) {
  if (!file) return "Pilih file yang akan diunggah."
  if (!allowedDocumentTypes.has(file.type)) {
    return "Format file harus PDF, JPG, PNG, atau WEBP."
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    return "Ukuran file maksimal 10 MB."
  }
  if (documentType === "warranty" && !warrantyExpiresAt) {
    return "Tanggal akhir garansi wajib diisi."
  }
  return ""
}

export type WarrantyDueState = "active" | "due" | "expired"

export function warrantyDueState(
  warrantyExpiresAt: string,
  today = new Date()
): WarrantyDueState {
  const expiry = new Date(`${warrantyExpiresAt.slice(0, 10)}T23:59:59`)
  if (Number.isNaN(expiry.getTime())) return "active"
  if (expiry.getTime() < today.getTime()) return "expired"
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return expiry.getTime() - today.getTime() <= thirtyDays ? "due" : "active"
}
