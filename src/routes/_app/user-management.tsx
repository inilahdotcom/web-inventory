import { createFileRoute, redirect } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import MasterDataPage from "@/features/master-data/components/MasterDataPage"
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

      // Hanya Admin yang diizinkan mengakses halaman Master Data
      if (role !== "admin") {
        toast.error(
          "Akses ditolak. Halaman Master Data hanya dapat diakses oleh Admin."
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
  component: MasterDataPage,
})
