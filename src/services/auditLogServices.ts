import { api } from "@/lib/axios"

export interface RawAuditLogFromGo {
  id: number
  entityType: string
  entityId: string
  action: string
  changedBy: number
  userName?: string
  oldData?: string | null
  newData?: string | null
  createdAt: string
}

export interface AuditLogQueryParams {
  userId?: number
  entity?: string
  action?: string
  startDate?: string
  endDate?: string
  pageSize?: number
}

// 1. Helper Parse JSON aman (Mendukung wrapper `attributes` maupun objek langsung)
const safeParseJSON = (str?: string | null): Record<string, unknown> | null => {
  if (!str) return null
  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === "object" && "attributes" in parsed) {
      return (parsed as { attributes: Record<string, unknown> }).attributes
    }
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

// 2. Normalisasi Key agar PascalCase & snake_case Terpeta ke Nama Standar UI yang Sama
const normalizeObject = (obj: unknown) => {
  const res: Record<string, unknown> = {}
  if (!obj || typeof obj !== "object") return res

  const typedObj = obj as Record<string, unknown>

  const ignoredKeys = [
    "CreatedAt",
    "UpdatedAt",
    "created_at",
    "updated_at",
    "createdat",
    "updatedat",
    "ID",
    "id",
    "CreatedBy",
    "UpdatedBy",
    "auditLogs",
    "photos",
    "slug",
    "DeleteReason",
    "DeletedAt",
    "mutationHistory",
    "mutationhistory",
    "completeness",
    "attributes",
  ]

  Object.keys(typedObj).forEach((key) => {
    if (ignoredKeys.includes(key)) return

    let stdKey = key.toLowerCase()
    if (stdKey === "assetcode" || stdKey === "code") stdKey = "code"
    else if (stdKey === "categoryid") stdKey = "categoryId"
    else if (stdKey === "brandid") stdKey = "brandId"
    else if (stdKey === "locationid") stdKey = "locationId"
    else if (stdKey === "purchaseprice" || stdKey === "acquisitionprice")
      stdKey = "price"
    else if (stdKey === "purchasedate" || stdKey === "acquisitiondate")
      stdKey = "date"
    else if (stdKey === "holdername") stdKey = "holder"
    else if (stdKey === "notes" || stdKey === "description") stdKey = "notes"

    const val = typedObj[key]
    // Menyeragamkan nilai null/kosong/empty string
    res[stdKey] =
      val === null || val === undefined || val === "" || val === "-" ? "-" : val
  })

  return res
}

// 3. Helper Diff UPDATE Presisi (Hanya mengambil field yang BERUBAH)
const getDiffValues = (oldObj: unknown, newObj: unknown) => {
  if (!oldObj || !newObj) return { oldValues: undefined, newValues: undefined }

  const cleanOld = normalizeObject(oldObj)
  const cleanNew = normalizeObject(newObj)

  const oldDiff: Record<string, unknown> = {}
  const newDiff: Record<string, unknown> = {}

  const allKeys = Array.from(
    new Set([...Object.keys(cleanOld), ...Object.keys(cleanNew)])
  )

  allKeys.forEach((key) => {
    const valOld = cleanOld[key]
    const valNew = cleanNew[key]

    // Hanya masukkan ke diff jika nilainya terbukti BERBEDA secara nyata
    if (JSON.stringify(valOld) !== JSON.stringify(valNew)) {
      oldDiff[key] = valOld ?? "-"
      newDiff[key] = valNew ?? "-"
    }
  })

  return {
    oldValues: Object.keys(oldDiff).length > 0 ? oldDiff : undefined,
    newValues: Object.keys(newDiff).length > 0 ? newDiff : undefined,
  }
}

// 4. Helper Formatter Deskripsi untuk CREATE, DELETE, RESTORE, & IMPORT
const formatDescription = (
  action: string,
  entityType: string,
  oldObj: unknown,
  newObj: unknown,
  entityId: string
) => {
  const data = (newObj || oldObj || {}) as Record<string, unknown>
  const name = String(data.name || data.Name || "")
  const code = String(data.asset_code || data.AssetCode || entityId)
  const qty = data.quantity || data.Quantity
  const unit = String(data.unit || data.Unit || "Unit")
  const price = data.purchase_price || data.PurchasePrice
  const notes = data.notes || data.Notes
  const upperAction = action.toUpperCase()

  if (upperAction === "CREATE") {
    let desc = `${name || entityType}`
    if (qty) desc += ` · ${qty} ${unit}`
    if (price) desc += ` · harga Rp ${Number(price).toLocaleString("id-ID")}`
    if (notes) desc += ` · ${notes}`
    return desc
  }

  if (upperAction === "DELETE" || upperAction === "PERMANENT_DELETE") {
    return `Soft delete. Record dipindahkan ke arsip/dihapus dari sistem. Target: ${code}`
  }

  if (upperAction === "RESTORE") {
    return `Record ${entityType} ${name ? `${name} (${code})` : code} berhasil dipulihkan dari arsip.`
  }

  if (upperAction === "IMPORT") {
    return `Import data master ${entityType} berhasil diproses.`
  }

  return `Aktivitas ${action} pada ${entityType} berhasil dicatat.`
}

export const auditLogService = {
  getLogs: async (params?: AuditLogQueryParams) => {
    const response = await api.get("/audit-logs", { params })
    const rawList: RawAuditLogFromGo[] =
      response.data?.data || response.data || []

    // 1. DEDUPLIKASI CERDAS: Menghapus record ganda (asset & assets) dari backend
    const seenMap = new Set<string>()
    const uniqueRawList: RawAuditLogFromGo[] = []

    for (const item of rawList) {
      const timeKey = item.createdAt.substring(0, 19)
      const uniqueKey = `${item.action.toUpperCase()}_${item.entityId}_${timeKey}`

      if (!seenMap.has(uniqueKey)) {
        seenMap.add(uniqueKey)
        uniqueRawList.push(item)
      }
    }

    // 2. MAPPING KE FORMAT UI FIGMA
    return uniqueRawList.map((item) => {
      const actionUpper = item.action.toUpperCase()
      const oldParsed = safeParseJSON(item.oldData)
      const newParsed = safeParseJSON(item.newData)

      let oldValues: Record<string, unknown> | undefined = undefined
      let newValues: Record<string, unknown> | undefined = undefined
      let description: string | undefined = undefined

      if (actionUpper === "UPDATE" && (oldParsed || newParsed)) {
        const diff = getDiffValues(oldParsed, newParsed)
        oldValues = diff.oldValues
        newValues = diff.newValues
      } else {
        description = formatDescription(
          item.action,
          item.entityType,
          oldParsed,
          newParsed,
          item.entityId
        )
      }

      // Ambil kode aset / ID entitas
      const assetCode = String(
        newParsed?.asset_code ||
          newParsed?.AssetCode ||
          oldParsed?.asset_code ||
          oldParsed?.AssetCode ||
          item.entityId.substring(0, 8)
      )

      return {
        id: item.id,
        type: actionUpper as
          "UPDATE" | "DELETE" | "CREATE" | "IMPORT" | "RESTORE",
        user: {
          name: item.userName || `User #${item.changedBy}`,
          role: "Admin",
          ip: "192.168.1.10",
        },
        timestamp: new Date(item.createdAt).toLocaleString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        target: `${item.entityType.toLowerCase()} · ${assetCode}`,
        oldValues,
        newValues,
        description,
      }
    })
  },
}
