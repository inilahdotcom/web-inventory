/**
 * PagePagination — Komponen paginasi cursor-based.
 *
 * Usage:
 *   <PagePagination
 *     currentPage={cursorHistory.length + 1}
 *     hasPreviousPage={cursorHistory.length > 0}
 *     hasNextPage={pagination.hasNextPage}
 *     onPrevious={goToPreviousPage}
 *     onNext={goToNextPage}
 *     totalVisible={visibleAssets.length}
 *     pageSize={pageSize}
 *     onPageSizeChange={handlePageSizeChange}
 *   />
 */

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const PAGE_SIZES = [10, 25, 100]

// ─── PageSizeMenu ─────────────────────────────────────────────────────────────

interface PageSizeMenuProps {
  pageSize: number
  onChange: (size: number) => void
}

function PageSizeMenu({ pageSize, onChange }: PageSizeMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[#e0e2e8] bg-white px-3 text-xs font-semibold text-[#555a6a] hover:border-[#a5a8b5]"
      >
        <span>{pageSize} / halaman</span>
        <ChevronDown size={13} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-10 z-20 w-32 rounded-xl border border-[#e0e2e8] bg-white p-1.5 shadow-[0_10px_25px_rgba(32,35,45,0.12)]">
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                onChange(size)
                setOpen(false)
              }}
              className={`flex w-full cursor-pointer rounded-lg px-3 py-1.5 text-left text-xs font-medium hover:bg-[#f5f6f8] ${
                pageSize === size
                  ? "bg-[#f0efff] text-[#4262ff]"
                  : "text-[#555a6a]"
              }`}
            >
              {size} / halaman
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── PageButton ───────────────────────────────────────────────────────────────

interface PageButtonProps {
  children: React.ReactNode
  active?: boolean
  bordered?: boolean
  disabled?: boolean
  onClick?: () => void
}

function PageButton({
  children,
  active = false,
  bordered = false,
  disabled = false,
  onClick,
}: PageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`grid size-8 cursor-pointer place-items-center rounded-full text-xs disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-[#1c1c1e] font-semibold text-white"
          : bordered
            ? "border border-[#e0e2e8] bg-white text-[#1c1c1e]"
            : "text-[#555a6a]"
      }`}
    >
      {children}
    </button>
  )
}

// ─── PagePagination ───────────────────────────────────────────────────────────

interface PagePaginationProps {
  currentPage: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  onPrevious: () => void
  onNext: () => void
  totalVisible?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  className?: string
}

export function PagePagination({
  currentPage,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
  totalVisible,
  pageSize,
  onPageSizeChange,
  className = "",
}: PagePaginationProps) {
  return (
    <footer
      className={`flex items-center gap-3 border-t border-[#e0e2e8] bg-[#fafbfc] px-4.5 py-3 ${className}`}
    >
      {totalVisible !== undefined && (
        <span className="text-xs text-[#6b6f7e]">
          Menampilkan {totalVisible} item &middot; Halaman {currentPage}
        </span>
      )}

      <div className="ml-auto flex items-center gap-2">
        {pageSize !== undefined && onPageSizeChange && (
          <PageSizeMenu pageSize={pageSize} onChange={onPageSizeChange} />
        )}
        <PageButton bordered disabled={!hasPreviousPage} onClick={onPrevious}>
          &lsaquo;
        </PageButton>
        <PageButton active>{currentPage}</PageButton>
        <PageButton bordered disabled={!hasNextPage} onClick={onNext}>
          &rsaquo;
        </PageButton>
      </div>
    </footer>
  )
}
