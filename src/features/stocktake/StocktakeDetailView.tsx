import { useMemo, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronLeft } from "lucide-react"

import {
  stocktakeKeys,
  useCloseSession,
  useSessionDetail,
  useSessionItems,
  useStartSession,
  useStocktakePermission,
} from "@/hooks/useStocktake"
import { parseApiError } from "@/services/stocktake"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { FilterChip } from "@/components/ui/Pill"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state"
import { ProfileDropdown } from "@/components/ui/ProfileDropdown"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ItemStatus } from "@/types/stocktake"
import { SessionCheckDialog } from "./SessionCheckDialog"
import {
  ITEM_STATUS_LABEL,
  ItemStatusBadge,
  ProgressBar,
  SessionStatusBadge,
  formatDateTimeID,
  formatPeriod,
} from "./stockTakeUi"

type DialogKind = "start" | "close" | "check" | null

export function StocktakeDetailView({ id }: { id: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, canCheck } = useStocktakePermission()

  const detailQuery = useSessionDetail(id)
  const detail = detailQuery.data
  const session = detail?.session
  const progress = detail?.progress
  const byLocation = detail?.byLocation ?? []

  const pending = progress?.pending ?? 0
  const unchecked = progress?.unchecked ?? 0

  const [tabChoice, setTabChoice] = useState<ItemStatus | null>(null)
  const tab: ItemStatus =
    tabChoice ??
    (session?.status === "closed"
      ? unchecked > 0
        ? "unchecked"
        : "checked"
      : "pending")

  const [locationId, setLocationId] = useState<number | undefined>(undefined)
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [dialog, setDialog] = useState<DialogKind>(null)

  const itemsQuery = useSessionItems(
    id,
    { status: tab, locationId },
    Boolean(session) && session?.status !== "draft"
  )
  const items = useMemo(
    () => itemsQuery.data?.pages.flatMap((page) => page?.items ?? []) ?? [],
    [itemsQuery.data]
  )

  const startMutation = useStartSession()
  const closeMutation = useCloseSession()

  useEffect(() => {
    if (session?.status === "draft") {
      void navigate({ to: "/stocktake" })
    }
  }, [session?.status, navigate])

  const isOpen = session?.status === "open"
  const canSelect =
    canCheck && isOpen && (tab === "pending" || tab === "checked")
  const allSelected =
    items.length > 0 && items.every((item) => selected.has(item.assetId))

  const changeTab = (next: ItemStatus) => {
    setTabChoice(next)
    setSelected(new Set())
  }

  const changeLocation = (next: number | undefined) => {
    setLocationId(next)
    setSelected(new Set())
  }

  const toggleItem = (assetId: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(assetId)) next.delete(assetId)
      else next.add(assetId)
      return next
    })

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.assetId)))

  const handleCheckClosed = (changed: boolean) => {
    setDialog(null)
    if (changed) {
      setSelected(new Set())
      void queryClient.invalidateQueries({ queryKey: stocktakeKeys.all })
    }
  }

  const tabs: { key: ItemStatus; count: number }[] = progress
    ? [
        { key: "pending", count: progress.pending ?? 0 },
        { key: "checked", count: progress.checked ?? 0 },
        { key: "missing", count: progress.missing ?? 0 },
        ...(unchecked > 0
          ? [{ key: "unchecked" as ItemStatus, count: unchecked }]
          : []),
      ]
    : []

  const percent = progress?.percent ?? 0
  const examined = progress
    ? (progress.checked ?? 0) + (progress.missing ?? 0)
    : 0

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 text-neutral-900">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 pl-14 text-xs text-neutral-500 lg:pl-0">
          <Link
            to="/stocktake"
            className="flex items-center gap-1.5 font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            <span>Stok Opname</span>
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="max-w-40 truncate font-semibold text-neutral-900 sm:max-w-xs">
            {session?.name || "Detail Sesi"}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <ProfileDropdown />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-12 sm:px-6 lg:px-8">
        {detailQuery.isLoading && (
          <LoadingState message="Memuat detail sesi..." />
        )}

        {!detailQuery.isLoading && detailQuery.error && (
          <ErrorState
            message={parseApiError(
              detailQuery.error,
              "Detail sesi gagal dimuat. Periksa koneksi lalu coba lagi."
            )}
            onRetry={() => void detailQuery.refetch()}
          />
        )}

        {session && progress && (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                    {session.name}
                  </h1>
                  <SessionStatusBadge status={session.status} />
                </div>
                <p className="text-xs text-neutral-500 sm:text-sm">
                  {formatPeriod(session.periodStart, session.periodEnd)}{" "}
                  &middot; {session.locationIds?.length ?? 0} lokasi cakupan
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canManage && session.status === "draft" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setDialog("start")}
                  >
                    Mulai Sesi
                  </Button>
                )}
                {canManage && isOpen && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDialog("close")}
                  >
                    Tutup Sesi
                  </Button>
                )}
                {canSelect && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={selected.size === 0}
                    onClick={() => setDialog("check")}
                  >
                    Periksa Terpilih ({selected.size})
                  </Button>
                )}
              </div>
            </div>

            {session.status === "draft" && (
              <Card className="rounded-2xl border border-hairline bg-card p-5 text-sm leading-relaxed text-muted-foreground shadow-2xs">
                Sesi belum dimulai. Saat dimulai, daftar aset di lokasi yang
                dipilih akan dibekukan sebagai acuan pemeriksaan stok opname.
              </Card>
            )}

            {session.status === "closed" && (
              <Card className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3.5 text-sm font-medium text-primary shadow-2xs">
                Sesi ditutup pada {formatDateTimeID(session.closedAt)}. Hasil
                terkunci dan tidak dapat diubah.
              </Card>
            )}

            {session.status !== "draft" && (
              <>
                {/* METRICS */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <Metric label="Total aset" value={progress.total} />
                  <Metric
                    label="Sudah dicek"
                    value={progress.checked}
                    tone="text-emerald-600"
                  />
                  <Metric
                    label="Belum dicek"
                    value={progress.pending}
                    tone="text-amber-600"
                  />
                  <Metric
                    label="Hilang"
                    value={progress.missing}
                    tone="text-rose-600"
                  />
                  {(unchecked > 0 || session.status === "closed") && (
                    <Metric
                      label="Tidak diperiksa"
                      value={unchecked}
                      tone="text-neutral-500"
                    />
                  )}
                </div>

                {/* PROGRESS BAR CARD */}
                <Card className="rounded-2xl border border-hairline bg-card p-5 shadow-2xs">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      Progres Pemeriksaan
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <ProgressBar percent={percent} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {examined} dari {progress.total} aset sudah diperiksa
                  </p>
                </Card>

                {/* FILTER BY LOCATION */}
                {byLocation.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <FilterChip
                      active={locationId === undefined}
                      onClick={() => changeLocation(undefined)}
                    >
                      Semua lokasi
                    </FilterChip>
                    {byLocation.map((loc) => (
                      <FilterChip
                        key={loc.locationId}
                        active={locationId === loc.locationId}
                        onClick={() =>
                          changeLocation(
                            locationId === loc.locationId
                              ? undefined
                              : loc.locationId
                          )
                        }
                      >
                        {loc.locationName} &middot; {loc.pending} belum
                      </FilterChip>
                    ))}
                  </div>
                )}

                {/* FILTER BY STATUS */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {tabs.map(({ key, count }) => (
                    <FilterChip
                      key={key}
                      active={tab === key}
                      onClick={() => changeTab(key)}
                    >
                      {ITEM_STATUS_LABEL[key]} ({count})
                    </FilterChip>
                  ))}
                </div>

                {itemsQuery.isLoading && (
                  <LoadingState message="Memuat daftar aset..." />
                )}

                {!itemsQuery.isLoading && itemsQuery.error && (
                  <ErrorState
                    message={parseApiError(
                      itemsQuery.error,
                      "Daftar aset gagal dimuat."
                    )}
                    onRetry={() => void itemsQuery.refetch()}
                  />
                )}

                {!itemsQuery.isLoading &&
                  !itemsQuery.error &&
                  items.length === 0 && (
                    <EmptyState
                      title="Tidak ada aset"
                      description={
                        tab === "pending"
                          ? "Semua aset di tampilan ini sudah diperiksa."
                          : "Belum ada aset dengan status ini."
                      }
                    />
                  )}

                {items.length > 0 && (
                  <Card className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-2xs">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-hairline bg-muted/50 hover:bg-muted/50">
                          {canSelect && (
                            <TableHead className="w-12 px-4 py-3.5">
                              <Checkbox
                                checked={allSelected}
                                onChange={toggleAll}
                              />
                            </TableHead>
                          )}
                          <TableHead className="px-4 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Kode
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Nama Barang
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Lokasi
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Kondisi
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Status
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                            Waktu Cek
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow
                            key={item.assetId}
                            className={`border-b border-hairline transition-colors ${
                              selected.has(item.assetId)
                                ? "bg-muted/60"
                                : "hover:bg-muted/40"
                            }`}
                          >
                            {canSelect && (
                              <TableCell className="w-12 px-4 py-3.5">
                                <Checkbox
                                  checked={selected.has(item.assetId)}
                                  onChange={() => toggleItem(item.assetId)}
                                />
                              </TableCell>
                            )}
                            <TableCell className="px-4 py-3.5">
                              <button
                                type="button"
                                onClick={() =>
                                  void navigate({
                                    to: "/asset/$id",
                                    params: { id: item.assetId },
                                  })
                                }
                                className="cursor-pointer font-mono text-xs font-semibold text-primary hover:underline"
                              >
                                {item.code}
                              </button>
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-sm font-semibold text-foreground">
                              {item.name}
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-xs text-muted-foreground">
                              {item.location}
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-xs text-muted-foreground">
                              {item.condition}
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                              <ItemStatusBadge status={item.status} />
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-xs text-muted-foreground">
                              {formatDateTimeID(item.checkedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {itemsQuery.hasNextPage && (
                      <div className="flex justify-center border-t border-hairline p-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={itemsQuery.isFetchingNextPage}
                          onClick={() => void itemsQuery.fetchNextPage()}
                        >
                          {itemsQuery.isFetchingNextPage
                            ? "Memuat..."
                            : "Muat lebih banyak"}
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>

      {dialog === "start" && (
        <ConfirmDialog
          title="Mulai sesi ini?"
          confirmLabel="Mulai sesi"
          busy={startMutation.isPending}
          onCancel={() => setDialog(null)}
          onConfirm={() =>
            startMutation.mutate(id, { onSuccess: () => setDialog(null) })
          }
        >
          Daftar aset di lokasi yang dipilih akan dibekukan sebagai acuan
          pemeriksaan stok opname. Aset yang dipindah, dihapus, atau ditambah
          setelah ini tidak akan mengubah daftar sesi ini.
        </ConfirmDialog>
      )}

      {dialog === "close" && (
        <ConfirmDialog
          title={
            pending > 0 ? "Tutup sesi dengan aset tersisa?" : "Tutup sesi?"
          }
          confirmLabel={pending > 0 ? "Tutup paksa" : "Tutup sesi"}
          destructive={pending > 0}
          busy={closeMutation.isPending}
          onCancel={() => setDialog(null)}
          onConfirm={() =>
            closeMutation.mutate(
              { id, force: pending > 0 },
              { onSuccess: () => setDialog(null) }
            )
          }
        >
          {pending > 0 ? (
            <>
              <b>{pending} aset</b> belum diperiksa dan akan ditandai
              &ldquo;Tidak diperiksa&rdquo;. Setelah ditutup, hasil sesi
              terkunci dan tidak dapat diubah.
            </>
          ) : (
            <>
              Semua aset sudah diperiksa. Setelah ditutup, hasil sesi terkunci
              dan tidak dapat diubah.
            </>
          )}
        </ConfirmDialog>
      )}

      {dialog === "check" && (
        <SessionCheckDialog
          sessionId={id}
          assetIds={[...selected]}
          onClose={handleCheckClosed}
        />
      )}
    </div>
  )
}

function Metric({
  label,
  value = 0,
  tone = "text-foreground",
}: {
  label: string
  value?: number
  tone?: string
}) {
  return (
    <Card className="rounded-2xl border border-hairline bg-card p-4 shadow-2xs">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold tracking-tight ${tone}`}>
        {value}
      </div>
    </Card>
  )
}

function ConfirmDialog({
  title,
  children,
  confirmLabel,
  destructive = false,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  destructive?: boolean
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onCancel()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {children}
        </p>
        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "primary"}
            size="sm"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
