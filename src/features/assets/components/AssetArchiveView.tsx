import { LayoutGrid, Table2 } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"

type ArchivedAsset = {
  code: string
  name: string
  reason: string
  deletedAt: string
  deletedBy: string
  hasMovementHistory?: boolean
}

const initialArchivedAssets: ArchivedAsset[] = [
  {
    code: "047/INC-GA/1/26",
    name: 'Macbook Pro M1 13"',
    reason: "Duplikat baris 41-51 hasil migrasi Excel",
    deletedAt: "05/08/2026",
    deletedBy: "Rizky Saputra",
  },
  {
    code: "048/INC-GA/1/26",
    name: "MSI GF65 Thin 10UE",
    reason: "Duplikat baris 41-51 hasil migrasi Excel",
    deletedAt: "05/08/2026",
    deletedBy: "Rizky Saputra",
  },
  {
    code: "012/INC-GA/1/26",
    name: "Printer Epson L3110",
    reason: "Aset dilelang, sudah keluar dari inventaris",
    deletedAt: "28/07/2026",
    deletedBy: "Rizky Saputra",
    hasMovementHistory: true,
  },
]

export function AssetArchiveView() {
  const [query, setQuery] = useState("")
  const [assets, setAssets] = useState(initialArchivedAssets)
  const [deleteTarget, setDeleteTarget] = useState<ArchivedAsset | null>(null)
  const [confirmationCode, setConfirmationCode] = useState("")
  const [notice, setNotice] = useState("")
  const [viewMode, setViewMode] = useState<"auto" | "table" | "card">("auto")
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  )

  const filteredAssets = useMemo(() => {
    const keyword = query.toLowerCase()
    return assets.filter((asset) =>
      `${asset.code} ${asset.name} ${asset.reason} ${asset.deletedBy}`
        .toLowerCase()
        .includes(keyword)
    )
  }, [assets, query])

  const restoreAsset = (asset: ArchivedAsset) => {
    setAssets((current) => current.filter((item) => item.code !== asset.code))
    setNotice(`${asset.code} dipulihkan ke daftar aset (simulasi).`)
  }

  const openDeleteDialog = (asset: ArchivedAsset) => {
    setDeleteTarget(asset)
    setConfirmationCode("")
  }

  const closeDeleteDialog = () => {
    setDeleteTarget(null)
    setConfirmationCode("")
  }

  const deletePermanently = () => {
    if (!deleteTarget || confirmationCode !== deleteTarget.code) return
    setAssets((current) =>
      current.filter((asset) => asset.code !== deleteTarget.code)
    )
    setNotice(`${deleteTarget.code} dihapus permanen (simulasi).`)
    closeDeleteDialog()
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
        <label className="flex h-10 w-full max-w-[300px] min-w-0 items-center gap-[9px] rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-[13px]">
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
            onClick={() => setNotice("Arsip diekspor (simulasi).")}
          >
            Export arsip
          </ActionButton>
        </section>

        {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}

        <ArchiveTable
          assets={filteredAssets}
          onRestore={restoreAsset}
          onDelete={openDeleteDialog}
          tableIsActive={tableIsActive}
          cardIsActive={cardIsActive}
          onSelectTable={() => setViewMode("table")}
          onSelectCard={() => setViewMode("card")}
        />
      </main>

      {deleteTarget && (
        <PermanentDeleteDialog
          asset={deleteTarget}
          confirmationCode={confirmationCode}
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
  onRestore,
  onDelete,
  tableIsActive,
  cardIsActive,
  onSelectTable,
  onSelectCard,
}: {
  assets: ArchivedAsset[]
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
                  key={asset.code}
                  asset={asset}
                  onRestore={onRestore}
                  onDelete={onDelete}
                />
              ))}
            </div>
            <div className="space-y-3 p-3 md:hidden">
              {assets.map((asset) => (
                <ArchiveCompactRow
                  key={asset.code}
                  asset={asset}
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
                key={asset.code}
                asset={asset}
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
  onRestore,
  onDelete,
}: {
  asset: ArchivedAsset
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
          onRestore={onRestore}
          onDelete={onDelete}
        />
      </div>
    </article>
  )
}

function ArchiveRow({
  asset,
  onRestore,
  onDelete,
}: {
  asset: ArchivedAsset
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
        onRestore={onRestore}
        onDelete={onDelete}
        compact
      />
    </div>
  )
}

function ArchiveCard({
  asset,
  onRestore,
  onDelete,
}: {
  asset: ArchivedAsset
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
        onRestore={onRestore}
        onDelete={onDelete}
        mobile
      />
    </article>
  )
}

function ArchiveActions({
  asset,
  onRestore,
  onDelete,
  mobile = false,
  compact = false,
}: {
  asset: ArchivedAsset
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
        onClick={() => onRestore(asset)}
        className="h-8 shrink-0 rounded-full border border-[#c7cad5] bg-white px-[11px] text-[11.5px] font-semibold whitespace-nowrap sm:px-[13px] sm:text-[12.5px]"
      >
        Pulihkan
      </button>
      {asset.hasMovementHistory ? (
        <span className="text-[11.5px] text-[#8e91a0]">Ada riwayat mutasi</span>
      ) : (
        <button
          type="button"
          onClick={() => onDelete(asset)}
          className="h-8 shrink-0 rounded-full bg-[#ffc6c6] px-[11px] text-[11.5px] font-semibold whitespace-nowrap text-[#600000] sm:px-[13px] sm:text-[12.5px]"
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
  onChange,
  onCancel,
  onConfirm,
}: {
  asset: ArchivedAsset
  confirmationCode: string
  onChange: (value: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const canDelete = confirmationCode === asset.code

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
            onChange={(event) => onChange(event.target.value)}
            className="h-11 rounded-lg border-2 border-[#4262ff] px-[14px] font-mono text-[14px] outline-none"
          />
        </label>
        <div className="flex justify-end gap-[10px] pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full border border-[#c7cad5] px-5 text-[14px] font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={onConfirm}
            className="h-11 rounded-full bg-[#1c1c1e] px-[22px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Hapus permanen
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
      className={`h-10 rounded-full border border-[#c7cad5] bg-white px-4 text-[13.5px] font-semibold ${className}`}
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
      className="rounded-lg bg-[#c3faf5] px-4 py-3 text-left text-[13px] text-[#187574]"
    >
      {children} ×
    </button>
  )
}
