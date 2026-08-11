import { useRef, useState, type ReactNode } from "react"

type AssetData = Record<
  | "name"
  | "category"
  | "brand"
  | "quantity"
  | "price"
  | "date"
  | "location"
  | "holder"
  | "status"
  | "description",
  string
>

const initialAsset: AssetData = {
  name: "CPU Redaksi Lantai 3",
  category: "Perangkat IT & Server",
  brand: "Belum diisi",
  quantity: "4 Unit",
  price: "Belum diisi",
  date: "01/01/2026",
  location: "Redaksi Lantai 3",
  holder: "Tim Redaksi",
  status: "Diperbaiki",
  description:
    "1 Unit Rusak — dibawa ke vendor servis 04/08/2026. Tiga unit sisanya masih dipakai tim redaksi.",
}

const fields: Array<{ key: keyof AssetData; label: string; mono?: boolean }> = [
  { key: "name", label: "Nama barang" },
  { key: "category", label: "Kategori" },
  { key: "brand", label: "Merek" },
  { key: "quantity", label: "Jumlah" },
  { key: "price", label: "Harga perolehan" },
  { key: "date", label: "Tanggal perolehan" },
  { key: "location", label: "Lokasi" },
  { key: "holder", label: "Pemegang" },
  { key: "status", label: "Status" },
]

export function AssetDetailView() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [asset, setAsset] = useState(initialAsset)
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState("")

  const updateAsset = (key: keyof AssetData, value: string) =>
    setAsset((current) => ({ ...current, [key]: value }))

  const uploadPhotos = (files: FileList | null) => {
    if (!files) return
    const nextPhotos = Array.from(files)
      .slice(0, 5 - photos.length)
      .map((file) => URL.createObjectURL(file))
    if (!nextPhotos.length) return
    setPhotos((current) => [...current, ...nextPhotos])
    setNotice(`${nextPhotos.length} foto ditambahkan untuk sesi ini.`)
  }

  const toggleEditing = () => {
    if (editing) setNotice("Perubahan aset disimpan untuk sesi ini.")
    setEditing((current) => !current)
  }

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 sm:pr-6 sm:pl-16 lg:pl-6">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-[#8e91a0]">
          <button
            type="button"
            onClick={() => setNotice("Kembali ke daftar aset (simulasi). ")}
            className="shrink-0 text-[#6b6f7e]"
          >
            Daftar Aset
          </button>
          <span>/</span>
          <span className="truncate font-mono text-[#1c1c1e]">
            053/INC-GA/1/26
          </span>
        </div>
        <div className="ml-auto flex items-center gap-[10px]">
          <span className="grid size-9 place-items-center rounded-full border border-[#e0e2e8] text-[13px] text-[#555a6a]">
            ?
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[#ffc6c6] text-[11px] font-semibold text-[#600000]">
            RS
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-[18px] px-4 py-6 pb-7 sm:px-7">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex flex-col gap-[9px]">
            <span className="font-mono text-[13px] text-[#4262ff]">
              053/INC-GA/1/26
            </span>
            <h1 className="text-[28px] leading-none font-semibold tracking-[-0.8px] sm:text-[32px]">
              {asset.name}
            </h1>
            <div className="flex flex-wrap gap-[7px]">
              <Badge tone="danger">Rusak Berat</Badge>
              <Badge tone="repair">Diperbaiki</Badge>
              <Badge>{asset.category}</Badge>
              <Badge>{asset.quantity}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-[9px] xl:ml-auto xl:flex-nowrap">
            <ActionButton
              variant="outline"
              onClick={() => setNotice("Mutasi aset siap diproses (simulasi).")}
            >
              Mutasi
            </ActionButton>
            <ActionButton
              variant="outline"
              onClick={() =>
                setNotice("Aset ditandai untuk dihapus (simulasi).")
              }
            >
              Hapus
            </ActionButton>
            <ActionButton variant="dark" onClick={toggleEditing}>
              {editing ? "Simpan perubahan" : "Ubah Aset"}
            </ActionButton>
          </div>
        </section>

        {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}

        <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-[18px]">
            <SectionCard>
              <div className="flex items-baseline gap-[9px]">
                <h2 className="text-[16px] font-semibold">Foto aset</h2>
                <span className="text-[11.5px] text-[#8e91a0]">
                  {photos.length} dari 5 terunggah
                </span>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="ml-auto text-[13px] font-semibold text-[#4262ff]"
                >
                  Unggah foto
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(event) => uploadPhotos(event.target.files)}
                />
              </div>
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
                <PhotoSlot
                  image={photos[0]}
                  main
                  onClick={() => inputRef.current?.click()}
                  label="foto utama · 4:3"
                />
                <div className="flex flex-col gap-3">
                  <PhotoSlot
                    image={photos[1]}
                    onClick={() => inputRef.current?.click()}
                    label="foto 2"
                  />
                  <PhotoSlot
                    image={photos[2]}
                    onClick={() => inputRef.current?.click()}
                    label="foto 3"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <PhotoSlot
                    image={photos[3]}
                    onClick={() => inputRef.current?.click()}
                    label="foto 4"
                  />
                  <PhotoSlot
                    image={photos[4]}
                    onClick={() => inputRef.current?.click()}
                    label="foto 5"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-[16px] font-semibold">Informasi aset</h2>
              <div className="grid gap-x-7 gap-y-4 sm:grid-cols-2">
                <InfoField label="Kode aset" value="053/INC-GA/1/26" mono />
                {fields.map((field) => (
                  <InfoField
                    key={field.key}
                    label={field.label}
                    value={asset[field.key]}
                    muted={asset[field.key] === "Belum diisi"}
                    editing={editing}
                    onChange={(value) => updateAsset(field.key, value)}
                  />
                ))}
                <InfoField
                  label="Keterangan barang"
                  value={asset.description}
                  wide
                  editing={editing}
                  onChange={(value) => updateAsset("description", value)}
                />
              </div>
              <div className="flex flex-col gap-3 rounded-xl bg-[#fff8e0] px-[14px] py-3 sm:flex-row sm:items-center">
                <span className="text-[12.5px] leading-[1.45] text-[#746019]">
                  Kondisi campuran dalam satu record. Sesuai BR-09, pecah
                  menjadi dua record agar 1 unit rusak dan 3 unit bagus tercatat
                  terpisah.
                </span>
                <ActionButton
                  variant="dark"
                  small
                  className="sm:ml-auto"
                  onClick={() =>
                    setNotice(
                      "Record siap dipecah menjadi dua data aset (simulasi)."
                    )
                  }
                >
                  Pecah record
                </ActionButton>
              </div>
            </SectionCard>
          </div>

          <div className="flex flex-col gap-[18px]">
            <CompletenessCard />
            <SectionCard>
              <Heading title="Riwayat mutasi" detail="3 catatan" />
              <div className="mt-4">
                <TimelineItem
                  title="Studio L2 → Redaksi L3"
                  subtitle="Pemegang: Budi H. → Tim Redaksi"
                  meta="04/08/2026 · Dewi Anggraini · alasan: relokasi ruang"
                  active
                />
                <TimelineItem
                  title="Gudang GA → Studio L2"
                  subtitle="Pemegang: — → Budi H."
                  meta="12/03/2026 · Rizky Saputra · alasan: kebutuhan produksi"
                />
                <TimelineItem
                  title="Pencatatan awal"
                  meta="01/01/2026 · migrasi Excel GA"
                  last
                />
              </div>
            </SectionCard>
            <SectionCard>
              <Heading
                title="Perubahan terakhir"
                action="Semua log →"
                onAction={() =>
                  setNotice("Semua log audit dibuka (simulasi). ")
                }
              />
              <div className="mt-4 flex flex-col gap-[11px]">
                <AuditItem
                  title="Kondisi diubah"
                  detail={
                    <>
                      <s className="text-[#8e91a0]">Bagus</s> → Rusak Berat
                    </>
                  }
                  meta="Dewi Anggraini · 05/08/2026 08.47"
                />
                <AuditItem
                  title="Keterangan diubah"
                  detail="Ditambahkan catatan servis vendor"
                  meta="Dewi Anggraini · 04/08/2026 17.02"
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-[16px] rounded-[20px] border border-[#eef0f3] bg-white p-5">
      {children}
    </section>
  )
}
function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "danger" | "repair" | "missing"
}) {
  const tones = {
    default: "border border-[#e0e2e8] bg-white text-[#555a6a]",
    danger: "bg-[#ffc6c6] text-[#600000]",
    repair: "bg-[#fde0f0] text-[#600000]",
    missing: "bg-white text-[#600000]",
  }
  return (
    <span
      className={`rounded-full px-3 py-[5px] text-[12px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
function ActionButton({
  children,
  onClick,
  variant,
  small = false,
  className = "",
}: {
  children: string
  onClick: () => void
  variant: "dark" | "outline"
  small?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-fit shrink-0 items-center rounded-full font-semibold ${small ? "h-8 px-[14px] text-[12.5px]" : "h-10 px-4 text-[13.5px]"} ${variant === "dark" ? "bg-[#1c1c1e] text-white" : "border border-[#c7cad5] bg-white text-[#1c1c1e]"} ${className}`}
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
function PhotoSlot({
  image,
  label,
  main = false,
  onClick,
}: {
  image?: string
  label: string
  main?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex ${main ? "h-[220px] rounded-[14px]" : "min-h-[104px] flex-1 rounded-xl"} items-center justify-center overflow-hidden border border-dashed border-[#c7cad5] bg-[repeating-linear-gradient(135deg,#f7f8fa_0_8px,#eef0f3_8px_16px)] text-[#8e91a0]`}
    >
      {image ? (
        <img src={image} alt={label} className="size-full object-cover" />
      ) : (
        <span
          className={`px-2 text-center ${main ? "flex flex-col gap-2" : "font-mono text-[10.5px]"}`}
        >
          <span className={main ? "font-mono text-[11px] text-[#6b6f7e]" : ""}>
            {label}
          </span>
          {main && (
            <span className="text-[11.5px]">
              Belum ada foto. Tarik file ke sini (JPG/PNG/WEBP, maks. 2 MB).
            </span>
          )}
        </span>
      )}
    </button>
  )
}
function InfoField({
  label,
  value,
  mono = false,
  muted = false,
  wide = false,
  editing = false,
  onChange,
}: {
  label: string
  value: string
  mono?: boolean
  muted?: boolean
  wide?: boolean
  editing?: boolean
  onChange?: (value: string) => void
}) {
  return (
    <label
      className={`flex flex-col gap-[3px] border-b border-[#eef0f3] pb-3 ${wide ? "sm:col-span-2 sm:border-b-0 sm:pb-0" : ""}`}
    >
      <span className="text-[11.5px] text-[#6b6f7e]">{label}</span>
      {editing && onChange ? (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-transparent text-[14px] outline-none ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <span
          className={`text-[14px] ${mono ? "font-mono" : ""} ${muted ? "text-[#a5a8b5]" : ""} ${wide ? "leading-[1.55]" : ""}`}
        >
          {value}
        </span>
      )}
    </label>
  )
}
function Heading({
  title,
  detail,
  action,
  onAction,
}: {
  title: string
  detail?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex items-baseline gap-[9px]">
      <h2 className="text-[16px] font-semibold">{title}</h2>
      {detail && <span className="text-[11.5px] text-[#8e91a0]">{detail}</span>}
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="ml-auto text-[12.5px] font-semibold text-[#4262ff]"
        >
          {action}
        </button>
      )}
    </div>
  )
}
function CompletenessCard() {
  return (
    <section className="flex flex-col gap-3 rounded-[20px] bg-[#c3faf5] p-5">
      <h2 className="text-[15px] font-semibold text-[#187574]">
        Kelengkapan data
      </h2>
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] leading-none font-semibold tracking-[-1px]">
          7
        </span>
        <span className="text-[13px] text-[#187574]">dari 10 field terisi</span>
      </div>
      <span className="h-[7px] overflow-hidden rounded-full bg-[#187574]/20">
        <span className="block h-full w-[70%] rounded-full bg-[#187574]" />
      </span>
      <div className="flex flex-wrap gap-1.5">
        <Badge tone="missing">Merek kosong</Badge>
        <Badge tone="missing">Harga kosong</Badge>
        <Badge tone="missing">Foto kosong</Badge>
      </div>
    </section>
  )
}
function TimelineItem({
  title,
  subtitle,
  meta,
  active = false,
  last = false,
}: {
  title: string
  subtitle?: string
  meta: string
  active?: boolean
  last?: boolean
}) {
  return (
    <div
      className={`relative ml-[5px] border-l-2 border-[#eef0f3] pl-4 ${last ? "" : "pb-4"}`}
    >
      <span
        className={`absolute top-0.5 -left-[6px] size-[10px] rounded-full ${active ? "bg-[#1c1c1e]" : "bg-[#c7cad5]"}`}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold">{title}</span>
        {subtitle && (
          <span className="text-[12px] text-[#6b6f7e]">{subtitle}</span>
        )}
        <span className="text-[11.5px] text-[#8e91a0]">{meta}</span>
      </div>
    </div>
  )
}
function AuditItem({
  title,
  detail,
  meta,
}: {
  title: string
  detail: ReactNode
  meta: string
}) {
  return (
    <div className="flex flex-col gap-[3px] border-b border-[#eef0f3] pb-[11px] last:border-0 last:pb-0">
      <span className="text-[12.5px] font-semibold">{title}</span>
      <span className="text-[12px] text-[#6b6f7e]">{detail}</span>
      <span className="text-[11px] text-[#8e91a0]">{meta}</span>
    </div>
  )
}
