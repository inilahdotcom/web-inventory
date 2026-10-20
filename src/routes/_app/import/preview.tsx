import { createFileRoute, redirect } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import AssetImportPage from "@/features/import/components/AssetImportPreviewPage"
import { profileService } from "@/services/profileService"

export const Route = createFileRoute("/_app/import/preview")({
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
      if (role !== "admin" && role !== "staff_ga") {
        toast.error(
          "Akses ditolak. Anda tidak memiliki izin untuk mengimpor data."
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
  component: AssetImportPage,
})
