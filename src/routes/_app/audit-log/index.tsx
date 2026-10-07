import { createFileRoute, redirect } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AuditLogView } from "@/features/audit-log/components/AuditLogView"
import { profileService } from "@/services/profileService"

export const Route = createFileRoute("/_app/audit-log/")({
  beforeLoad: async ({ context }) => {
    try {
      const queryClient = (context as { queryClient?: QueryClient }).queryClient

      const profile = queryClient
        ? await queryClient.fetchQuery({
            queryKey: ["profile"],
            queryFn: () => profileService.get(),
          })
        : await profileService.get()

      const role = profile?.attributes?.role?.toLowerCase() || ""
      if (role !== "admin") {
        toast.error(
          "Akses ditolak. Halaman Audit Log hanya dapat diakses oleh Admin."
        )
        throw redirect({
          to: "/",
        })
      }
    } catch (error) {
      if ((error as { to?: string })?.to) throw error
      throw redirect({ to: "/" })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <AuditLogView />
}
