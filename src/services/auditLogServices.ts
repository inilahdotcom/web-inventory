import { api } from "@/lib/axios"
import { formatDate, formatNumber } from "@/lib/formatters"

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
  cursor?: number | null
}

export interface AuditLogPaginationMeta {
  nextCursor: number | null
  pageSize: number
  hasMore: boolean
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
    | "EXPORT_EXCEL"
    | "EXPORT_PDF"
    | "LOGIN"
    | "LOGOUT"
    | string
  user: {
    name: string
  }
  timestamp: string
  target: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  description?: string
}

export interface GetAuditLogsResponse {
  data: AuditLogMappedUI[]
  pagination: AuditLogPaginationMeta
}

const safeParseJSON = (
  str?: string | null
): Record<string, unknown> | string | null => {
  if (!str) return null
  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === "object" && "attributes" in parsed) {
      return (parsed as { attributes: Record<string, unknown> }).attributes
    }
    return parsed
  } catch {
    return str
  }
}

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

const formatDescription = (
  action: string,
  entityType: string,
  oldObj: unknown,
  newObj: unknown,
  entityId: string,
  userName?: string
) => {
  const upperAction = action.toUpperCase()

  if (typeof newObj === "string") return newObj
  if (typeof oldObj === "string") return oldObj

  const actorName = userName?.trim() || `User #${entityId}`
  const userLabel = actorName.toLowerCase().startsWith("user")
    ? actorName
    : `User ${actorName}`

  if (upperAction === "EXPORT_EXCEL") {
    return "Mengekspor data ke file Excel."
  }
  if (upperAction === "EXPORT_PDF") {
    return "Mengekspor data ke file PDF."
  }
  if (upperAction === "LOGIN") {
    return `${userLabel} berhasil login ke sistem.`
  }
  if (upperAction === "LOGOUT") {
    return `${userLabel} berhasil logout.`
  }

  const data = (newObj || oldObj || {}) as Record<string, unknown>
  const name = String(data.name || data.Name || "")
  const code = String(data.asset_code || data.AssetCode || entityId)
  const qty = data.quantity || data.Quantity
  const unit = String(data.unit || data.Unit || "Unit")
  const price = data.purchase_price || data.PurchasePrice
  const notes = data.notes || data.Notes

  if (upperAction === "CREATE") {
    let desc = `${name || entityType}`
    if (qty) desc += ` · ${qty} ${unit}`
    if (price) desc += ` · harga Rp ${formatNumber(Number(price))}`
    if (notes) desc += ` · ${notes}`
    return desc
  }

  if (upperAction === "IMPORT_CREATE" || upperAction === "IMPORT") {
    return `Impor aset ${name ? `'${name}'` : ""} (${code}) dari file Excel berhasil disimpan ke sistem.`
  }

  if (upperAction === "IMPORT_UPDATE") {
    return `Aset ${name ? `'${name}'` : ""} (${code}) diperbarui lewat impor Excel.`
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
    upperAction === "PERMANENT_DELETE" ||
    upperAction === "BULK_DELETE"
  ) {
    return `Record dipindahkan ke arsip/dihapus dari sistem. Target: ${code}`
  }

  if (upperAction === "RESTORE") {
    return `Record ${entityType} ${name ? `${name} (${code})` : code} berhasil dipulihkan.`
  }

  return `Aktivitas ${action} pada ${entityType} berhasil dicatat.`
}

export const auditLogService = {
  getLogs: async (
    params?: AuditLogQueryParams
  ): Promise<GetAuditLogsResponse> => {
    const response = await api.get("/audit-logs", { params })

    const rawList: RawAuditLogFromGo[] = response.data?.data || []
    const paginationMeta: AuditLogPaginationMeta = response.data?.meta || {
      nextCursor: null,
      pageSize: params?.pageSize || 20,
      hasMore: false,
    }

    const mappedLogs: AuditLogMappedUI[] = rawList.map((item) => {
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
          item.entityId,
          item.userName
        )

      const isObjOld = oldParsed && typeof oldParsed === "object"
      const isObjNew = newParsed && typeof newParsed === "object"

      if (
        (actionUpper === "UPDATE" || actionUpper === "IMPORT_UPDATE") &&
        (isObjOld || isObjNew)
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

      const uiType: AuditLogMappedUI["type"] = actionUpper

      let targetLabel = `${item.entityType.toLowerCase()} · ${item.entityId}`
      const isAuthOrUser =
        item.entityType.toLowerCase() === "auth" ||
        item.entityType.toLowerCase() === "users" ||
        actionUpper === "LOGIN" ||
        actionUpper === "LOGOUT"

      if (isAuthOrUser) {
        const actorName = item.userName?.trim()
        if (actorName) {
          targetLabel = `${item.entityType.toLowerCase()} · ${actorName}`
        }
      } else if (isObjNew || isObjOld) {
        const parsedObj = (newParsed || oldParsed) as Record<string, unknown>
        const assetCode = String(
          parsedObj?.asset_code ||
            parsedObj?.AssetCode ||
            item.entityId.substring(0, 8)
        )
        targetLabel = `${item.entityType.toLowerCase()} · ${assetCode}`
      }

      return {
        id: item.id,
        type: uiType,
        user: {
          name: item.userName || `User #${item.changedBy}`,
        },
        timestamp: formatDate(item.createdAt, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        target: targetLabel,
        oldValues,
        newValues,
        description,
      }
    })

    return {
      data: mappedLogs,
      pagination: paginationMeta,
    }
  },

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
