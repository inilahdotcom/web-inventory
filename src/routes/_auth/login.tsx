import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '@/features/auth/components/LoginView'

export const Route = createFileRoute('/_auth/login')({
  component: LoginView,
})