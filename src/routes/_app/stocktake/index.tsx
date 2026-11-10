import { createFileRoute, redirect } from "@tanstack/react-router"
import { QueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { StocktakeListView } from "@/features/stocktake/StocktakeListView"
import { profileService } from "@/services/profileService"

export const Route = createFileRoute("/_app/stocktake/")({
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

      // Hanya Admin dan Staff GA yang diizinkan mengakses fitur Stok Opname
      if (role !== "admin" && role !== "staff_ga") {
        toast.error(
          "Akses ditolak. Fitur Stok Opname hanya dapat diakses oleh Admin dan Staff GA."
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
  component: StocktakeListView,
})
