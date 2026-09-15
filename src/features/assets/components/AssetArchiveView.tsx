import { LayoutGrid, Table2 } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { assetService } from "@/services/assetServices"
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
  const [query, setQuery] = useState("")
  const [assets, setAssets] = useState<ArchivedAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<ArchivedAsset | null>(null)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [notice, setNotice] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [viewMode, setViewMode] = useState<"auto" | "table" | "card">("auto")
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  )

  // 1. Fetch data arsip dari backend Go
  const fetchArchivedAssets = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      const data = await assetService.getArchivedAssets()

      const formattedAssets: ArchivedAsset[] = (data || []).map((item: any) => {
        // Ambil objek attributes jika backend dibungkus format JSON API
        const attr = item.attributes || item

        return {
          id: item.id || attr.id,
          // Ambil kode aset dari attr.code / attr.asset_code
          code: attr.code || attr.asset_code || item.code || "-",
          name: attr.name || item.name || "-",
          // Ambil alasan penghapusan dari attr
          reason:
            attr.deleteReason ||
            attr.delete_reason ||
            attr.reason ||
            "Dihapus dari inventaris",
          deletedAt: attr.deletedAt || attr.deleted_at
            ? new Date(attr.deletedAt || attr.deleted_at).toLocaleDateString("id-ID")
            : "-",
          deletedBy: attr.deletedBy || attr.deleted_by || "Admin",
          hasMovementHistory: attr.has_movement_history || false,
        }
      })

      setAssets(formattedAssets)
    } catch (error: any) {
      console.error("Gagal mengambil arsip aset:", error)
      const rawMsg = error?.response?.data?.error || error?.response?.data?.message || ""
      setErrorMessage(rawMsg || "Gagal memuat data arsip dari server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArchivedAssets()
  }, [])

  const filteredAssets = useMemo(() => {
    const keyword = query.toLowerCase()
    return assets.filter((asset) =>
      `${asset.code} ${asset.name} ${asset.reason} ${asset.deletedBy}`
        .toLowerCase()
        .includes(keyword)
    )
  }, [assets, query])

  const restoreAsset = async (asset: ArchivedAsset) => {
    setRestoringId(asset.id)
    setErrorMessage("")
    try {
      await assetService.restoreAsset(asset.id)

      // Filter aset yang berhasil dipulihkan dari state
      setAssets((current) => current.filter((item) => item.id !== asset.id))
      toast.success(`Aset ${asset.code} (${asset.name}) berhasil dipulihkan ke daftar aktif!`)
    } catch (error: any) {
      console.error("Gagal memulihkan aset:", error)
      const rawMsg = error?.response?.data?.error || error?.response?.data?.message || ""
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

      setAssets((current) =>
        current.filter((asset) => asset.id !== deleteTarget.id)
      )
      setNotice(`Aset ${deleteTarget.code} berhasil dihapus permanen.`)
      closeDeleteDialog()
    } catch (error: any) {
      console.error("Gagal hapus permanen:", error)
      const rawMsg = error?.response?.data?.error || error?.response?.data?.message || ""

      let userMsg = "Gagal menghapus aset secara permanen."
      if (rawMsg.includes("mismatch") || rawMsg.includes("asset_code")) {
        userMsg = "Kode aset yang dimasukkan tidak cocok!"
      } else if (rawMsg) {
        userMsg = rawMsg
      }

      alert(userMsg)
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
        <label className="flex h-10 w-full max-w-75 min-w-0 items-center gap-[9px] rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-[13px]">
          <span className="text-[13px] text-[#a5a8b5]">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari di arsip..."
            aria-label="Cari di arsip"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#a5a8b5]"
          />
        </label>
        <span className="ml-auto hidden rounded-full bg-[#1c1c1e] px-[13px] py-[6px] text-[12px] font-semibold text-white sm:block">
          Halaman khusus Admin
        </span>
      </header>

      <main className="flex flex-col gap-[18px] px-4 py-6 sm:px-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-[14px]">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-.6px]">
              Arsip aset
            </h1>
            <p className="mt-[5px] text-[13px] text-[#6b6f7e]">
              Aset yang dihapus tidak hilang -{" "}
              <span className="font-mono text-[12px]">deleted_at</span> terisi
              dan record tetap tersimpan (FR-X01).
            </p>
          </div>
          <ActionButton
            className="sm:ml-auto"
            onClick={() => setNotice("Fitur ekspor arsip akan datang.")}
          >
            Export arsip
          </ActionButton>
        </section>

        {errorMessage && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-[13px] text-rose-700">
            {errorMessage}
          </div>
        )}

        {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}

        {loading ? (
          <div className="rounded-2xl border border-[#eef0f3] bg-white p-12 text-center text-[13px] text-[#6b6f7e]">
            Memuat data arsip...
          </div>
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
      <section className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
        {tableIsActive && (
          <>
            <div className="hidden min-w-[1020px] grid-cols-[140px_250px_minmax(230px,1fr)_150px_170px_230px] gap-[14px] border-b border-[#e0e2e8] bg-[#f7f8fa] px-5 py-[13px] text-[10.5px] font-semibold tracking-[.4px] text-[#6b6f7e] uppercase md:grid">
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
          <p className="p-6 text-center text-[13px] text-[#6b6f7e]">
            Tidak ada aset di arsip.
          </p>
        )}
      </section>
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
    <div className="inline-flex h-10 w-fit rounded-full border border-[#c7cad5] bg-white p-1">
      <button
        type="button"
        onClick={onSelectTable}
        aria-label="Tampilan tabel"
        aria-pressed={tableIsActive}
        className={`grid size-8 place-items-center rounded-full ${tableIsActive ? "bg-[#1c1c1e] text-white" : "text-[#6b6f7e]"}`}
      >
        <Table2 size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onSelectCard}
        aria-label="Tampilan kartu"
        aria-pressed={cardIsActive}
        className={`grid size-8 place-items-center rounded-full ${cardIsActive ? "bg-[#1c1c1e] text-white" : "text-[#6b6f7e]"}`}
      >
        <LayoutGrid size={16} strokeWidth={2} aria-hidden="true" />
      </button>
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
    <article className="flex flex-col gap-3 border-b border-[#eef0f3] px-1 py-2 last:border-0">
      <div>
        <span className="font-mono text-[11px] text-[#4262ff]">
          {asset.code}
        </span>
        <h2 className="mt-1 text-[14px] font-semibold">{asset.name}</h2>
        <p className="mt-1 text-[11.5px] text-[#555a6a]">{asset.reason}</p>
      </div>
      <div className="flex flex-col items-start gap-2">
        <span className="text-[10.5px] text-[#8e91a0]">
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
    <div className="grid min-w-[1020px] grid-cols-[140px_250px_minmax(230px,1fr)_150px_170px_230px] items-center gap-[14px] border-b border-[#eef0f3] px-5 py-[14px] last:border-0">
      <span className="font-mono text-[12.5px] text-[#4262ff]">
        {asset.code}
      </span>
      <span className="text-[13.5px] font-semibold">{asset.name}</span>
      <span className="text-[12.5px] text-[#555a6a]">{asset.reason}</span>
      <span className="text-[12.5px] text-[#555a6a]">{asset.deletedAt}</span>
      <span className="text-[12.5px] text-[#555a6a]">{asset.deletedBy}</span>
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
    <article className="rounded-xl border border-[#eef0f3] p-4">
      <span className="font-mono text-[11px] text-[#4262ff]">{asset.code}</span>
      <h2 className="mt-1 text-[15px] font-semibold">{asset.name}</h2>
      <p className="mt-2 text-[12px] text-[#555a6a]">{asset.reason}</p>
      <p className="mt-3 text-[11px] text-[#8e91a0]">
        {asset.deletedAt} - {asset.deletedBy}
      </p>
      <ArchiveActions
        asset={asset}
        isRestoring={isRestoring}
        onRestore={onRestore}
        onDelete={onDelete}
        mobile
      />
    </article>
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
      className={`flex min-h-8 items-center gap-[7px] ${mobile ? "mt-4 flex-wrap" : compact ? "" : "justify-end"}`}
    >
      <button
        type="button"
        disabled={isRestoring}
        onClick={() => onRestore(asset)}
        className="h-8 shrink-0 rounded-full border border-[#c7cad5] bg-white px-[11px] text-[11.5px] font-semibold whitespace-nowrap sm:px-[13px] sm:text-[12.5px] cursor-pointer hover:bg-neutral-100 disabled:opacity-50"
      >
        {isRestoring ? "Memulihkan..." : "Pulihkan"}
      </button>

      {asset.hasMovementHistory ? (
        <span className="text-[11.5px] text-[#8e91a0]">Ada riwayat mutasi</span>
      ) : (
        <button
          type="button"
          disabled={isRestoring}
          onClick={() => onDelete(asset)}
          className="h-8 shrink-0 rounded-full bg-[#ffc6c6] px-[11px] text-[11.5px] font-semibold whitespace-nowrap text-[#600000] sm:px-[13px] sm:text-[12.5px] cursor-pointer hover:bg-[#ffb0b0] disabled:opacity-50"
        >
          Hapus permanen
        </button>
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
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#050038]/42 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        className="flex w-full max-w-[468px] flex-col gap-[15px] rounded-[20px] bg-white p-5 shadow-[0_16px_48px_-8px_rgba(5,0,56,.12)] sm:p-[26px]"
      >
        <span className="w-fit rounded-full bg-[#ffc6c6] px-3 py-[5px] text-[12px] font-semibold text-[#600000]">
          Tidak dapat dibatalkan
        </span>
        <h2
          id="delete-title"
          className="text-[22px] font-semibold tracking-[-.3px]"
        >
          Hapus permanen aset ini?
        </h2>
        <p className="text-[14px] leading-[1.55] text-[#555a6a]">
          Record{" "}
          <span className="font-mono text-[13px]">
            {asset.code} - {asset.name}
          </span>{" "}
          beserta fotonya akan dihapus dari basis data. Audit log tetap
          menyimpan jejak penghapusan.
        </p>
        <label className="flex flex-col gap-[7px] text-[13px] font-semibold">
          Ketik ulang kode aset untuk konfirmasi
          <input
            value={confirmationCode}
            disabled={isDeleting}
            onChange={(event) => onChange(event.target.value)}
            placeholder={asset.code}
            className="h-11 rounded-lg border-2 border-[#4262ff] px-[14px] font-mono text-[14px] outline-none disabled:opacity-50"
          />
        </label>
        <div className="flex justify-end gap-[10px] pt-1">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="h-11 rounded-full border border-[#c7cad5] px-5 text-[14px] font-semibold hover:bg-neutral-100 disabled:opacity-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={onConfirm}
            className="h-11 rounded-full bg-[#1c1c1e] px-[22px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer hover:bg-black"
          >
            {isDeleting ? "Menghapus..." : "Hapus permanen"}
          </button>
        </div>
      </section>
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-full border border-[#c7cad5] bg-white px-4 text-[13.5px] font-semibold ${className} hover:bg-neutral-50 cursor-pointer`}
    >
      {children}
    </button>
  )
}

function Notice({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-[13px] text-[#187574] cursor-pointer"
    >
      {children} ×
    </button>
  )
}