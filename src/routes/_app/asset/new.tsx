import { createFileRoute, redirect } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { AssetCreateView } from "@/features/assets/components/AssetCreateView"
import { profileService } from "@/services/profileService"

export const Route = createFileRoute("/_app/asset/new")({
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
          "Akses ditolak. Anda tidak memiliki izin untuk menambah aset."
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
  component: AssetCreateView,
})
