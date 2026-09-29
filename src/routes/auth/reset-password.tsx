import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordForm } from '@/features/auth/components/ResetPassword'

export const Route = createFileRoute('/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    }
  },
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()

  return <ResetPasswordForm token={token} />
}