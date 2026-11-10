import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import { assetService } from "@/services/assetServices"
import { parseApiError } from "@/services/stocktake"
import {
  useCreateSession,
  useSessions,
  useStocktakePermission,
} from "@/hooks/useStocktake"
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
import { InputField } from "@/components/ui/InputField"
import { Label } from "@/components/ui/label"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state"
import { ProfileDropdown } from "@/components/ui/ProfileDropdown"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ProgressBar,
  SessionStatusBadge,
  formatPeriod,
  toISODate,
} from "./stockTakeUi"

export function StocktakeListView() {
  const navigate = useNavigate()
  const { canManage } = useStocktakePermission()
  const { data: rawSessions, isLoading, error, refetch } = useSessions()
  const sessions = useMemo(
    () => (Array.isArray(rawSessions) ? rawSessions : []),
    [rawSessions]
  )
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 text-neutral-900">
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 pl-14 text-xs text-neutral-500 lg:pl-0">
          <span className="font-semibold text-neutral-900">Stok Opname</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ProfileDropdown />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Stok Opname
            </h1>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
              {sessions.length} sesi &middot; bukti pemeriksaan aset per lokasi
              dan periode
            </p>
          </div>
          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1.5 self-start sm:self-auto"
            >
              <Plus size={16} />
              <span>Buat Sesi</span>
            </Button>
          )}
        </div>

        {isLoading && <LoadingState message="Memuat daftar sesi..." />}

        {!isLoading && error && (
          <ErrorState
            message={parseApiError(
              error,
              "Daftar sesi gagal dimuat. Periksa koneksi lalu coba lagi."
            )}
            onRetry={() => void refetch()}
          />
        )}

        {!isLoading && !error && sessions.length === 0 && (
          <EmptyState
            title="Belum ada sesi stok opname"
            description={
              canManage
                ? "Buat sesi baru untuk mulai memeriksa aset di satu atau beberapa lokasi."
                : "Sesi akan muncul di sini setelah dibuat oleh admin."
            }
          />
        )}

        {!isLoading && !error && sessions.length > 0 && (
          <Card className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-hairline bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Nama Sesi
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Periode
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Progres Pemeriksaan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => {
                  const total = session.totalItems ?? 0
                  const done = session.doneItems ?? 0
                  const percent = total > 0 ? (done / total) * 100 : 0

                  return (
                    <TableRow
                      key={session.id}
                      onClick={() =>
                        void navigate({
                          to: "/stocktake/$id",
                          params: { id: session.id },
                        })
                      }
                      className="cursor-pointer border-b border-hairline transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="px-6 py-4 font-semibold text-foreground">
                        {session.name}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <SessionStatusBadge status={session.status} />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs text-muted-foreground">
                        {formatPeriod(session.periodStart, session.periodEnd)}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {total > 0 ? (
                          <div className="min-w-36 space-y-1.5">
                            <span className="block text-xs text-muted-foreground">
                              {done} / {total} aset diperiksa (
                              {Math.round(percent)}%)
                            </span>
                            <ProgressBar percent={percent} />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {session.status === "draft"
                              ? "Belum dimulai"
                              : "Tidak ada aset"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {createOpen && (
        <CreateSessionDialog onClose={() => setCreateOpen(false)} />
      )}
    </div>
  )
}

function CreateSessionDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const createMutation = useCreateSession()

  const { data: locationData } = useQuery({
    queryKey: ["masters", "locations"],
    queryFn: () => assetService.masters("locations"),
  })
  const locations = useMemo(
    () => (locationData ?? []) as { id: number; name: string }[],
    [locationData]
  )

  const [name, setName] = useState("")
  const [selected, setSelected] = useState<Set<number>>(() => new Set())
  const [periodStart, setPeriodStart] = useState(() => {
    const now = new Date()
    return toISODate(new Date(now.getFullYear(), now.getMonth(), 1))
  })
  const [periodEnd, setPeriodEnd] = useState(() => {
    const now = new Date()
    return toISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  })

  const periodInvalid = Boolean(
    periodStart && periodEnd && periodEnd < periodStart
  )
  const allSelected = locations.length > 0 && selected.size === locations.length
  const canSubmit =
    name.trim().length > 0 &&
    selected.size > 0 &&
    Boolean(periodStart) &&
    Boolean(periodEnd) &&
    !periodInvalid &&
    !createMutation.isPending

  const toggleLocation = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = async () => {
    if (!canSubmit) return
    try {
      const session = await createMutation.mutateAsync({
        name: name.trim(),
        locationIds: [...selected],
        periodStart,
        periodEnd,
      })
      toast.success("Sesi dibuat. Mulai sesi untuk membekukan daftar aset.")
      onClose()
      void navigate({ to: "/stocktake/$id", params: { id: session.id } })
    } catch {
      // pesan error ditangani hook
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !createMutation.isPending) onClose()
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat sesi stok opname</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <InputField
            label="Nama sesi"
            labelClassName="text-sm font-semibold text-[#1c1c1e]"
            autoFocus
            value={name}
            disabled={createMutation.isPending}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Opname Lantai 3 Oktober 2026"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputField
              label="Periode mulai"
              labelClassName="text-sm font-semibold text-[#1c1c1e]"
              type="date"
              value={periodStart}
              disabled={createMutation.isPending}
              onChange={(event) => setPeriodStart(event.target.value)}
            />
            <InputField
              label="Periode selesai"
              labelClassName="text-sm font-semibold text-[#1c1c1e]"
              type="date"
              value={periodEnd}
              min={periodStart || undefined}
              disabled={createMutation.isPending}
              onChange={(event) => setPeriodEnd(event.target.value)}
              errorText={
                periodInvalid
                  ? "Periode selesai tidak boleh sebelum periode mulai."
                  : undefined
              }
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Lokasi yang diperiksa</Label>
              <button
                type="button"
                onClick={() =>
                  setSelected(
                    allSelected
                      ? new Set()
                      : new Set(locations.map((l) => l.id))
                  )
                }
                disabled={locations.length === 0}
                className="cursor-pointer text-xs font-semibold text-primary hover:underline disabled:cursor-default disabled:text-muted-foreground"
              >
                {allSelected ? "Kosongkan" : "Pilih semua"}
              </button>
            </div>
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-hairline bg-muted/20 p-2">
              {locations.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Memuat lokasi...
                </p>
              )}
              {locations.map((location) => (
                <label
                  key={location.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.has(location.id)}
                    disabled={createMutation.isPending}
                    onChange={() => toggleLocation(location.id)}
                  />
                  <span className="truncate">{location.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {selected.size} lokasi dipilih. Pastikan memilih lokasi yang
              memiliki aset terdaftar (misal: Redaksi Lantai 3, Gudang, Studio
              Lantai 2).
            </p>
          </div>
        </div>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={createMutation.isPending}
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canSubmit}
            onClick={() => void submit()}
          >
            {createMutation.isPending ? "Membuat..." : "Buat sesi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
