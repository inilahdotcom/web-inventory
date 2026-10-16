import { createFileRoute, redirect } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
// Ubah import ke komponen User Management
import { UserManagementView } from "@/features/users/components/UserManagementView"
import { profileService } from "@/services/profileService"

export const Route = createFileRoute("/_app/user-management")({
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

      // Hanya Admin yang diizinkan mengakses halaman User Management
      if (role !== "admin") {
        toast.error(
          "Akses ditolak. Halaman User Management hanya dapat diakses oleh Admin."
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
  // Gunakan komponen User Management di sini
  component: UserManagementView,
})
