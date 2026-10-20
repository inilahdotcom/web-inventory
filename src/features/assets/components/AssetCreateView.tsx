import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { InputField } from "@/components/ui/InputField"
import { SelectedField } from "@/components/ui/SelectedField"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { assetService, type CreateAssetPayload } from "@/services/assetServices"
import {
  masterDataService,
  type MasterDataItem,
} from "@/services/masterDataService"
import { profileService } from "@/services/profileService"
import { authService } from "@/services/authServices" // Import authService jika ada, atau hapus token langsung
import { toast } from "sonner"

const MAP_SATUAN: Record<string, string> = {
  Unit: "Unit",
  Pcs: "Pcs",
  Set: "Set",
}

const MAP_KONDISI: Record<string, string> = {
  Bagus: "Bagus",
  "Rusak Ringan": "Rusak Ringan",
  "Rusak Berat": "Rusak Berat",
  Hilang: "Hilang",
}

const MAP_STATUS: Record<string, string> = {
  Digunakan: "Digunakan",
  Tersedia: "Tersedia",
  Diperbaiki: "Diperbaiki",
}

export function AssetCreateView() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Profil user
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

  // Handler Logout Aktif
  const handleLogout = async () => {
    setIsProfileOpen(false)
    try {
      // Jika ada API logout dari authService, panggil di sini
      if (authService?.logout) {
        await authService.logout()
      }
    } catch (err) {
      console.error("Gagal request logout:", err)
    } finally {
      // Clear storage
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()

      // Reset React Query cache & redirect ke Login
      queryClient.clear()
      toast.success("Berhasil keluar dari akun")
      navigate({ to: "/auth/login" })
    }
  }

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

  const [formData, setFormData] = useState({
    namaBarang: "",
    kategori: "",
    merek: "",
    jumlah: 1,
    satuan: "Unit",
    kondisi: "Bagus",
    status: "Digunakan",
    hargaPerolehan: "",
    tanggalPerolehan: "",
    lokasi: "",
    pemegangAset: "",
    keterangan: "",
    kodeAset: "",
  })

  const [categories, setCategories] = useState<MasterDataItem[]>([])
  const [brands, setBrands] = useState<MasterDataItem[]>([])
  const [locations, setLocations] = useState<MasterDataItem[]>([])
  const [loadingMasterData, setLoadingMasterData] = useState(true)

  const [fotos, setFotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [warningMessage, setWarningMessage] = useState("")

  const [selectedPhotoIndexForPrimary, setSelectedPhotoIndexForPrimary] =
    useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatNumber = new Intl.NumberFormat("id-ID")
  const rupiahInput = (value: string) => {
    if (!value) return ""
    const cleanNumber = value.replace(/\D/g, "")
    return cleanNumber ? `Rp. ${formatNumber.format(Number(cleanNumber))}` : ""
  }
  const numericValue = (value: string) => value.replace(/\D/g, "")

  useEffect(() => {
    let isMounted = true

    const fetchMasterData = async () => {
      setLoadingMasterData(true)
      try {
        const [cats, brds, locs] = await Promise.all([
          masterDataService.getCategories().catch(() => []),
          masterDataService.getBrands().catch(() => []),
          masterDataService.getLocations().catch(() => []),
        ])

        if (!isMounted) return

        setCategories(Array.isArray(cats) ? cats : [])
        setBrands(Array.isArray(brds) ? brds : [])
        setLocations(Array.isArray(locs) ? locs : [])
      } catch (err) {
        console.error("Gagal mengambil data master:", err)
      } finally {
        if (isMounted) {
          setLoadingMasterData(false)
        }
      }
    }

    fetchMasterData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const uploadedFiles = Array.from(e.target.files)
      if (fotos.length + uploadedFiles.length <= 5) {
        setFotos((prev) => [...prev, ...uploadedFiles])
      } else {
        toast.error("Maksimal 5 foto aset!")
      }
    }
  }

  const handleRemovePhoto = (indexToRemove: number) => {
    setFotos((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleConfirmSetPrimary = () => {
    if (
      selectedPhotoIndexForPrimary !== null &&
      selectedPhotoIndexForPrimary > 0
    ) {
      setFotos((prev) => {
        const newFotos = [...prev]
        const [targetPhoto] = newFotos.splice(selectedPhotoIndexForPrimary, 1)
        newFotos.unshift(targetPhoto)
        return newFotos
      })
      toast.success("Foto utama berhasil diubah!")
    }
    setSelectedPhotoIndexForPrimary(null)
  }

  const handleSubmit = async (
    e: React.FormEvent,
    keepAdding: boolean = false
  ) => {
    e.preventDefault()

    if (!formData.namaBarang.trim()) {
      setErrorMessage("Nama barang wajib diisi!")
      return
    }

    if (!formData.kategori) {
      setErrorMessage("Kategori aset wajib dipilih!")
      return
    }

    setLoading(true)
    setErrorMessage("")
    setWarningMessage("")

    try {
      let photoUrls: string[] = []
      if (fotos.length > 0) {
        photoUrls = await assetService.uploadPhoto(fotos)
      }

      const payload: CreateAssetPayload = {
        name: formData.namaBarang,
        category_id: Number(formData.kategori),
        brand_id: formData.merek ? Number(formData.merek) : undefined,
        quantity: Math.max(1, Number(formData.jumlah) || 1),
        unit: MAP_SATUAN[formData.satuan] || "Unit",
        condition: MAP_KONDISI[formData.kondisi] || "Bagus",
        status: MAP_STATUS[formData.status] || "Digunakan",
        purchase_price: formData.hargaPerolehan
          ? Number(formData.hargaPerolehan)
          : undefined,
        purchase_date: formData.tanggalPerolehan || undefined,
        location_id: formData.lokasi ? Number(formData.lokasi) : undefined,
        holder_name: formData.pemegangAset || undefined,
        notes: formData.keterangan || undefined,
        asset_code: formData.kodeAset || undefined,
        photo_urls: photoUrls,
      }

      const res = await assetService.createAsset(payload)

      queryClient.invalidateQueries({ queryKey: ["assets"] })

      if (res.warning) {
        setWarningMessage(
          typeof res.warning === "string"
            ? res.warning
            : JSON.stringify(res.warning)
        )
      }

      if (keepAdding) {
        setFormData((prev) => ({
          ...prev,
          namaBarang: "",
          keterangan: "",
          pemegangAset: "",
          kodeAset: "",
          kategori: "",
          merek: "",
          lokasi: "",
        }))
        setFotos([])
        toast.success("Aset berhasil disimpan!", {
          description: "Silakan tambah aset berikutnya.",
        })
      } else {
        toast.success("Aset berhasil disimpan!")
        navigate({
          to: "/asset",
          search: {
            newCount: 1,
          },
        })
      }
    } catch (error: unknown) {
      console.error("Gagal menyimpan aset:", error)

      const err = error as AxiosError<{ message?: string; error?: string }>
      const rawMsg: string =
        err.response?.data?.message || err.response?.data?.error || ""
      let userFriendlyMsg =
        "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi."

      if (
        rawMsg.includes("failed on the 'min' tag") ||
        rawMsg.includes("min")
      ) {
        userFriendlyMsg = "Jumlah barang minimal harus 1 unit!"
      } else if (rawMsg.includes("failed on the 'required' tag")) {
        if (rawMsg.includes("'Name'")) {
          userFriendlyMsg = "Nama barang wajib diisi!"
        } else if (rawMsg.includes("'Category'")) {
          userFriendlyMsg = "Kategori aset wajib dipilih!"
        } else if (rawMsg.includes("'Quantity'")) {
          userFriendlyMsg = "Jumlah barang wajib diisi!"
        } else {
          userFriendlyMsg = "Mohon lengkapi semua field yang wajib diisi (*)."
        }
      } else if (rawMsg.includes("asset_photos") || rawMsg.includes("upload")) {
        userFriendlyMsg =
          "Gagal memproses foto aset. Pastikan format file sesuai (JPG/PNG/WEBP)."
      } else if (
        rawMsg.includes("nomor urut kode aset sudah pernah digunakan")
      ) {
        userFriendlyMsg =
          "Nomor urut kode aset ini sudah pernah dipakai sebelumnya."
      } else if (
        rawMsg.includes("Duplicate entry") ||
        rawMsg.includes("asset_code")
      ) {
        userFriendlyMsg =
          "Kode aset sudah digunakan. Silakan gunakan kode aset lain."
      } else if (rawMsg.includes("foreign key constraint fails")) {
        userFriendlyMsg =
          "Kategori, Merek, atau Lokasi yang dipilih tidak valid."
      } else if (rawMsg && !rawMsg.includes("Field validation")) {
        userFriendlyMsg = rawMsg
      }

      setErrorMessage(userFriendlyMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      const validFiles = droppedFiles.filter((file) =>
        ["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )

      if (validFiles.length > 0) {
        if (fotos.length + validFiles.length <= 5) {
          setFotos((prev) => [...prev, ...validFiles])
        } else {
          toast.error("Maksimal 5 foto aset!")
        }
      } else {
        toast.error("Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.")
      }
      e.dataTransfer.clearData()
    }
  }

  return (
    <form
      onSubmit={(e) => handleSubmit(e, false)}
      className="relative flex min-h-svh flex-col justify-between text-[#1C1C1E]"
    >
      <div>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 pl-14 text-xs text-neutral-500 lg:pl-0">
            <span>Daftar Aset</span>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-neutral-900">Tambah aset</span>
          </div>

          {/* Avatar Profile */}
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

                {/* Tombol Logout Aktif */}
                <button
                  type="button"
                  onClick={handleLogout}
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

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-28 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Tambah aset baru
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Field bertanda * wajib diisi. Validasi dijalankan di klien dan
              server (FR-C03).
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {warningMessage && (
            <Alert variant="warning">
              <AlertDescription>
                <strong>Peringatan Kemiripan Aset:</strong> {warningMessage}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card className="space-y-4 p-6">
                <h2 className="text-sm font-bold text-neutral-900">
                  Identitas barang
                </h2>

                <InputField
                  label="Nama barang *"
                  name="namaBarang"
                  value={formData.namaBarang}
                  placeholder="Masukan nama barang"
                  onChange={handleChange}
                  disabled={loading}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <SelectedField
                      label="Kategori *"
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-white"
                      options={[
                        {
                          label: loadingMasterData
                            ? "Memuat data..."
                            : "Pilih salah satu...",
                          value: "",
                        },
                        ...categories.map((c) => ({
                          label: c.name,
                          value: String(c.id),
                        })),
                      ]}
                    />
                  </div>

                  <div className="space-y-1">
                    <SelectedField
                      label="Merek"
                      name="merek"
                      value={formData.merek}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-white"
                      options={[
                        {
                          label: loadingMasterData
                            ? "Memuat data..."
                            : "Pilih salah satu...",
                          value: "",
                        },
                        ...brands.map((b) => ({
                          label: b.name,
                          value: String(b.id),
                        })),
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InputField
                    label="Jumlah *"
                    type="number"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Bilangan bulat minimal 1 (BR-03)."
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700">
                      Satuan *
                    </label>
                    <div className="flex rounded-xl border border-neutral-300 bg-neutral-100 p-1">
                      {["Unit", "Pcs", "Set"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          disabled={loading}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, satuan: item }))
                          }
                          className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-medium transition ${
                            formData.satuan === item
                              ? "bg-neutral-900 text-white shadow-2xs"
                              : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="space-y-4 p-6">
                <h2 className="text-sm font-bold text-neutral-900">
                  Kondisi, lokasi, dan nilai
                </h2>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Kondisi *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Bagus", "Rusak Ringan", "Rusak Berat", "Hilang"].map(
                      (kondisi) => (
                        <span
                          key={kondisi}
                          onClick={() =>
                            !loading &&
                            setFormData((prev) => ({ ...prev, kondisi }))
                          }
                          className={`cursor-pointer rounded-full border px-4 py-1 text-xs font-medium transition ${
                            formData.kondisi === kondisi
                              ? "border-emerald-300 bg-emerald-100 font-semibold text-emerald-800"
                              : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                          }`}
                        >
                          {kondisi}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-medium text-neutral-700">
                    Status *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Digunakan", "Tersedia", "Diperbaiki"].map((status) => (
                      <span
                        key={status}
                        onClick={() =>
                          !loading &&
                          setFormData((prev) => ({ ...prev, status }))
                        }
                        className={`cursor-pointer rounded-full border px-4 py-1 text-xs font-medium transition ${
                          formData.status === status
                            ? "border-neutral-900 bg-neutral-900 font-semibold text-white"
                            : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                  <p className="pt-1 text-[10px] text-neutral-400">
                    Kondisi Rusak Berat atau Hilang tidak bisa berstatus
                    Digunakan (BR-07).
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                  <InputField
                    label="Harga perolehan"
                    name="hargaPerolehan"
                    value={rupiahInput(formData.hargaPerolehan)}
                    onChange={(e) => {
                      const rawNumber = numericValue(e.target.value)
                      setFormData((prev) => ({
                        ...prev,
                        hargaPerolehan: rawNumber,
                      }))
                    }}
                    disabled={loading}
                    placeholder="Masukan angka harga"
                    helperText="Ketik nominal angka, format Rp. otomatis disesuaikan."
                  />
                  <InputField
                    label="Tanggal perolehan"
                    type="date"
                    name="tanggalPerolehan"
                    value={formData.tanggalPerolehan}
                    onChange={handleChange}
                    disabled={loading}
                    helperText="Tidak boleh melebihi hari ini (BR-05)."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <SelectedField
                      label="Lokasi"
                      name="lokasi"
                      value={formData.lokasi}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-white"
                      options={[
                        {
                          label: loadingMasterData
                            ? "Memuat data..."
                            : "Pilih salah satu...",
                          value: "",
                        },
                        ...locations.map((l) => ({
                          label: l.name,
                          value: String(l.id),
                        })),
                      ]}
                    />
                  </div>

                  <InputField
                    label="Pemegang aset"
                    name="pemegangAset"
                    value={formData.pemegangAset}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Masukan nama karyawan atau tim"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700">
                    Keterangan barang
                  </label>
                  <Textarea
                    rows={3}
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Spesifikasi, nomor seri, catatan kondisi per unit..."
                    className="text-xs"
                  />
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="space-y-3 p-6">
                <label className="block text-xs font-semibold text-neutral-900">
                  Kode aset
                </label>
                <input
                  type="text"
                  name="kodeAset"
                  value={formData.kodeAset}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Otomatis di-generate jika dikosongkan"
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-800 disabled:opacity-50"
                />
                <p className="text-[10px] text-neutral-400">
                  Kosongkan agar dibuat otomatis oleh server dengan format
                  NNN/INC-GA/M/YY (BR-01).
                </p>
              </Card>

              <Card className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-900">
                    Foto aset
                  </label>
                  <span className="text-xs text-neutral-400">
                    {fotos.length} dari 5
                  </span>
                </div>

                <label
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex cursor-pointer flex-col items-center justify-center space-y-1 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-6 text-center transition hover:bg-indigo-50/50"
                >
                  <div className="text-xs font-medium text-indigo-600">
                    Tarik file ke sini
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    JPG · PNG · WEBP – maks. 2 MB per file
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    disabled={loading}
                    onChange={handleFileChange}
                  />
                </label>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {fotos.map((file, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (index !== 0) {
                          setSelectedPhotoIndexForPrimary(index)
                        }
                      }}
                      className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-neutral-100 shadow-2xs transition ${
                        index !== 0
                          ? "cursor-pointer border-neutral-200 hover:ring-2 hover:ring-neutral-400"
                          : "border-amber-400 ring-2 ring-amber-300"
                      }`}
                      title={
                        index !== 0
                          ? "Klik untuk jadikan foto utama"
                          : "Foto utama"
                      }
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-neutral-900 shadow-2xs">
                          Utama
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePhoto(index)
                        }}
                        disabled={loading}
                        className="absolute top-1 right-2 cursor-pointer text-base font-normal text-neutral-400 transition hover:text-neutral-700"
                        title="Hapus foto"
                      >
                        &times;
                      </button>
                    </div>
                  ))}

                  {fotos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition hover:border-indigo-300 hover:text-indigo-500 disabled:opacity-50"
                    >
                      <span className="text-xl font-light">+</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-neutral-400">
                  Foto pertama otomatis jadi foto utama (BR-10). Klik foto lain
                  untuk menjadikannya foto utama.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={selectedPhotoIndexForPrimary !== null}
        onOpenChange={(open) => !open && setSelectedPhotoIndexForPrimary(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              Jadikan Foto Utama?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah anda yakin akan menjadikan foto ini sebagai foto utama
              aset?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedPhotoIndexForPrimary(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmSetPrimary}
            >
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="sticky bottom-0 z-20 flex flex-col items-center justify-between gap-4 border-t border-hairline bg-card/90 px-6 py-4 shadow-md backdrop-blur-md sm:flex-row lg:px-8">
        <span className="text-xs text-muted-foreground">
          Perubahan belum tersimpan
        </span>
        <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate({ to: "/asset" })}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            {loading ? "Menyimpan..." : "Simpan & Tambah Lagi"}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Aset"}
          </Button>
        </div>
      </div>
    </form>
  )
}
