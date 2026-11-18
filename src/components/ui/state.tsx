/**
 * EmptyState — Tampilan saat data kosong (tidak ada hasil).
 * ErrorState — Tampilan saat terjadi error, dengan tombol "Coba lagi".
 *
 * Usage:
 *   <EmptyState title="Aset tidak ditemukan" description="Ubah kata pencarian..." />
 *
 *   <ErrorState message="Gagal memuat data." onRetry={() => refetch()} />
 */

import type { ReactNode } from "react"

// ─── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = "Data tidak ditemukan",
  description = "Ubah kata pencarian atau reset filter untuk melihat data lain.",
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-[#eef0f3] bg-white px-5 py-12 text-center ${className}`}
    >
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

// ─── ErrorState ────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  message = "Terjadi kesalahan. Periksa koneksi lalu coba lagi.",
  onRetry,
  retryLabel = "Coba lagi",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-2xl border border-[#ffc6c6] bg-white px-5 py-10 text-center ${className}`}
    >
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-9 cursor-pointer rounded-full bg-primary px-4 text-xs font-semibold text-white transition hover:bg-[#333]"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

// ─── LoadingState ──────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({
  message = "Memuat data dari server...",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#eef0f3] bg-white px-5 py-12 text-center ${className}`}
    >
      <svg
        className="h-8 w-8 animate-spin text-[#1c1c1e]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

// ─── FullPageLoading ────────────────────────────────────────────────────────────

interface FullPageLoadingProps {
  message?: string
}

export function FullPageLoading({
  message = "Memuat data...",
}: FullPageLoadingProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="h-12 w-12 animate-spin text-[#1c1c1e]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
