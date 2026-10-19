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

export interface AuditLogMappedUI {
  id: number
  type:
    | "UPDATE"
    | "DELETE"
    | "CREATE"
    | "IMPORT"
    | "IMPORT_UPDATE"
    | "RESTORE"
    | "MOVE"
    | "SPLIT"
    | string
  user: {
    name: string
    role: string
    ip: string
  }
  timestamp: string
  target: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  description?: string
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

// 4. Helper Formatter Deskripsi Ramah Pengguna
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

  if (upperAction === "IMPORT_CREATE" || upperAction === "IMPORT") {
    return `Impor aset ${name ? `'${name}'` : ""} (${code}) dari file Excel berhasil disimpan ke sistem.`
  }

  if (upperAction === "IMPORT_UPDATE") {
    return `Aset ${name ? `'${name}'` : ""} (${code}) diperbarui lewat impor Excel. Tidak ada perubahan field yang terdeteksi.`
  }

  if (upperAction === "MOVE") {
    return `Mutasi aset. Perubahan lokasi atau pemegang aset (${code}) berhasil dicatat.`
  }

  if (upperAction === "SPLIT" || upperAction === "CREATE_SPLIT") {
    return `Pemecahan unit aset (${code}) berhasil dilakukan.`
  }

  if (
    upperAction === "DELETE" ||
    upperAction === "SOFT_DELETE" ||
    upperAction === "PERMANENT_DELETE"
  ) {
    return `Soft delete. Record dipindahkan ke arsip/dihapus dari sistem. Target: ${code}`
  }

  if (upperAction === "RESTORE") {
    return `Record ${entityType} ${name ? `${name} (${code})` : code} berhasil dipulihkan dari arsip.`
  }

  return `Aktivitas ${action} pada ${entityType} berhasil dicatat.`
}

export const auditLogService = {
  getLogs: async (
    params?: AuditLogQueryParams
  ): Promise<AuditLogMappedUI[]> => {
    const response = await api.get("/audit-logs", { params })
    const rawList: RawAuditLogFromGo[] =
      response.data?.data || response.data || []

    const seenMap = new Set<string>()
    const uniqueRawList: RawAuditLogFromGo[] = []

    for (const item of rawList) {
      const timeKey = item.createdAt ? item.createdAt.substring(0, 19) : ""
      const uniqueKey = `${item.action.toUpperCase()}_${item.entityId}_${timeKey}`

      if (!seenMap.has(uniqueKey)) {
        seenMap.add(uniqueKey)
        uniqueRawList.push(item)
      }
    }

    return uniqueRawList.map((item) => {
      const actionUpper = item.action.toUpperCase()
      const oldParsed = safeParseJSON(item.oldData)
      const newParsed = safeParseJSON(item.newData)

      let oldValues: Record<string, unknown> | undefined = undefined
      let newValues: Record<string, unknown> | undefined = undefined
      let description: string | undefined = undefined

      const describe = () =>
        formatDescription(
          item.action,
          item.entityType,
          oldParsed,
          newParsed,
          item.entityId
        )

      if (
        (actionUpper === "UPDATE" || actionUpper === "IMPORT_UPDATE") &&
        (oldParsed || newParsed)
      ) {
        const diff = getDiffValues(oldParsed, newParsed)
        oldValues = diff.oldValues
        newValues = diff.newValues
        if (!oldValues && !newValues) {
          description = describe()
        }
      } else {
        description = describe()
      }

      let uiType: AuditLogMappedUI["type"]
      if (actionUpper === "UPDATE") uiType = "UPDATE"
      else if (actionUpper === "IMPORT_UPDATE") uiType = "IMPORT_UPDATE"
      else if (actionUpper === "DELETE" || actionUpper === "SOFT_DELETE")
        uiType = "DELETE"
      else if (actionUpper === "IMPORT" || actionUpper === "IMPORT_CREATE")
        uiType = "IMPORT"
      else if (actionUpper === "RESTORE") uiType = "RESTORE"
      else if (actionUpper === "MOVE") uiType = "MOVE"
      else if (actionUpper === "SPLIT" || actionUpper === "CREATE_SPLIT")
        uiType = "SPLIT"
      else if (actionUpper === "CREATE") uiType = "CREATE"
      else uiType = actionUpper as AuditLogMappedUI["type"]

      const assetCode = String(
        newParsed?.asset_code ||
          newParsed?.AssetCode ||
          oldParsed?.asset_code ||
          oldParsed?.AssetCode ||
          item.entityId.substring(0, 8)
      )

      return {
        id: item.id,
        type: uiType,
        user: {
          name: item.userName || `User #${item.changedBy}`,
          role: "Admin / Staff",
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

  // FUNGSI BARU: Memanggil endpoint Backend Go untuk ekspor .xlsx
  exportLog: async (params?: AuditLogQueryParams) => {
    const response = await api.get("/audit-logs/export", {
      params,
      responseType: "blob",
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `Audit_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`
    )
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
