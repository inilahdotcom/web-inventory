import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { Route } from "@/routes/_app/asset/$id/edit"
import { InputField } from "@/components/ui/InputField"
import { SelectedField } from "@/components/ui/SelectedField"
import {
  assetService,
  type UpdateAssetPayload,
  type AssetAttr,
  type AssetPhoto,
} from "@/services/assetServices"
import {
  masterDataService,
  type MasterDataItem,
} from "@/services/masterDataService"
import { profileService } from "@/services/profileService"
import { toast } from "sonner"

const MAX_PHOTOS = 5

type ApiError = AxiosError<{ message?: string; error?: string }>

const formatRupiahDisplay = (val: string | number): string => {
  if (!val) return ""
  const rawNumber = String(val).replace(/\D/g, "")
  if (!rawNumber) return ""
  return "Rp " + Number(rawNumber).toLocaleString("id-ID")
}

const parseRawNumber = (val: string): number => {
  const rawNumber = val.replace(/\D/g, "")
  return rawNumber ? Number(rawNumber) : 0
}

export function AssetEditView() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Profil user (queryKey disamakan dengan AssetListView, AssetCreateView, & Sidebar)
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

  // Popover dropdown profile
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [asset, setAsset] = useState<AssetAttr | null>(null)
  const [photos, setPhotos] = useState<AssetPhoto[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [categories, setCategories] = useState<MasterDataItem[]>([])
  const [locations, setLocations] = useState<MasterDataItem[]>([])
  const [brands, setBrands] = useState<MasterDataItem[]>([])

  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Modal State Ubah Foto Utama
  const [pendingPrimaryId, setPendingPrimaryId] = useState<number | null>(null)

  // Modal State Hapus Foto
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    kodeAset: "",
    namaBarang: "",
    categoryId: "",
    locationId: "",
    brandId: "",
    kondisi: "",
    status: "",
    jumlah: 0,
    hargaPerolehan: "0",
  })

  const [hargaDisplay, setHargaDisplay] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      assetService.getAssetById(id),
      masterDataService.getCategories().catch(() => []),
      masterDataService.getLocations().catch(() => []),
      masterDataService.getBrands().catch(() => []),
    ])
      .then(([result, catRes, locRes, brandRes]) => {
        if (!isMounted) return
        setAsset(result)
        setCategories(catRes)
        setLocations(locRes)
        setBrands(brandRes)

        const attrs = result.attributes
        setPhotos(attrs.photos ?? [])

        const initialPrice = String(attrs.acquisitionPrice ?? "0")

        const selectedCatId =
          attrs.categoryId && attrs.categoryId > 0
            ? String(attrs.categoryId)
            : ""
        const selectedLocId =
          attrs.locationId && attrs.locationId > 0
            ? String(attrs.locationId)
            : ""
        const selectedBrandId =
          attrs.brandId && attrs.brandId > 0 ? String(attrs.brandId) : ""

        setFormData({
          kodeAset: attrs.code || "",
          namaBarang: attrs.name || "",
          categoryId: selectedCatId,
          locationId: selectedLocId,
          brandId: selectedBrandId,
          kondisi: attrs.condition || "Bagus",
          status: attrs.status || "Tersedia",
          jumlah: attrs.quantity || 1,
          hargaPerolehan: initialPrice,
        })

        setHargaDisplay(formatRupiahDisplay(initialPrice))
      })
      .catch((error: unknown) => {
        const err = error as ApiError
        if (isMounted) {
          setFetchError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Gagal memuat data aset"
          )
        }
      })
      .finally(() => {
        if (isMounted) setFetching(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericVal = parseRawNumber(value)

    setFormData((prev) => ({ ...prev, hargaPerolehan: String(numericVal) }))
    setHargaDisplay(formatRupiahDisplay(numericVal))
  }

  const handleCancel = () => {
    navigate({ to: `/asset` })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null)
    if (e.target.files) {
      const chosenFiles = Array.from(e.target.files)
      const currentTotal = photos.length + newFiles.length

      if (currentTotal >= MAX_PHOTOS) {
        toast.error(`Maksimal total foto adalah ${MAX_PHOTOS}!`)
        setPhotoError(`Maksimal total foto adalah ${MAX_PHOTOS}`)
        e.target.value = ""
        return
      }

      const availableSlots = MAX_PHOTOS - currentTotal
      const allowedFiles = chosenFiles.slice(0, availableSlots)

      if (chosenFiles.length > availableSlots) {
        toast.warning(
          `Hanya ${availableSlots} foto yang ditambahkan karena melebihi batas ${MAX_PHOTOS} foto.`
        )
      }

      setNewFiles((prev) => [...prev, ...allowedFiles])
    }
    e.target.value = ""
  }

  const handleRemoveNewFile = (index: number) => {
    setPhotoError(null)
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // POPUP KONFIRMASI FOTO UTAMA
  const handleOpenPrimaryModal = (photoId: number) => {
    setPendingPrimaryId(photoId)
  }

  const handleConfirmSetPrimary = () => {
    if (!pendingPrimaryId) return

    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        isPrimary: p.id === pendingPrimaryId,
      }))
    )

    toast.success("Foto utama diperbarui")
    setPendingPrimaryId(null)
  }

  // POPUP KONFIRMASI HAPUS FOTO
  const handleOpenDeleteModal = (photoId: number) => {
    setPendingDeleteId(photoId)
  }

  const handleConfirmDeletePhoto = () => {
    if (!pendingDeleteId) return

    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== pendingDeleteId)

      const wasPrimary = prev.find((p) => p.id === pendingDeleteId)?.isPrimary
      if (wasPrimary && updated.length > 0) {
        return updated.map((photo, index) => ({
          ...photo,
          isPrimary: index === 0,
        }))
      }

      return updated
    })

    toast.success("Foto dihapus dari daftar")
    setPendingDeleteId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!asset) return

    if (photos.length + newFiles.length > MAX_PHOTOS) {
      toast.error(
        `Total foto tidak boleh lebih dari ${MAX_PHOTOS}! Hapus beberapa foto terlebih dahulu.`
      )
      setPhotoError(`Total foto tidak boleh lebih dari ${MAX_PHOTOS}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let newlyUploadedUrls: string[] = []

      if (newFiles.length > 0) {
        newlyUploadedUrls = await assetService.uploadPhoto(newFiles)
      }

      const primaryPhoto = photos.find((p) => p.isPrimary)
      const otherPhotos = photos.filter((p) => !p.isPrimary)

      const orderedExistingUrls = primaryPhoto
        ? [primaryPhoto.url, ...otherPhotos.map((p) => p.url)]
        : photos.map((p) => p.url)

      const finalPhotoUrls = [...orderedExistingUrls, ...newlyUploadedUrls]

      const categoryIdNum = formData.categoryId
        ? Number(formData.categoryId)
        : 1
      const locationIdNum = formData.locationId
        ? Number(formData.locationId)
        : 1
      const currentBrandIdNum = formData.brandId
        ? Number(formData.brandId)
        : null
      const attrs = asset.attributes

      const payload: UpdateAssetPayload = {
        asset_code: formData.kodeAset,
        name: formData.namaBarang,
        category_id: categoryIdNum,
        location_id: locationIdNum,
        brand_id: currentBrandIdNum,
        condition: formData.kondisi,
        status: formData.status,
        quantity: Number(formData.jumlah),
        purchase_price: Number(formData.hargaPerolehan),
        unit: attrs.unit || "unit",
        purchase_date: attrs.acquisitionDate ?? undefined,
        holder_name: attrs.holder ?? undefined,
        notes: attrs.description ?? undefined,
        photo_urls: finalPhotoUrls,
      }

      await assetService.updateAsset(id, payload)

      queryClient.invalidateQueries({ queryKey: ["assets"] })

      setNewFiles([])
      toast.success("Perubahan berhasil disimpan!")

      // Kirim kode aset spesifik yang baru di-edit agar sorotan tepat sasaran
      navigate({
        to: "/asset",
        search: {
          highlight: formData.kodeAset,
        },
      })
    } catch (error: unknown) {
      console.error("Gagal update asset:", error)
      const err = error as ApiError
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Gagal menyimpan perubahan"
      )
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="p-8 text-sm text-neutral-500">Memuat data aset...</div>
    )
  }
  if (fetchError || !asset) {
    return (
      <div className="p-8 text-sm text-red-600">
        {fetchError || "Aset tidak ditemukan"}
      </div>
    )
  }

  const attrs = asset.attributes

  const getCategoryName = (catId?: number | string | null) => {
    if (!catId) return "-"
    return (
      categories.find((c) => String(c.id) === String(catId))?.name ||
      attrs.category ||
      "-"
    )
  }

  const getLocationName = (locId?: number | string | null) => {
    if (!locId) return "-"
    return (
      locations.find((l) => String(l.id) === String(locId))?.name ||
      attrs.location ||
      "-"
    )
  }

  const getBrandName = (brandId?: number | string | null) => {
    if (!brandId) return "-"
    return (
      brands.find((b) => String(b.id) === String(brandId))?.name ||
      attrs.brand ||
      "-"
    )
  }

  const currentBrandIdNum = formData.brandId ? Number(formData.brandId) : null
  const originalBrandIdNum = attrs.brandId ? Number(attrs.brandId) : null
  const totalPhotosCount = photos.length + newFiles.length

  const primaryTargetPhoto = photos.find((p) => p.id === pendingPrimaryId)
  const deleteTargetPhoto = photos.find((p) => p.id === pendingDeleteId)

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-svh w-full flex-col justify-between text-[#1C1C1E]"
    >
      <div className="space-y-6 pb-28">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 pl-14 text-xs text-neutral-500 lg:pl-0">
            <span>Daftar Aset</span>
            <span className="text-neutral-300">/</span>
            <span>{attrs.code}</span>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Ubah</span>
          </div>

          {/* Avatar Profile dengan Popover Dropdown (Disamakan persis dengan AssetListView & AssetCreateView) */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Menu profil"
              aria-expanded={isProfileOpen}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 transition select-none hover:ring-2 hover:ring-rose-300 focus:outline-none"
            >
              {userInitials || "DZ"}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-neutral-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <div className="border-b border-neutral-100 px-4 py-2">
                  <p className="truncate text-xs font-semibold text-neutral-900">
                    {displayName || "Dzaki Admin"}
                  </p>
                  <p className="text-[10px] text-neutral-500">
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
                  <svg
                    className="h-4 w-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Detail Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false)
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                >
                  <svg
                    className="h-4 w-4 text-rose-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-4 pt-2 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Ubah aset
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Setiap perubahan dicatat di audit log beserta nilai lama dan baru
              (FR-UD3).
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Kode aset
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.kodeAset}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-700"
                      />
                      <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                        Read-only untuk Staff GA
                      </span>
                    </div>
                  </div>

                  <InputField
                    label="Nama barang *"
                    name="namaBarang"
                    value={formData.namaBarang}
                    onChange={handleChange}
                    className="text-[#1C1C1E]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <SelectedField
                    label="Kategori *"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="bg-white text-[#1C1C1E]"
                    options={[
                      { label: "Lainnya", value: "" },
                      ...categories.map((cat) => ({
                        label: cat.name,
                        value: String(cat.id),
                      })),
                    ]}
                  />

                  <SelectedField
                    label="Lokasi *"
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    className="bg-white text-[#1C1C1E]"
                    options={[
                      { label: "Lainnya", value: "" },
                      ...locations.map((loc) => ({
                        label: loc.name,
                        value: String(loc.id),
                      })),
                    ]}
                  />

                  <SelectedField
                    label="Merek"
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    className="bg-white text-[#1C1C1E]"
                    options={[
                      { label: "Lainnya", value: "" },
                      ...brands.map((b) => ({
                        label: b.name,
                        value: String(b.id),
                      })),
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SelectedField
                    label="Kondisi *"
                    name="kondisi"
                    value={formData.kondisi}
                    onChange={handleChange}
                    className="bg-white text-[#1C1C1E]"
                    options={[
                      { label: "Bagus", value: "Bagus" },
                      { label: "Rusak Ringan", value: "Rusak Ringan" },
                      { label: "Rusak Berat", value: "Rusak Berat" },
                      { label: "Hilang", value: "Hilang" },
                    ]}
                  />

                  <SelectedField
                    label="Status *"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="bg-white text-[#1C1C1E]"
                    options={[
                      { label: "Tersedia", value: "Tersedia" },
                      { label: "Digunakan", value: "Digunakan" },
                      { label: "Diperbaiki", value: "Diperbaiki" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Jumlah *"
                    type="number"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                    className="text-[#1C1C1E]"
                  />

                  <InputField
                    label="Harga perolehan"
                    type="text"
                    name="hargaDisplay"
                    value={hargaDisplay}
                    onChange={handleHargaChange}
                    placeholder="Rp 0"
                    className="font-mono text-[#1C1C1E]"
                  />
                </div>

                {/* KELOLA FOTO (FR-UD4) */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-900">
                      Kelola foto (FR-UD4)
                    </label>
                    <span className="text-[11px] font-medium text-neutral-500">
                      {totalPhotosCount}/{MAX_PHOTOS} foto
                    </span>
                  </div>

                  {photoError && (
                    <p className="text-xs text-red-600">{photoError}</p>
                  )}

                  <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-2">
                    {photos.length === 0 && newFiles.length === 0 && (
                      <p className="text-xs text-neutral-400 italic">
                        Belum ada foto
                      </p>
                    )}

                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-neutral-100 shadow-2xs ${
                          photo.isPrimary
                            ? "border-amber-400"
                            : "border-neutral-200"
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption ?? "Foto aset"}
                          className="h-full w-full object-cover"
                        />
                        {photo.isPrimary && (
                          <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-neutral-900 shadow-2xs">
                            Utama
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(photo.id)}
                          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-neutral-800/65 text-xs text-white hover:bg-neutral-900"
                        >
                          ×
                        </button>
                        {!photo.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleOpenPrimaryModal(photo.id)}
                            className="absolute bottom-1 left-1 cursor-pointer rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-700 shadow-2xs hover:bg-white"
                          >
                            Jadikan utama
                          </button>
                        )}
                      </div>
                    ))}

                    {newFiles.map((file, idx) => (
                      <div
                        key={`new-${idx}`}
                        className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blue-400 bg-neutral-50 shadow-2xs"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview baru"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs">
                          Baru
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(idx)}
                          className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-neutral-800/65 text-xs text-white hover:bg-neutral-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {totalPhotosCount < MAX_PHOTOS && (
                      <label className="flex h-20 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-neutral-400">
                        <span className="text-lg font-bold text-neutral-500">
                          +
                        </span>
                        <span className="text-[10px] font-medium text-neutral-500">
                          Tambah Foto
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RINGKASAN PERUBAHAN */}
            <div className="space-y-6">
              <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-neutral-900">
                  Ringkasan perubahan
                </h3>
                <div className="space-y-2 text-xs text-neutral-600">
                  {formData.namaBarang !== attrs.name && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Nama barang
                      </span>
                      <span className="text-neutral-500">
                        {attrs.name} → {formData.namaBarang}
                      </span>
                    </div>
                  )}

                  {Number(formData.categoryId) !== attrs.categoryId && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Kategori
                      </span>
                      <span className="text-neutral-500">
                        {getCategoryName(attrs.categoryId)} →{" "}
                        {getCategoryName(formData.categoryId)}
                      </span>
                    </div>
                  )}

                  {Number(formData.locationId) !== attrs.locationId && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Lokasi
                      </span>
                      <span className="text-neutral-500">
                        {getLocationName(attrs.locationId)} →{" "}
                        {getLocationName(formData.locationId)}
                      </span>
                    </div>
                  )}

                  {currentBrandIdNum !== originalBrandIdNum && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Merek
                      </span>
                      <span className="text-neutral-500">
                        {getBrandName(attrs.brandId)} →{" "}
                        {getBrandName(formData.brandId)}
                      </span>
                    </div>
                  )}

                  {formData.kondisi !== attrs.condition && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Kondisi
                      </span>
                      <span className="text-neutral-500">
                        {attrs.condition} → {formData.kondisi}
                      </span>
                    </div>
                  )}
                  {formData.status !== attrs.status && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Status
                      </span>
                      <span className="text-neutral-500">
                        {attrs.status} → {formData.status}
                      </span>
                    </div>
                  )}
                  {Number(formData.jumlah) !== attrs.quantity && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Jumlah
                      </span>
                      <span className="text-neutral-500">
                        {attrs.quantity} → {formData.jumlah}
                      </span>
                    </div>
                  )}
                  {Number(formData.hargaPerolehan) !==
                    (attrs.acquisitionPrice ?? 0) && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Harga perolehan
                      </span>
                      <span className="text-neutral-500">
                        {formatRupiahDisplay(attrs.acquisitionPrice ?? 0)} →{" "}
                        {hargaDisplay || "Rp 0"}
                      </span>
                    </div>
                  )}
                  {newFiles.length > 0 && (
                    <div>
                      <span className="block font-semibold text-neutral-700">
                        Foto Baru
                      </span>
                      <span className="text-neutral-500">
                        {newFiles.length} foto siap diunggah
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-neutral-200/80 bg-white/90 px-6 py-4 shadow-md backdrop-blur-md lg:px-8">
        <span className="text-xs text-neutral-400">
          {loading ? "Menyimpan..." : "Perubahan belum tersimpan"}
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* MODAL KONFIRMASI UBAH FOTO UTAMA */}
      {pendingPrimaryId !== null && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/40 p-4 backdrop-blur-xs duration-150 fade-in">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">
                Ubah Foto Utama?
              </h3>
              <p className="text-xs text-neutral-500">
                Foto ini akan dijadikan sebagai sampul/foto utama aset di
                seluruh halaman.
              </p>
            </div>

            {primaryTargetPhoto && (
              <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                <img
                  src={primaryTargetPhoto.url}
                  alt="Foto Pratinjau Utama"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingPrimaryId(null)}
                className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSetPrimary}
                className="cursor-pointer rounded-xl bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-neutral-800"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS FOTO */}
      {pendingDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/40 p-4 backdrop-blur-xs duration-150 fade-in">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-600">
                Hapus Foto Aset?
              </h3>
              <p className="text-xs text-neutral-500">
                Foto ini akan dihapus dari daftar foto aset. Tindakan ini tidak
                dapat dibatalkan.
              </p>
            </div>

            {deleteTargetPhoto && (
              <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                <img
                  src={deleteTargetPhoto.url}
                  alt="Foto yang Akan Dihapus"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="cursor-pointer rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePhoto}
                className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
