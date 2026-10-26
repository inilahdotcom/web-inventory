export interface AuditLogItem {
  id: number
  entityType: string
  entityId: string
  action: string
  changedBy: string
  userName: string
  oldData: unknown
  newData: unknown
  createdAt: string
}

export interface GetAuditLogsParams {
  pageSize?: number
  cursor?: number | null
  userId?: number
  entity?: string
  action?: string
  startDate?: string
  endDate?: string
}

export interface AuditLogPagination {
  nextCursor: number | null
  pageSize: number
  hasMore: boolean
}

export interface AuditLogResponse {
  data: AuditLogItem[]
  pagination: AuditLogPagination
}
