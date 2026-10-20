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
      <p className="text-sm font-semibold text-[#1c1c1e]">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-[#6b6f7e]">{description}</p>
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
      <p className="text-sm text-[#600000]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="h-9 cursor-pointer rounded-full bg-[#1c1c1e] px-4 text-xs font-semibold text-white transition hover:bg-[#333]"
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
      className={`rounded-2xl border border-[#eef0f3] bg-white px-5 py-12 text-center text-sm text-[#6b6f7e] ${className}`}
    >
      {message}
    </div>
  )
}
