import { LayoutGrid, Table2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { assetService } from "@/services/assetServices"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

type ArchivedAsset = {
  id: string
  code: string
  name: string
  reason: string
  deletedAt: string
  deletedBy: string
  hasMovementHistory?: boolean
}

export function AssetArchiveView() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ArchivedAsset | null>(null)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [viewMode, setViewMode] = useState<"auto" | "table" | "card">("auto")
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  )

  // Fetch data arsip dari backend Go menggunakan useQuery
  const {
    data: fetchedAssets = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["archived-assets"],
    queryFn: async () => {
      const data = await assetService.getArchivedAssets()
      const formattedAssets: ArchivedAsset[] = (data || []).map((raw) => {
        const item = raw as Record<string, unknown>
        const attr = (item.attributes || item) as Record<string, unknown>

        const deletedAtVal = (attr.deletedAt || attr.deleted_at) as
          string | undefined

        return {
          id: String(item.id || attr.id || ""),
          code: String(attr.code || attr.asset_code || item.code || "-"),
          name: String(attr.name || item.name || "-"),
          reason: String(
            attr.deleteReason ||
              attr.delete_reason ||
              attr.reason ||
              "Dihapus dari inventaris"
          ),
          deletedAt: deletedAtVal
            ? new Date(deletedAtVal).toLocaleDateString("id-ID")
            : "-",
          deletedBy: String(attr.deletedBy || attr.deleted_by || "Admin"),
          hasMovementHistory: Boolean(attr.has_movement_history),
        }
      })
      return formattedAssets
    },
  })

  // State ID aset yang baru dihapus/dipulihkan oleh aksi user (optimistic filtering)
  const [removedIds, setRemovedIds] = useState<string[]>([])

  // Derivasi pesan error (dari query atau aksi user)
  const queryErrMsg = queryError
    ? (() => {
        const err = queryError as {
          response?: { data?: { error?: string; message?: string } }
        }
        return (
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Gagal memuat data arsip dari server."
        )
      })()
    : ""
  const displayError = errorMessage || queryErrMsg

  const filteredAssets = useMemo(() => {
    const availableAssets = fetchedAssets.filter(
      (asset) => !removedIds.includes(asset.id)
    )
    const keyword = query.toLowerCase()
    return availableAssets.filter((asset) =>
      `${asset.code} ${asset.name} ${asset.reason} ${asset.deletedBy}`
        .toLowerCase()
        .includes(keyword)
    )
  }, [fetchedAssets, removedIds, query])

  // FUNGSI MEMULIHKAN ASET + HIGHLIGHT ASET DI DAFTAR LIST
  const restoreAsset = async (asset: ArchivedAsset) => {
    setRestoringId(asset.id)
    setErrorMessage("")
    try {
      await assetService.restoreAsset(asset.id)

      // 1. Catat aset sebagai terhapus/dipulihkan dari tampilan
      setRemovedIds((current) => [...current, asset.id])

      // 2. Beri notifikasi toast sukses
      toast.success(`Aset ${asset.code} (${asset.name}) berhasil dipulihkan!`)

      // 3. Pindah ke halaman list aset & bawa kode aset untuk di-highlight hijau
      navigate({
        to: "/asset",
        search: {
          highlight: asset.code,
        },
      })
    } catch (error: unknown) {
      console.error("Gagal memulihkan aset:", error)
      const err = error as {
        response?: { data?: { error?: string; message?: string } }
      }
      const rawMsg =
        err?.response?.data?.error || err?.response?.data?.message || ""
      toast.error(rawMsg || "Gagal memulihkan aset dari arsip.")
    } finally {
      setRestoringId(null)
    }
  }

  const openDeleteDialog = (asset: ArchivedAsset) => {
    setDeleteTarget(asset)
    setConfirmationCode("")
    setDeleteReason("Penghapusan permanen dari arsip")
  }

  const closeDeleteDialog = () => {
    setDeleteTarget(null)
    setConfirmationCode("")
    setDeleteReason("")
  }

  const deletePermanently = async () => {
    if (!deleteTarget || confirmationCode !== deleteTarget.code) return

    setIsDeleting(true)
    setErrorMessage("")
    try {
      await assetService.permanentDeleteAsset(deleteTarget.id, {
        asset_code: confirmationCode,
        reason: deleteReason,
      })

      setRemovedIds((current) => [...current, deleteTarget.id])

      toast.success(`Aset ${deleteTarget.code} berhasil dihapus permanen.`)
      closeDeleteDialog()
    } catch (error: unknown) {
      console.error("Gagal hapus permanen:", error)
      const err = error as {
        response?: { data?: { error?: string; message?: string } }
      }
      const rawMsg =
        err?.response?.data?.error || err?.response?.data?.message || ""

      let userMsg = "Gagal menghapus aset secara permanen."
      if (rawMsg.includes("mismatch") || rawMsg.includes("asset_code")) {
        userMsg = "Kode aset yang dimasukkan tidak cocok!"
      } else if (rawMsg) {
        userMsg = rawMsg
      }

      toast.error(userMsg)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const syncViewport = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener("change", syncViewport)
    return () => mediaQuery.removeEventListener("change", syncViewport)
  }, [])

  const tableIsActive =
    viewMode === "table" || (viewMode === "auto" && !isMobile)
  const cardIsActive = viewMode === "card" || (viewMode === "auto" && isMobile)

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 sm:pr-6 lg:px-6">
        <label className="flex h-10 w-full max-w-75 min-w-0 items-center gap-2.25 rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-3.25">
          <span className="text-[13px] text-[#a5a8b5]">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari di arsip..."
            aria-label="Cari di arsip"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#a5a8b5]"
          />
        </label>
        <span className="ml-auto hidden rounded-full bg-[#1c1c1e] px-3.25 py-1.5 text-[12px] font-semibold text-white sm:block">
          Halaman khusus Admin
        </span>
      </header>

      <main className="flex flex-col gap-4.5 px-4 py-6 sm:px-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3.5">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-.6px]">
              Arsip aset
            </h1>
            <p className="mt-1.25 text-[13px] text-muted-foreground">
              Aset yang dihapus tidak hilang -{" "}
              <span className="font-mono text-[12px]">deleted_at</span> terisi
              dan record tetap tersimpan (FR-X01).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full sm:ml-auto"
            onClick={() => toast.info("Fitur ekspor arsip akan datang.")}
          >
            Export arsip
          </Button>
        </section>

        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <Card className="p-12 text-center text-[13px] text-muted-foreground">
            Memuat data arsip...
          </Card>
        ) : (
          <ArchiveTable
            assets={filteredAssets}
            restoringId={restoringId}
            onRestore={restoreAsset}
            onDelete={openDeleteDialog}
            tableIsActive={tableIsActive}
            cardIsActive={cardIsActive}
            onSelectTable={() => setViewMode("table")}
            onSelectCard={() => setViewMode("card")}
          />
        )}
      </main>

      {deleteTarget && (
        <PermanentDeleteDialog
          asset={deleteTarget}
          confirmationCode={confirmationCode}
          isDeleting={isDeleting}
          onChange={setConfirmationCode}
          onCancel={closeDeleteDialog}
          onConfirm={deletePermanently}
        />
      )}
    </div>
  )
}

function ArchiveTable({
  assets,
  restoringId,
  onRestore,
  onDelete,
  tableIsActive,
  cardIsActive,
  onSelectTable,
  onSelectCard,
}: {
  assets: ArchivedAsset[]
  restoringId: string | null
  onRestore: (asset: ArchivedAsset) => void
  onDelete: (asset: ArchivedAsset) => void
  tableIsActive: boolean
  cardIsActive: boolean
  onSelectTable: () => void
  onSelectCard: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <ViewToggle
        tableIsActive={tableIsActive}
        cardIsActive={cardIsActive}
        onSelectTable={onSelectTable}
        onSelectCard={onSelectCard}
      />
      <Card className="overflow-hidden">
        {tableIsActive && (
          <>
            <div className="hidden min-w-255 grid-cols-[140px_250px_minmax(230px,1fr)_150px_170px_230px] gap-3.5 border-b border-hairline bg-muted/50 px-5 py-3.25 text-[10.5px] font-semibold tracking-[.4px] text-muted-foreground uppercase md:grid">
              <span>Kode</span>
              <span>Nama barang</span>
              <span>Alasan penghapusan</span>
              <span>Dihapus</span>
              <span>Oleh</span>
              <span className="text-center">Aksi</span>
            </div>
            <div className="hidden overflow-x-auto md:block">
              {assets.map((asset) => (
                <ArchiveRow
                  key={asset.id}
                  asset={asset}
                  isRestoring={restoringId === asset.id}
                  onRestore={onRestore}
                  onDelete={onDelete}
                />
              ))}
            </div>
            <div className="space-y-3 p-3 md:hidden">
              {assets.map((asset) => (
                <ArchiveCompactRow
                  key={asset.id}
                  asset={asset}
                  isRestoring={restoringId === asset.id}
                  onRestore={onRestore}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </>
        )}
        {cardIsActive && (
          <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) => (
              <ArchiveCard
                key={asset.id}
                asset={asset}
                isRestoring={restoringId === asset.id}
                onRestore={onRestore}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        {assets.length === 0 && (
          <p className="p-6 text-center text-[13px] text-muted-foreground">
            Tidak ada aset di arsip.
          </p>
        )}
      </Card>
    </div>
  )
}

function ViewToggle({
  tableIsActive,
  cardIsActive,
  onSelectTable,
  onSelectCard,
}: {
  tableIsActive: boolean
  cardIsActive: boolean
  onSelectTable: () => void
  onSelectCard: () => void
}) {
  return (
    <div className="inline-flex h-10 w-fit rounded-full border border-hairline bg-white p-1">
      <Button
        type="button"
        variant={tableIsActive ? "primary" : "ghost"}
        size="icon"
        onClick={onSelectTable}
        aria-label="Tampilan tabel"
        aria-pressed={tableIsActive}
        className="size-8 rounded-full"
      >
        <Table2 size={16} strokeWidth={2} aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant={cardIsActive ? "primary" : "ghost"}
        size="icon"
        onClick={onSelectCard}
        aria-label="Tampilan kartu"
        aria-pressed={cardIsActive}
        className="size-8 rounded-full"
      >
        <LayoutGrid size={16} strokeWidth={2} aria-hidden="true" />
      </Button>
    </div>
  )
}

function ArchiveCompactRow({
  asset,
  isRestoring,
  onRestore,
  onDelete,
}: {
  asset: ArchivedAsset
  isRestoring: boolean
  onRestore: (asset: ArchivedAsset) => void
  onDelete: (asset: ArchivedAsset) => void
}) {
  return (
    <article className="flex flex-col gap-3 border-b border-hairline px-1 py-2 last:border-0">
      <div>
        <span className="font-mono text-[11px] text-primary">{asset.code}</span>
        <h2 className="mt-1 text-[14px] font-semibold">{asset.name}</h2>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          {asset.reason}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-[10.5px] text-muted-foreground">
          {asset.deletedAt} - {asset.deletedBy}
        </span>
        <ArchiveActions
          asset={asset}
          isRestoring={isRestoring}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      </div>
    </article>
  )
}

function ArchiveRow({
  asset,
  isRestoring,
  onRestore,
  onDelete,
}: {
  asset: ArchivedAsset
  isRestoring: boolean
  onRestore: (asset: ArchivedAsset) => void
  onDelete: (asset: ArchivedAsset) => void
}) {
  return (
    <div className="grid min-w-255 grid-cols-[140px_250px_minmax(230px,1fr)_150px_170px_230px] items-center gap-3.5 border-b border-hairline px-5 py-3.5 last:border-0">
      <span className="font-mono text-[12.5px] font-medium text-primary">
        {asset.code}
      </span>
      <span className="text-[13.5px] font-semibold text-foreground">
        {asset.name}
      </span>
      <span className="text-[12.5px] text-muted-foreground">
        {asset.reason}
      </span>
      <span className="text-[12.5px] text-muted-foreground">
        {asset.deletedAt}
      </span>
      <span className="text-[12.5px] text-muted-foreground">
        {asset.deletedBy}
      </span>
      <ArchiveActions
        asset={asset}
        isRestoring={isRestoring}
        onRestore={onRestore}
        onDelete={onDelete}
        compact
      />
    </div>
  )
}

function ArchiveCard({
  asset,
  isRestoring,
  onRestore,
  onDelete,
}: {
  asset: ArchivedAsset
  isRestoring: boolean
  onRestore: (asset: ArchivedAsset) => void
  onDelete: (asset: ArchivedAsset) => void
}) {
  return (
    <Card className="p-4">
      <span className="font-mono text-[11px] font-medium text-primary">
        {asset.code}
      </span>
      <h2 className="mt-1 text-[15px] font-semibold text-foreground">
        {asset.name}
      </h2>
      <p className="mt-2 text-[12px] text-muted-foreground">{asset.reason}</p>
      <p className="mt-3 text-[11px] text-muted-foreground">
        {asset.deletedAt} - {asset.deletedBy}
      </p>
      <ArchiveActions
        asset={asset}
        isRestoring={isRestoring}
        onRestore={onRestore}
        onDelete={onDelete}
        mobile
      />
    </Card>
  )
}

function ArchiveActions({
  asset,
  isRestoring,
  onRestore,
  onDelete,
  mobile = false,
  compact = false,
}: {
  asset: ArchivedAsset
  isRestoring: boolean
  onRestore: (asset: ArchivedAsset) => void
  onDelete: (asset: ArchivedAsset) => void
  mobile?: boolean
  compact?: boolean
}) {
  return (
    <div
      className={`flex min-h-8 items-center gap-1.75 ${mobile ? "mt-4 flex-wrap" : compact ? "" : "justify-end"}`}
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isRestoring}
        onClick={() => onRestore(asset)}
        className="h-8 rounded-full text-xs"
      >
        {isRestoring ? "Memulihkan..." : "Pulihkan"}
      </Button>

      {asset.hasMovementHistory ? (
        <span className="text-[11.5px] text-muted-foreground">
          Ada riwayat mutasi
        </span>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isRestoring}
          onClick={() => onDelete(asset)}
          className="h-8 rounded-full bg-[#ffc6c6] text-xs text-[#600000] hover:bg-[#ffb0b0]"
        >
          Hapus permanen
        </Button>
      )}
    </div>
  )
}

function PermanentDeleteDialog({
  asset,
  confirmationCode,
  isDeleting,
  onChange,
  onCancel,
  onConfirm,
}: {
  asset: ArchivedAsset
  confirmationCode: string
  isDeleting: boolean
  onChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const canDelete = confirmationCode === asset.code && !isDeleting

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2">
            <Badge variant="destructive">Tidak dapat dibatalkan</Badge>
          </div>
          <DialogTitle>Hapus permanen aset ini?</DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Record{" "}
          <span className="font-mono text-xs font-semibold text-foreground">
            {asset.code} - {asset.name}
          </span>{" "}
          beserta fotonya akan dihapus dari basis data. Audit log tetap
          menyimpan jejak penghapusan.
        </p>

        <div className="space-y-1.5 pt-2">
          <Label htmlFor="delete-confirm-code">
            Ketik ulang kode aset untuk konfirmasi
          </Label>
          <Input
            id="delete-confirm-code"
            value={confirmationCode}
            disabled={isDeleting}
            onChange={(e) => onChange(e.target.value)}
            placeholder={asset.code}
            className="font-mono"
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canDelete}
            onClick={onConfirm}
          >
            {isDeleting ? "Menghapus..." : "Hapus permanen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
