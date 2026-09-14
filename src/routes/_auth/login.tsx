import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginView } from "@/features/auth/components/LoginView"
import { authStorage } from "@/lib/auth-storage"

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: () => {
    if (authStorage.getAccessToken()) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginView,
})
