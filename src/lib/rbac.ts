export const ADMIN_ROLES = ["admin"] as const
export const ASSET_WRITE_ROLES = ["admin", "staff_ga"] as const

export type AppRole = "admin" | "staff_ga" | "viewer"

export function hasAllowedRole(
  role: string | null | undefined,
  allowedRoles: readonly AppRole[]
) {
  return allowedRoles.includes((role?.trim().toLowerCase() ?? "") as AppRole)
}
