import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MasterDataView, type UIMasterDataItem } from "./MasterDataView"
import {
  masterDataService,
  type MasterDataItem as ServiceItem,
} from "@/services/masterDataService"
import { toast } from "sonner"

// Helper function untuk mengambil pesan apa adanya dari backend
type ApiErrorLike = {
  message?: string
  response?: {
    data?: {
      error?: string
      message?: string
    }
  }
}

const formatErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  const apiError = error as ApiErrorLike
  const rawMsg =
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    apiError.message ||
    ""

  // Jika backend memberikan pesan, langsung tampilkan apa adanya
  if (rawMsg) {
    return rawMsg
  }

  return fallbackMessage
}

export default function MasterDataPage() {
  // State untuk Modal Konfirmasi Hapus Custom
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "kategori" | "merek" | "lokasi"
    id: string | number
  } | null>(null)

  const mapToUIFormat = (items: ServiceItem[]): UIMasterDataItem[] => {
    return items.map((item) => ({
      id: item.id,
      nama: item.name,
      kode: item.code || "-",
      deskripsi: item.description || "",
      asetCount: item.asset_count ?? item.assetCount ?? 0,
    }))
  }

  const {
    data: masterData,
    isLoading: loading,
    refetch: loadAllMasterData,
  } = useQuery({
    queryKey: ["master-data"],
    queryFn: async () => {
      const [catRes, brandRes, locRes] = await Promise.all([
        masterDataService.getCategories().catch(() => []),
        masterDataService.getBrands().catch(() => []),
        masterDataService.getLocations().catch(() => []),
      ])

      return {
        categories: mapToUIFormat(catRes),
        merekList: mapToUIFormat(brandRes),
        lokasiList: mapToUIFormat(locRes),
      }
    },
  })

  const categories = masterData?.categories ?? []
  const merekList = masterData?.merekList ?? []
  const lokasiList = masterData?.lokasiList ?? []

  const handleAddItem = async (
    type: "kategori" | "merek" | "lokasi",
    data: { nama: string; kode: string; deskripsi: string }
  ) => {
    const payload = {
      name: data.nama,
      code: data.kode,
      description: data.deskripsi,
    }

    const toastId = toast.loading(`Menyimpan ${type}...`)

    try {
      if (type === "kategori") await masterDataService.createCategory(payload)
      else if (type === "merek") await masterDataService.createBrand(payload)
      else if (type === "lokasi")
        await masterDataService.createLocation(payload)

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} berhasil ditambahkan!`,
        { id: toastId }
      )
      await loadAllMasterData()
    } catch (error: unknown) {
      console.error("Gagal menyimpan data:", error)
      const cleanMessage = formatErrorMessage(
        error,
        `Gagal menambahkan ${type}`
      )
      toast.error(cleanMessage, { id: toastId })
    }
  }

  const handleEditItem = async (
    type: "kategori" | "merek" | "lokasi",
    id: string | number,
    data: { nama: string; kode: string; deskripsi: string }
  ) => {
    const payload = {
      name: data.nama,
      code: data.kode,
      description: data.deskripsi,
    }

    const toastId = toast.loading(`Memperbarui ${type}...`)

    try {
      const numId = Number(id)
      if (type === "kategori")
        await masterDataService.updateCategory(numId, payload)
      else if (type === "merek")
        await masterDataService.updateBrand(numId, payload)
      else if (type === "lokasi")
        await masterDataService.updateLocation(numId, payload)

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} berhasil diperbarui!`,
        { id: toastId }
      )
      await loadAllMasterData()
    } catch (error: unknown) {
      console.error("Gagal memperbarui data:", error)
      const cleanMessage = formatErrorMessage(
        error,
        `Gagal memperbarui ${type}`
      )
      toast.error(cleanMessage, { id: toastId })
    }
  }

  const handleRequestDelete = (
    type: "kategori" | "merek" | "lokasi",
    id: string | number
  ) => {
    setDeleteTarget({ type, id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    const { type, id } = deleteTarget
    setDeleteTarget(null)

    const toastId = toast.loading(`Menghapus ${type}...`)

    try {
      const numId = Number(id)
      if (type === "kategori") await masterDataService.deleteCategory(numId)
      else if (type === "merek") await masterDataService.deleteBrand(numId)
      else if (type === "lokasi") await masterDataService.deleteLocation(numId)

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus!`,
        { id: toastId }
      )
      await loadAllMasterData()
    } catch (error: unknown) {
      console.error("Gagal menghapus data:", error)
      const cleanMessage = formatErrorMessage(error, `Gagal menghapus ${type}`)
      toast.error(cleanMessage, { id: toastId })
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-xs font-medium text-neutral-500">
        Memuat data master...
      </div>
    )
  }

  return (
    <>
      <MasterDataView
        categories={categories}
        merekList={merekList}
        lokasiList={lokasiList}
        onAddItem={handleAddItem}
        onEditItem={handleEditItem}
        onDelete={handleRequestDelete}
      />

      {/* MODAL KONFIRMASI HAPUS CUSTOM (TANPA IKON) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/40 p-4 backdrop-blur-xs duration-200 fade-in">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">
                Hapus{" "}
                {deleteTarget.type.charAt(0).toUpperCase() +
                  deleteTarget.type.slice(1)}
                ?
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                Apakah Anda yakin ingin menghapus {deleteTarget.type} ini?
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-rose-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
