import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/")({
  beforeLoad: () => {
    throw redirect({
      to: "/aset/$assetId",
      params: { assetId: "053-inc-ga-1-26" },
    })
  },
})
