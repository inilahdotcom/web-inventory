export interface AuditTimelineSource {
  type: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  description?: string
}

export interface AuditTimelineEntry {
  id: string
  title: string
  subtitle: string
  meta: string
}

const FIELD_LABELS: Record<string, string> = {
  assetCode: "Kode aset",
  brand: "Merek",
  category: "Kategori",
  condition: "Kondisi",
  description: "Deskripsi",
  holder: "Pemegang",
  location: "Lokasi",
  name: "Nama aset",
  price: "Harga",
  purchasePrice: "Harga perolehan",
  quantity: "Jumlah",
  status: "Status",
  unit: "Satuan",
}

const HIDDEN_FIELDS = new Set([
  "brandId",
  "categoryId",
  "createdAt",
  "createdat",
  "id",
  "locationId",
  "updatedAt",
  "updatedat",
])

function fieldLabel(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field]

  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase())
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "" || value === "-") {
    return "Kosong"
  }

  if (typeof value === "boolean") return value ? "Ya" : "Tidak"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function valuesEqual(before: unknown, after: unknown): boolean {
  if (Object.is(before, after)) return true
  if (typeof before !== "object" || typeof after !== "object") return false
  return JSON.stringify(before) === JSON.stringify(after)
}

export function buildAuditTimelineEntries(
  log: AuditTimelineSource
): AuditTimelineEntry[] {
  const oldValues = log.oldValues ?? {}
  const newValues = log.newValues ?? {}
  const fields = [
    ...new Set([...Object.keys(oldValues), ...Object.keys(newValues)]),
  ]

  const changes = fields
    .filter((field) => !HIDDEN_FIELDS.has(field))
    .filter((field) => !valuesEqual(oldValues[field], newValues[field]))
    .map((field) => ({
      id: field,
      title: fieldLabel(field),
      subtitle: `${formatValue(oldValues[field])} → ${formatValue(newValues[field])}`,
      meta: "Perubahan nilai",
    }))

  if (changes.length > 0) return changes

  return [
    {
      id: "aktivitas",
      title: `Aktivitas ${log.type.replaceAll("_", " ")}`,
      subtitle:
        log.description || "Tidak ada detail perubahan yang ditampilkan.",
      meta: "Rekam aktivitas",
    },
  ]
}
