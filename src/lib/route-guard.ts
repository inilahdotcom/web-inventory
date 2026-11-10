import { redirect } from "@tanstack/react-router"
import { toast } from "sonner"
import type { AppRole } from "@/lib/rbac"
import { hasAllowedRole } from "@/lib/rbac"
import { queryClient } from "@/lib/query-client"
import { profileService } from "@/services/profileService"

const accessDeniedMessage =
  "Akses ditolak. Anda tidak memiliki izin untuk membuka halaman ini."

export function createRoleGuard(allowedRoles: readonly AppRole[]) {
  return async () => {
    let role: string
    try {
      const profile = await queryClient.fetchQuery({
        queryKey: ["profile"],
        queryFn: () => profileService.get(),
        staleTime: 30_000,
      })
      role = profile?.attributes?.role ?? ""
    } catch {
      throw redirect({ to: "/" })
    }

    if (!hasAllowedRole(role, allowedRoles)) {
      toast.error(accessDeniedMessage)
      throw redirect({ to: "/" })
    }
  }
}
