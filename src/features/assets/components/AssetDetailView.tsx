import { useEffect, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Route } from "@/routes/_app/asset/$id/"
import {
  assetService,
  type AssetAuditLog,
  type AssetDetailAttr,
  type SplitAssetPayload,
  type UpdateAssetPayload,
} from "@/services/assetServices"
import {
  masterDataService,
  type MasterDataItem,
} from "@/services/masterDataService"

type AssetDraft = Record<
  | "name"
  | "category"
  | "brand"
  | "quantity"
  | "price"
  | "date"
  | "location"
  | "holder"
  | "status"
  | "condition"
  | "description",
  string
>

const fields: Array<{ key: keyof AssetDraft; label: string; mono?: boolean }> =
  [
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

const conditionOptions = ["Bagus", "Rusak Ringan", "Rusak Berat", "Hilang"]
const statusOptions = ["Digunakan", "Tersedia", "Diperbaiki", "Dihapuskan"]
const splitStatusOptions = [...statusOptions, "Tidak Tersedia"]

type SplitAssetDraft = {
  quantity: string
  condition: string
  status: string
  notes: string
}

const number = new Intl.NumberFormat("id-ID")

function toDraft(detail: AssetDetailAttr): AssetDraft {
  const asset = detail.attributes
  return {
    name: asset.name,
    category: asset.category,
    brand: asset.brand ?? "",
    quantity: String(asset.quantity),
    price:
      asset.acquisitionPrice === null ? "" : String(asset.acquisitionPrice),
    date: asset.acquisitionDate ?? "",
    location: asset.location,
    holder: asset.holder ?? "",
    status: asset.status,
    condition: asset.condition,
    description: asset.description ?? "",
  }
}

function displayDate(value: string) {
  if (!value) return "Belum diisi"
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("id-ID")
}

function displayTimestamp(value: string | null) {
  if (!value) return "Tanggal tidak tersedia"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
}

function errorMessage(error: unknown) {
  const response = error as {
    response?: { status?: number; data?: { message?: string; error?: string } }
  }
  if (response.response?.status === 404) return "Aset tidak ditemukan."
  return (
    response.response?.data?.message ||
    response.response?.data?.error ||
    "Permintaan ke server gagal."
  )
}

function defaultSplitCondition(currentCondition: string) {
  return currentCondition === "Rusak Ringan" ? "Bagus" : "Rusak Ringan"
}

function defaultSplitStatus(condition: string, currentStatus: string) {
  if (condition === "Rusak Ringan" || condition === "Rusak Berat") {
    return "Diperbaiki"
  }
  if (condition === "Hilang") return "Tidak Tersedia"
  return currentStatus === "Diperbaiki" || currentStatus === "Dihapuskan"
    ? "Tersedia"
    : currentStatus
}

export function AssetDetailView() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [detail, setDetail] = useState<AssetDetailAttr | null>(null)
  const [asset, setAsset] = useState<AssetDraft | null>(null)
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [splitOpen, setSplitOpen] = useState(false)
  const [splitError, setSplitError] = useState("")
  const [splitDraft, setSplitDraft] = useState<SplitAssetDraft>({
    quantity: "1",
    condition: "Rusak Ringan",
    status: "Diperbaiki",
    notes: "",
  })
  const [masters, setMasters] = useState<{
    categories: MasterDataItem[]
    brands: MasterDataItem[]
    locations: MasterDataItem[]
  }>({ categories: [], brands: [], locations: [] })

  const refreshDetail = async () => {
    const response = await assetService.getAssetDetail(id)
    setDetail(response)
    setAsset(toDraft(response))
    return response
  }

  useEffect(() => {
    let active = true
    const loadDetail = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await assetService.getAssetDetail(id)
        if (!active) return
        setDetail(response)
        setAsset(toDraft(response))
        setEditing(false)
      } catch (cause) {
        if (active) setError(errorMessage(cause))
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadDetail()
    return () => {
      active = false
    }
  }, [id])

  const updateAsset = (key: keyof AssetDraft, value: string) =>
    setAsset((current) => (current ? { ...current, [key]: value } : current))

  const loadMasters = async () => {
    const [categories, brands, locations] = await Promise.all([
      masterDataService.getCategories(),
      masterDataService.getBrands(),
      masterDataService.getLocations(),
    ])
    setMasters({ categories, brands, locations })
  }

  const makePayload = (
    draft: AssetDraft,
    photoUrls?: string[]
  ): UpdateAssetPayload => {
    if (!detail) throw new Error("Aset belum dimuat.")
    const data = detail.attributes
    const resolveId = (
      value: string,
      currentValue: string | null,
      currentId: number | null,
      options: MasterDataItem[]
    ) =>
      value === (currentValue ?? "")
        ? currentId
        : options.find((item) => item.name === value)?.id
    const categoryId = resolveId(
      draft.category,
      data.category,
      data.categoryId,
      masters.categories
    )
    const locationId = resolveId(
      draft.location,
      data.location,
      data.locationId,
      masters.locations
    )
    const brandId = draft.brand
      ? resolveId(draft.brand, data.brand, data.brandId, masters.brands)
      : null
    const quantity = Number(draft.quantity)

    if (!draft.name.trim() || !Number.isInteger(quantity) || quantity < 1)
      throw new Error("Nama aset dan jumlah wajib diisi dengan benar.")
    if (!categoryId || !locationId)
      throw new Error("Kategori dan lokasi wajib dipilih dari daftar.")
    if (draft.brand && !brandId)
      throw new Error("Merek wajib dipilih dari daftar.")

    return {
      name: draft.name.trim(),
      category_id: categoryId,
      brand_id: brandId,
      quantity,
      unit: data.unit,
      condition: draft.condition,
      status: draft.status,
      purchase_price: draft.price
        ? Number(draft.price.replace(/\D/g, ""))
        : undefined,
      purchase_date: draft.date || undefined,
      location_id: locationId,
      holder_name: draft.holder.trim() || undefined,
      notes: draft.description.trim() || undefined,
      photo_urls: photoUrls,
    }
  }

  const uploadPhotos = async (files: FileList | null) => {
    if (!files?.length || !detail || !asset) return
    const selected = Array.from(files)
    const currentPhotos = detail.attributes.photos
    if (
      selected.length + currentPhotos.length > 5 ||
      selected.some(
        (file) =>
          file.size > 2 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
    ) {
      setNotice("Maksimal 5 foto JPG/PNG/WEBP, masing-masing berukuran 2 MB.")
      return
    }

    setBusy(true)
    try {
      const uploadedUrls = await assetService.uploadPhoto(selected)
      await assetService.updateAsset(
        detail.id,
        makePayload(asset, [
          ...currentPhotos.map((photo) => photo.url),
          ...uploadedUrls,
        ])
      )
      await refreshDetail()
      setNotice(`${selected.length} foto berhasil diunggah.`)
    } catch (cause) {
      setNotice(errorMessage(cause))
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const toggleEditing = async () => {
    if (!asset || !detail) return
    if (!editing) {
      setBusy(true)
      try {
        await loadMasters()
        setEditing(true)
      } catch (cause) {
        setNotice(errorMessage(cause))
      } finally {
        setBusy(false)
      }
      return
    }

    setBusy(true)
    try {
      await assetService.updateAsset(detail.id, makePayload(asset))
      await refreshDetail()
      setEditing(false)
      setNotice("Perubahan aset berhasil disimpan.")
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  const deleteAsset = async () => {
    if (!detail) return
    const reason = window.prompt("Alasan penghapusan aset:")?.trim()
    if (!reason || !window.confirm(`Arsipkan aset ${detail.attributes.code}?`))
      return
    setBusy(true)
    try {
      await assetService.delete(detail.id, reason)
      await navigate({ to: "/asset" })
    } catch (cause) {
      setNotice(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  const openSplitDialog = () => {
    if (!detail || detail.attributes.quantity < 2) return
    const condition = defaultSplitCondition(detail.attributes.condition)
    setSplitDraft({
      quantity: "1",
      condition,
      status: defaultSplitStatus(condition, detail.attributes.status),
      notes: "",
    })
    setSplitError("")
    setSplitOpen(true)
  }

  const submitSplit = async () => {
    if (!detail) return
    const splitQuantity = Number(splitDraft.quantity)
    if (
      !Number.isInteger(splitQuantity) ||
      splitQuantity < 1 ||
      splitQuantity >= detail.attributes.quantity
    ) {
      setSplitError(
        `Jumlah yang dipecah harus antara 1 dan ${detail.attributes.quantity - 1}.`
      )
      return
    }
    if (splitDraft.condition === detail.attributes.condition) {
      setSplitError("Kondisi record baru harus berbeda dari record asal.")
      return
    }

    const payload: SplitAssetPayload = {
      split_quantity: splitQuantity,
      condition: splitDraft.condition,
      status: splitDraft.status,
      notes: splitDraft.notes.trim() || undefined,
    }

    setBusy(true)
    setSplitError("")
    try {
      const result = await assetService.splitAsset(detail.id, payload)
      await refreshDetail()
      setSplitOpen(false)
      setNotice(
        `Record berhasil dipecah. Aset baru ${result.created.asset_code} dibuat sebanyak ${result.created.quantity} ${result.created.unit}.`
      )
    } catch (cause) {
      setSplitError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageState>Memuat detail aset…</PageState>
  if (error || !detail || !asset)
    return <PageState error>{error || "Aset tidak ditemukan."}</PageState>

  const photos = detail.attributes.photos.map((photo) => photo.url)

  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 sm:pr-6 sm:pl-16 lg:pl-6">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-[#8e91a0]">
          <button
            type="button"
            onClick={() => void navigate({ to: "/asset" })}
            className="shrink-0 text-[#6b6f7e]"
          >
            Daftar Aset
          </button>
          <span>/</span>
          <span className="truncate font-mono text-[#1c1c1e]">
            {detail.attributes.code}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full border border-[#e0e2e8] text-[13px] text-[#555a6a]">
            ?
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[#ffc6c6] text-[11px] font-semibold text-[#600000]">
            RS
          </span>
        </div>
      </header>

      <main className="flex flex-col gap-4.5 px-4 py-6 pb-7 sm:px-7">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex flex-col gap-2.25">
            <span className="font-mono text-[13px] text-[#4262ff]">
              {detail.attributes.code}
            </span>
            <h1 className="text-[28px] leading-none font-semibold tracking-[-0.8px] sm:text-[32px]">
              {asset.name}
            </h1>
            <div className="flex flex-wrap gap-1.75">
              <Badge
                tone={
                  asset.condition === "Rusak Berat"
                    ? "danger"
                    : asset.condition === "Rusak Ringan"
                      ? "warning"
                      : "default"
                }
              >
                {asset.condition}
              </Badge>
              <Badge
                tone={asset.status === "Diperbaiki" ? "repair" : "default"}
              >
                {asset.status}
              </Badge>
              <Badge>{asset.category}</Badge>
              <Badge>
                {asset.quantity} {detail.attributes.unit}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.25 xl:ml-auto xl:flex-nowrap">
            <ActionButton
              variant="outline"
              disabled={busy}
              onClick={() => void navigate({ to: "/mutasi" })}
            >
              Mutasi
            </ActionButton>
            <ActionButton
              variant="outline"
              disabled={busy}
              onClick={() => void deleteAsset()}
            >
              Hapus
            </ActionButton>
            <ActionButton
              variant="dark"
              disabled={busy}
              onClick={() => void toggleEditing()}
            >
              {busy ? "Memproses…" : editing ? "Simpan perubahan" : "Ubah Aset"}
            </ActionButton>
          </div>
        </section>

        {notice && <Notice onClose={() => setNotice("")}>{notice}</Notice>}

        <div className="grid gap-4.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-4.5">
            <SectionCard>
              <div className="flex items-baseline gap-2.25">
                <h2 className="text-[16px] font-semibold">Foto aset</h2>
                <span className="text-[11.5px] text-[#8e91a0]">
                  {photos.length} dari 5 terunggah
                </span>
                <button
                  type="button"
                  onClick={() => !busy && inputRef.current?.click()}
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
                  onChange={(event) => void uploadPhotos(event.target.files)}
                />
              </div>
              <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
                <PhotoSlot
                  image={photos[0]}
                  main
                  onClick={() => !busy && inputRef.current?.click()}
                  label="foto utama · 4:3"
                />
                <div className="flex flex-col gap-3">
                  <PhotoSlot
                    image={photos[1]}
                    onClick={() => !busy && inputRef.current?.click()}
                    label="foto 2"
                  />
                  <PhotoSlot
                    image={photos[2]}
                    onClick={() => !busy && inputRef.current?.click()}
                    label="foto 3"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <PhotoSlot
                    image={photos[3]}
                    onClick={() => !busy && inputRef.current?.click()}
                    label="foto 4"
                  />
                  <PhotoSlot
                    image={photos[4]}
                    onClick={() => !busy && inputRef.current?.click()}
                    label="foto 5"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <h2 className="text-[16px] font-semibold">Informasi aset</h2>
              <div className="grid gap-x-7 gap-y-4 sm:grid-cols-2">
                <InfoField
                  label="Kode aset"
                  value={detail.attributes.code}
                  mono
                />
                {fields.map((field) => (
                  <InfoField
                    key={field.key}
                    label={field.label}
                    value={asset[field.key]}
                    displayValue={
                      field.key === "price"
                        ? asset.price
                          ? `Rp ${number.format(Number(asset.price))}`
                          : "Belum diisi"
                        : field.key === "date"
                          ? displayDate(asset.date)
                          : field.key === "quantity"
                            ? `${asset.quantity} ${detail.attributes.unit}`
                            : asset[field.key] || "Belum diisi"
                    }
                    muted={!asset[field.key]}
                    editing={editing}
                    inputType={
                      field.key === "date"
                        ? "date"
                        : field.key === "price" || field.key === "quantity"
                          ? "number"
                          : "text"
                    }
                    options={
                      field.key === "category"
                        ? masters.categories.map((item) => item.name)
                        : field.key === "brand"
                          ? ["", ...masters.brands.map((item) => item.name)]
                          : field.key === "location"
                            ? masters.locations.map((item) => item.name)
                            : field.key === "status"
                              ? statusOptions
                              : undefined
                    }
                    onChange={(value) => updateAsset(field.key, value)}
                  />
                ))}
                {editing && (
                  <InfoField
                    label="Kondisi"
                    value={asset.condition}
                    editing
                    options={conditionOptions}
                    onChange={(value) => updateAsset("condition", value)}
                  />
                )}
                <InfoField
                  label="Keterangan barang"
                  value={asset.description}
                  wide
                  editing={editing}
                  onChange={(value) => updateAsset("description", value)}
                />
              </div>
              {detail.attributes.quantity > 1 && (
                <div className="flex flex-col gap-3 rounded-xl bg-[#fff8e0] px-3.5 py-3 sm:flex-row sm:items-center">
                  <span className="text-[12.5px] leading-[1.45] text-[#746019]">
                    Record ini berisi {detail.attributes.quantity}{" "}
                    {detail.attributes.unit}. Jika kondisinya campuran, pecah
                    sebagian unit menjadi record baru agar setiap kondisi
                    tercatat terpisah sesuai BR-09.
                  </span>
                  <ActionButton
                    variant="dark"
                    small
                    disabled={busy || editing}
                    className="sm:ml-auto"
                    onClick={openSplitDialog}
                  >
                    Pecah record
                  </ActionButton>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="flex flex-col gap-4.5">
            <CompletenessCard completeness={detail.attributes.completeness} />
            <SectionCard>
              <Heading
                title="Riwayat mutasi"
                detail={`${detail.attributes.mutationHistory.length} catatan`}
              />
              <div className="mt-4">
                {detail.attributes.mutationHistory.length ? (
                  detail.attributes.mutationHistory.map((mutation, index) => (
                    <TimelineItem
                      key={mutation.id}
                      title={`${mutation.fromLocation || "—"} → ${mutation.toLocation || "—"}`}
                      subtitle={`Pemegang: ${mutation.fromHolder || "—"} → ${mutation.toHolder || "—"}`}
                      meta={`${displayDate(mutation.mutationDate)} · ${mutation.actorName} · alasan: ${mutation.reason}`}
                      active={index === 0}
                      last={
                        index === detail.attributes.mutationHistory.length - 1
                      }
                    />
                  ))
                ) : (
                  <p className="text-xs text-[#8e91a0]">
                    Belum ada riwayat mutasi.
                  </p>
                )}
              </div>
            </SectionCard>
            <SectionCard>
              <Heading
                title="Perubahan terakhir"
                action="Semua log →"
                onAction={() =>
                  setNotice("Halaman semua log audit belum tersedia.")
                }
              />
              <div className="mt-4 flex flex-col gap-2.75">
                {detail.attributes.auditLogs.length ? (
                  detail.attributes.auditLogs
                    .slice(0, 2)
                    .map((log) => (
                      <AuditItem
                        key={log.id}
                        title={auditTitle(log)}
                        detail={auditDetail(log)}
                        meta={`${log.actorName} · ${displayTimestamp(log.createdAt)}`}
                      />
                    ))
                ) : (
                  <p className="text-xs text-[#8e91a0]">
                    Belum ada perubahan tercatat.
                  </p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
      {splitOpen && (
        <SplitAssetDialog
          assetCode={detail.attributes.code}
          currentCondition={detail.attributes.condition}
          currentQuantity={detail.attributes.quantity}
          unit={detail.attributes.unit}
          draft={splitDraft}
          error={splitError}
          busy={busy}
          onChange={(change) =>
            setSplitDraft((current) => ({ ...current, ...change }))
          }
          onConditionChange={(condition) =>
            setSplitDraft((current) => ({
              ...current,
              condition,
              status: defaultSplitStatus(condition, detail.attributes.status),
            }))
          }
          onClose={() => !busy && setSplitOpen(false)}
          onSubmit={() => void submitSplit()}
        />
      )}
    </div>
  )
}

function SplitAssetDialog({
  assetCode,
  currentCondition,
  currentQuantity,
  unit,
  draft,
  error,
  busy,
  onChange,
  onConditionChange,
  onClose,
  onSubmit,
}: {
  assetCode: string
  currentCondition: string
  currentQuantity: number
  unit: string
  draft: SplitAssetDraft
  error: string
  busy: boolean
  onChange: (change: Partial<SplitAssetDraft>) => void
  onConditionChange: (condition: string) => void
  onClose: () => void
  onSubmit: () => void
}) {
  const availableConditions = conditionOptions.filter(
    (condition) => condition !== currentCondition
  )
  const availableStatuses =
    draft.condition === "Hilang"
      ? ["Tidak Tersedia"]
      : splitStatusOptions.filter(
          (status) =>
            status !== "Dihapuskan" &&
            status !== "Tidak Tersedia" &&
            (draft.condition === "Bagus" || status !== "Digunakan")
        )

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="split-asset-title"
        className="w-full max-w-lg rounded-[22px] bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div>
            <h2 id="split-asset-title" className="text-xl font-semibold">
              Pecah record aset
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#6b6f7e]">
              {assetCode} saat ini memiliki {currentQuantity} {unit} dengan
              kondisi
              {` ${currentCondition}`}.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Tutup dialog"
            className="ml-auto grid size-8 place-items-center rounded-full text-lg text-[#6b6f7e] hover:bg-[#f0f1f3] disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-semibold text-[#555a6a]">
            Jumlah yang dipecah
            <div className="flex h-11 items-center rounded-xl border border-[#d9dce4] bg-white px-3 focus-within:border-[#4262ff]">
              <input
                type="number"
                min={1}
                max={currentQuantity - 1}
                step={1}
                value={draft.quantity}
                disabled={busy}
                onChange={(event) => onChange({ quantity: event.target.value })}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:opacity-60"
              />
              <span className="text-xs font-normal text-[#8e91a0]">{unit}</span>
            </div>
            <span className="font-normal text-[#8e91a0]">
              Maksimal {currentQuantity - 1} {unit}
            </span>
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-[#555a6a]">
            Kondisi record baru
            <select
              value={draft.condition}
              disabled={busy}
              onChange={(event) => onConditionChange(event.target.value)}
              className="h-11 rounded-xl border border-[#d9dce4] bg-white px-3 text-sm outline-none focus:border-[#4262ff] disabled:opacity-60"
            >
              {availableConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-[#555a6a] sm:col-span-2">
            Status record baru
            <select
              value={draft.status}
              disabled={busy || draft.condition === "Hilang"}
              onChange={(event) => onChange({ status: event.target.value })}
              className="h-11 rounded-xl border border-[#d9dce4] bg-white px-3 text-sm outline-none focus:border-[#4262ff] disabled:opacity-60"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {draft.condition === "Hilang" && (
              <span className="font-normal text-[#8e91a0]">
                Aset hilang otomatis berstatus Tidak Tersedia.
              </span>
            )}
          </label>

          <label className="grid gap-1.5 text-xs font-semibold text-[#555a6a] sm:col-span-2">
            Catatan (opsional)
            <textarea
              rows={3}
              value={draft.notes}
              disabled={busy}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Contoh: 1 unit rusak dan dipisahkan sesuai BR-09"
              className="resize-none rounded-xl border border-[#d9dce4] bg-white px-3 py-2.5 text-sm font-normal outline-none placeholder:text-[#a5a8b5] focus:border-[#4262ff] disabled:opacity-60"
            />
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-[#fff0f0] px-3 py-2.5 text-xs text-[#a80000]"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <ActionButton variant="outline" disabled={busy} onClick={onClose}>
            Batal
          </ActionButton>
          <ActionButton variant="dark" disabled={busy} onClick={onSubmit}>
            {busy ? "Memproses…" : "Pecah record"}
          </ActionButton>
        </div>
      </section>
    </div>
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] border border-[#eef0f3] bg-white p-5">
      {children}
    </section>
  )
}

function PageState({
  children,
  error = false,
}: {
  children: ReactNode
  error?: boolean
}) {
  return (
    <div
      className={`p-8 text-sm ${error ? "text-[#600000]" : "text-[#6b6f7e]"}`}
      role={error ? "alert" : undefined}
    >
      {children}
    </div>
  )
}

function auditTitle(log: AssetAuditLog) {
  if (log.fieldName) return `${log.fieldName} diubah`
  return (
    {
      CREATE: "Aset dibuat",
      UPDATE: "Aset diubah",
      DELETE: "Aset dihapus",
      IMPORT_CREATE: "Aset diimpor",
    }[log.action] || log.action.replaceAll("_", " ")
  )
}

function auditDetail(log: AssetAuditLog) {
  const oldValue = readableAuditValue(log.oldValue)
  const newValue = readableAuditValue(log.newValue)

  if (log.fieldName && log.oldValue && log.newValue)
    return `${oldValue} → ${newValue}`
  return newValue || oldValue || "Perubahan tercatat di audit log"
}

function readableAuditValue(value: string | null) {
  if (!value) return ""

  try {
    const parsed = JSON.parse(value) as { Name?: string; AssetCode?: string }
    if (parsed.Name && parsed.AssetCode)
      return `Aset ${parsed.Name} (${parsed.AssetCode})`
    if (parsed.Name) return `Aset ${parsed.Name}`
    if (parsed.AssetCode) return `Aset ${parsed.AssetCode}`
    return "Data aset diperbarui"
  } catch {
    return value
  }
}

function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "danger" | "warning" | "repair" | "missing"
}) {
  const tones = {
    default: "border border-[#e0e2e8] bg-white text-[#555a6a]",
    danger: "bg-[#ffc6c6] text-[#600000]",
    warning: "bg-[#fff8e0] text-[#746019]",
    repair: "bg-[#fde0f0] text-[#600000]",
    missing: "bg-white text-[#600000]",
  }
  return (
    <span
      className={`rounded-full px-3 py-1.25 text-[12px] font-semibold ${tones[tone]}`}
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
  disabled = false,
  className = "",
}: {
  children: string
  onClick: () => void
  variant: "dark" | "outline"
  small?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-fit shrink-0 items-center rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${small ? "h-8 px-3.5 text-[12.5px]" : "h-10 px-4 text-[13.5px]"} ${variant === "dark" ? "bg-[#1c1c1e] text-white" : "border border-[#c7cad5] bg-white text-[#1c1c1e]"} ${className}`}
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
      className={`relative flex ${main ? "h-55 rounded-[14px]" : "min-h-26 flex-1 rounded-xl"} items-center justify-center overflow-hidden border border-dashed border-[#c7cad5] bg-[repeating-linear-gradient(135deg,#f7f8fa_0_8px,#eef0f3_8px_16px)] text-[#8e91a0]`}
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
  displayValue,
  mono = false,
  muted = false,
  wide = false,
  editing = false,
  onChange,
  options,
  inputType = "text",
}: {
  label: string
  value: string
  displayValue?: string
  mono?: boolean
  muted?: boolean
  wide?: boolean
  editing?: boolean
  onChange?: (value: string) => void
  options?: string[]
  inputType?: string
}) {
  return (
    <label
      className={`flex flex-col gap-0.75 border-b border-[#eef0f3] pb-3 ${wide ? "sm:col-span-2 sm:border-b-0 sm:pb-0" : ""}`}
    >
      <span className="text-[11.5px] text-[#6b6f7e]">{label}</span>
      {editing && onChange && options ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option || "Belum diisi"}
            </option>
          ))}
        </select>
      ) : editing && onChange ? (
        <input
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full bg-transparent text-[14px] outline-none ${mono ? "font-mono" : ""}`}
        />
      ) : (
        <span
          className={`text-[14px] ${mono ? "font-mono" : ""} ${muted ? "text-[#a5a8b5]" : ""} ${wide ? "leading-[1.55]" : ""}`}
        >
          {displayValue ?? value}
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
    <div className="flex items-baseline gap-2.25">
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

function CompletenessCard({
  completeness,
}: {
  completeness: AssetDetailAttr["attributes"]["completeness"]
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[20px] bg-[#c3faf5] p-5">
      <h2 className="text-[15px] font-semibold text-[#187574]">
        Kelengkapan data
      </h2>
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] leading-none font-semibold tracking-[-1px]">
          {completeness.filled}
        </span>
        <span className="text-[13px] text-[#187574]">
          dari {completeness.total} field terisi
        </span>
      </div>
      <span className="h-1.75 overflow-hidden rounded-full bg-[#187574]/20">
        <span
          className="block h-full rounded-full bg-[#187574]"
          style={{ width: `${completeness.percentage}%` }}
        />
      </span>
      <div className="flex flex-wrap gap-1.5">
        {completeness.missingFields.length ? (
          completeness.missingFields.map((field) => (
            <Badge key={field} tone="missing">
              {field}
            </Badge>
          ))
        ) : (
          <span className="text-[12px] text-[#187574]">Data sudah lengkap</span>
        )}
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
      className={`relative ml-1.25 border-l-2 border-[#eef0f3] pl-4 ${last ? "" : "pb-4"}`}
    >
      <span
        className={`absolute top-0.5 -left-1.5 size-2.5 rounded-full ${active ? "bg-[#1c1c1e]" : "bg-[#c7cad5]"}`}
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
    <div className="flex flex-col gap-0.75 border-b border-[#eef0f3] pb-2.75 last:border-0 last:pb-0">
      <span className="text-[12.5px] font-semibold">{title}</span>
      <span className="line-clamp-2 text-[12px] break-words text-[#6b6f7e]">
        {detail}
      </span>
      <span className="text-[11px] text-[#8e91a0]">{meta}</span>
    </div>
  )
}
