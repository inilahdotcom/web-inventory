import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Table ────────────────────────────────────────────────────────────────────

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table
      ref={ref}
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

// ─── TableHeader ──────────────────────────────────────────────────────────────

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn("[&_tr]:border-b [&_tr]:border-hairline", className)}
    {...props}
  />
))
TableHeader.displayName = "TableHeader"

// ─── TableBody ────────────────────────────────────────────────────────────────

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, onKeyDown, ...props }, ref) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableSectionElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return

    const target = e.target as HTMLElement | null
    const currentRow = target?.closest<HTMLTableRowElement>(
      "tr[data-slot='table-row']"
    )
    if (!currentRow) return

    if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
      return
    }

    const rows = Array.from(
      e.currentTarget.querySelectorAll<HTMLTableRowElement>(
        "tr[data-slot='table-row']"
      )
    )
    const index = rows.indexOf(currentRow)
    if (index === -1) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      rows[Math.min(index + 1, rows.length - 1)]?.focus()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      rows[Math.max(index - 1, 0)]?.focus()
    } else if (e.key === "Home") {
      e.preventDefault()
      rows[0]?.focus()
    } else if (e.key === "End") {
      e.preventDefault()
      rows[rows.length - 1]?.focus()
    } else if ((e.key === "Enter" || e.key === " ") && target === currentRow) {
      e.preventDefault()
      currentRow.click()
    }
  }

  return (
    <tbody
      ref={ref}
      data-slot="table-body"
      onKeyDown={handleKeyDown}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
})
TableBody.displayName = "TableBody"

// ─── TableFooter ──────────────────────────────────────────────────────────────

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      "border-t border-hairline bg-muted/50 font-medium",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

// ─── TableRow ─────────────────────────────────────────────────────────────────

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, tabIndex = 0, ...props }, ref) => (
  <tr
    ref={ref}
    tabIndex={tabIndex}
    data-slot="table-row"
    className={cn(
      "border-b border-hairline transition-colors hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-inset data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

// ─── TableHead ────────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    data-slot="table-head"
    className={cn(
      "h-10 px-3 text-left align-middle text-[11px] font-semibold text-muted-foreground has-[[role=checkbox]]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

// ─── TableCell ────────────────────────────────────────────────────────────────

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    data-slot="table-cell"
    className={cn(
      "px-3 py-2.5 align-middle text-sm has-[[role=checkbox]]:pr-0",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// ─── TableCaption ─────────────────────────────────────────────────────────────

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
}
