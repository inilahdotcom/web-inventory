import { useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Route } from "@/routes/_app/asset/$id/"
import { usePermission } from "@/hooks/usePermission"
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
import { profileService } from "@/services/profileService"
import { authService } from "@/services/authServices"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { TimelineItem } from "@/components/ui/timeline"
import { LogOut, User } from "lucide-react"
import { toast } from "sonner"

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
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  // State untuk filter chip timeline (Task B1)
  const [timelineFilter, setTimelineFilter] = useState<string>("all")

  const { canCreateEditAsset, canDeleteRestoreAsset } = usePermission()

  const { data: profile } = useQuery({
    queryKey: ["dashboard", "profile"],
    queryFn: () => profileService.get(),
  })

  const displayName: string = profile?.attributes?.name || ""
  const userInitials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    setIsProfileOpen(false)
    try {
      if (authService?.logout) {
        await authService.logout()
      }
    } catch (err) {
      console.error("Gagal request logout:", err)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()

      queryClient.clear()
      toast.success("Berhasil keluar dari akun")
      navigate({ to: "/auth/login" })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      await queryClient.invalidateQueries({ queryKey: ["assets"] })
      setSplitOpen(false)
      await navigate({
        to: "/asset",
        search: {
          highlight: result.created.asset_code,
          latest: 1,
          newCount: 1,
        },
      })
    } catch (cause) {
      setSplitError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (error || !detail || !asset) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Aset tidak ditemukan."}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const photos = detail.attributes.photos.map((photo) => photo.url)

  // Penggabungan data riwayat menjadi satu unified timeline (Task B1) - Aman dari error tipe TypeScript
  const attributesObj = detail.attributes as unknown as {
    mutationHistory?: Array<{
      id: string | number
      mutationDate?: string
      createdAt?: string
      fromLocation?: string
      toLocation?: string
      fromHolder?: string
      toHolder?: string
      actorName?: string
      reason?: string
    }>
    auditLogs?: Array<{
      id: string | number
      createdAt?: string
      actorName?: string
      oldValue?: string | null
      newValue?: string | null
      fieldName?: string | null
      action: string
    }>
    checkHistory?: Array<{
      id: string | number
      createdAt?: string
      date?: string
      condition?: string
      notes?: string
      inspectorName?: string
      actorName?: string
    }>
  }

  const unifiedTimeline = [
    ...(attributesObj.mutationHistory || []).map((m) => ({
      id: `mutation-${m.id}`,
      type: "mutation" as const,
      date: new Date(m.mutationDate || m.createdAt || new Date().toISOString()),
      title: `${m.fromLocation || "—"} → ${m.toLocation || "—"}`,
      subtitle: `Pemegang: ${m.fromHolder || "—"} → ${m.toHolder || "—"}`,
      meta: `${displayDate(m.mutationDate || "")} · ${m.actorName || ""} · alasan: ${m.reason || ""}`,
      badge: "Mutasi",
    })),
    ...(attributesObj.auditLogs || []).map((log) => ({
      id: `audit-${log.id}`,
      type: "audit" as const,
      date: new Date(log.createdAt || new Date().toISOString()),
      title: auditTitle(log as AssetAuditLog),
      subtitle: auditDetail(log as AssetAuditLog),
      meta: `${log.actorName || ""} · ${displayTimestamp(log.createdAt || null)}`,
      badge: "Log Perubahan",
    })),
    ...(attributesObj.checkHistory || []).map((c) => ({
      id: `check-${c.id}`,
      type: "check" as const,
      date: new Date(c.createdAt || c.date || new Date().toISOString()),
      title: `Pemeriksaan Aset (${c.condition || "Pengecekan"})`,
      subtitle: c.notes || "Pemeriksaan rutin inventaris",
      meta: `${c.inspectorName || c.actorName || "Admin"} · ${displayTimestamp(c.createdAt || null)}`,
      badge: "Pemeriksaan",
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  const filteredTimeline = unifiedTimeline.filter((item) => {
    if (timelineFilter === "all") return true
    return item.type === timelineFilter
  })

  return (
    <div className="min-h-svh min-w-0 bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-hairline bg-card py-0 pr-4 pl-16 sm:pr-6 sm:pl-16 lg:pl-6">
        <div className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
          <button
            type="button"
            onClick={() => void navigate({ to: "/asset" })}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            Daftar Aset
          </button>
          <span>/</span>
          <span className="truncate font-mono text-foreground">
            {detail.attributes.code}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 transition select-none hover:ring-2 hover:ring-rose-300 focus:outline-none"
            >
              {userInitials || "DZ"}
            </button>

            {isProfileOpen && (
              <Card className="absolute right-0 z-50 mt-2 w-48 py-1.5 shadow-lg">
                <div className="border-b border-neutral-100 px-4 py-2">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {displayName || "Dzaki Admin"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Akun Terverifikasi
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false)
                    navigate({ to: "/profile" })
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Detail Profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  Logout
                </button>
              </Card>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-4.5 px-4 py-6 pb-7 sm:px-7">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex flex-col gap-2.25">
            <span className="font-mono text-[13px] text-brand-blue">
              {detail.attributes.code}
            </span>
            <h1 className="text-[28px] leading-none font-semibold tracking-[-0.8px] sm:text-[32px]">
              {asset.name}
            </h1>
            <div className="flex flex-wrap gap-1.75">
              <Badge
                variant={
                  asset.condition === "Rusak Berat"
                    ? "rusak-berat"
                    : asset.condition === "Rusak Ringan"
                      ? "rusak-ringan"
                      : asset.condition === "Hilang"
                        ? "hilang"
                        : "bagus"
                }
              >
                {asset.condition}
              </Badge>
              <Badge
                variant={
                  asset.status === "Diperbaiki" ? "diperbaiki" : "outline"
                }
              >
                {asset.status}
              </Badge>
              <Badge variant="outline">{asset.category}</Badge>
              <Badge variant="outline">
                {asset.quantity} {detail.attributes.unit}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.25 xl:ml-auto xl:flex-nowrap">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => void navigate({ to: "/mutasi" })}
            >
              Mutasi
            </Button>

            {canDeleteRestoreAsset && (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => void deleteAsset()}
              >
                Hapus
              </Button>
            )}

            {canCreateEditAsset && (
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => void toggleEditing()}
              >
                {busy
                  ? "Memproses…"
                  : editing
                    ? "Simpan perubahan"
                    : "Ubah Aset"}
              </Button>
            )}
          </div>
        </section>

        {notice && (
          <Alert onClick={() => setNotice("")} className="cursor-pointer">
            <AlertDescription>{notice} ×</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <div className="flex flex-col gap-4.5">
            <Card className="flex flex-col gap-4 rounded-[20px] p-5">
              <div className="flex items-baseline gap-2.25">
                <h2 className="text-[16px] font-semibold">Foto aset</h2>
                <span className="text-[11.5px] text-muted-foreground">
                  {photos.length} dari 5 terunggah
                </span>

                {canCreateEditAsset && (
                  <button
                    type="button"
                    onClick={() => !busy && inputRef.current?.click()}
                    className="ml-auto text-[13px] font-semibold text-brand-blue"
                  >
                    Unggah foto
                  </button>
                )}
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
                  onClick={() =>
                    canCreateEditAsset && !busy && inputRef.current?.click()
                  }
                  label="foto utama · 4:3"
                />
                <div className="flex flex-col gap-3">
                  <PhotoSlot
                    image={photos[1]}
                    onClick={() =>
                      canCreateEditAsset && !busy && inputRef.current?.click()
                    }
                    label="foto 2"
                  />
                  <PhotoSlot
                    image={photos[2]}
                    onClick={() =>
                      canCreateEditAsset && !busy && inputRef.current?.click()
                    }
                    label="foto 3"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <PhotoSlot
                    image={photos[3]}
                    onClick={() =>
                      canCreateEditAsset && !busy && inputRef.current?.click()
                    }
                    label="foto 4"
                  />
                  <PhotoSlot
                    image={photos[4]}
                    onClick={() =>
                      canCreateEditAsset && !busy && inputRef.current?.click()
                    }
                    label="foto 5"
                  />
                </div>
              </div>
            </Card>

            <Card className="flex flex-col gap-4 rounded-[20px] p-5">
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

              {detail.attributes.quantity > 1 && canCreateEditAsset && (
                <div className="flex flex-col gap-3 rounded-xl bg-[#fff8e0] px-3.5 py-3 sm:flex-row sm:items-center">
                  <span className="text-[12.5px] leading-[1.45] text-[#746019]">
                    Record ini berisi {detail.attributes.quantity}{" "}
                    {detail.attributes.unit}. Jika kondisinya campuran, pecah
                    sebagian unit menjadi record baru agar setiap kondisi
                    tercatat terpisah sesuai BR-09.
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busy || editing}
                    className="sm:ml-auto"
                    onClick={openSplitDialog}
                  >
                    Pecah record
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-col gap-4.5">
            <CompletenessCard completeness={detail.attributes.completeness} />

            {/* Task B1: Satu Timeline Terpadu dengan Filter Chips */}
            <Card className="flex flex-col gap-4 rounded-[20px] p-5">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold">
                    Riwayat & Aktivitas Aset
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {unifiedTimeline.length} total catatan
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      timelineFilter === "all"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Semua ({unifiedTimeline.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("mutation")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      timelineFilter === "mutation"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Mutasi
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("audit")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      timelineFilter === "audit"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Log Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter("check")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      timelineFilter === "check"
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Pemeriksaan
                  </button>
                </div>
              </div>

              <div className="mt-2">
                {filteredTimeline.length ? (
                  <div className="flex flex-col">
                    {filteredTimeline.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative flex flex-col gap-1 pb-4"
                      >
                        <TimelineItem
                          title={
                            <div className="flex items-center gap-2">
                              <span>{item.title}</span>
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[10px]"
                              >
                                {item.badge}
                              </Badge>
                            </div>
                          }
                          subtitle={item.subtitle}
                          meta={item.meta}
                          active={index === 0}
                          last={index === filteredTimeline.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    Belum ada catatan riwayat untuk filter ini.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <SplitAssetDialog
        open={splitOpen}
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
    </div>
  )
}

function SplitAssetDialog({
  open,
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
  open: boolean
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-lg rounded-[22px] bg-card p-5 text-card-foreground sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Pecah record aset
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {assetCode} saat ini memiliki {currentQuantity} {unit} dengan
            kondisi {currentCondition}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid items-start gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Jumlah yang dipecah
            </Label>
            <div className="flex h-11 items-center rounded-xl border border-hairline bg-card px-3 focus-within:border-primary">
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
              <span className="text-xs font-normal text-muted-foreground">
                {unit}
              </span>
            </div>
            <span className="text-[11px] font-normal text-muted-foreground">
              Maksimal {currentQuantity - 1} {unit}
            </span>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Kondisi record baru
            </Label>
            <select
              value={draft.condition}
              disabled={busy}
              onChange={(event) => onConditionChange(event.target.value)}
              className="h-11 rounded-xl border border-hairline bg-card px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
            >
              {availableConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Status record baru
            </Label>
            <select
              value={draft.status}
              disabled={busy || draft.condition === "Hilang"}
              onChange={(event) => onChange({ status: event.target.value })}
              className="h-11 rounded-xl border border-hairline bg-card px-3 text-sm outline-none focus:border-primary disabled:opacity-60"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {draft.condition === "Hilang" && (
              <span className="text-[11px] font-normal text-muted-foreground">
                Aset hilang otomatis berstatus Tidak Tersedia.
              </span>
            )}
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Catatan (opsional)
            </Label>
            <Textarea
              rows={3}
              value={draft.notes}
              disabled={busy}
              onChange={(event) => onChange({ notes: event.target.value })}
              placeholder="Contoh: 1 unit rusak dan dipisahkan sesuai BR-09"
              className="rounded-xl border border-hairline text-sm"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" disabled={busy} onClick={onSubmit}>
            {busy ? "Memproses…" : "Pecah record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
            <Badge key={field} variant="destructive">
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
