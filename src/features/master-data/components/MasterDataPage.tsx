import { useEffect, useState, useCallback } from 'react'
import { MasterDataView, type UIMasterDataItem } from './MasterDataView'
import { masterDataService, type MasterDataItem as ServiceItem } from '@/services/masterDataService'
import { toast } from "sonner"

// Helper function untuk mengambil pesan apa adanya dari backend
const formatErrorMessage = (error: any, fallbackMessage: string): string => {
  const rawMsg = 
    error.response?.data?.message || 
    error.response?.data?.error || 
    error.message || 
    ''

  // Jika backend memberikan pesan, langsung tampilkan apa adanya
  if (rawMsg) {
    return rawMsg
  }

  return fallbackMessage
}

export default function MasterDataPage() {
  const [categories, setCategories] = useState<UIMasterDataItem[]>([])
  const [merekList, setMerekList] = useState<UIMasterDataItem[]>([])
  const [lokasiList, setLokasiList] = useState<UIMasterDataItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // State untuk Modal Konfirmasi Hapus Custom
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'kategori' | 'merek' | 'lokasi'
    id: string | number
  } | null>(null)

  const mapToUIFormat = (items: ServiceItem[]): UIMasterDataItem[] => {
    return items.map((item) => ({
      id: item.id,
      nama: item.name,
      kode: item.code || '-',
      deskripsi: item.description || '',
      asetCount: item.asset_count ?? item.assetCount ?? 0,
    }))
  }

  const loadAllMasterData = useCallback(async () => {
    setLoading(true)
    
    try {
      const catRes = await masterDataService.getCategories().catch(() => [])
      const brandRes = await masterDataService.getBrands().catch(() => [])
      const locRes = await masterDataService.getLocations().catch(() => [])

      setCategories(mapToUIFormat(catRes))
      setMerekList(mapToUIFormat(brandRes))
      setLokasiList(mapToUIFormat(locRes))
    } catch (error: any) {
      console.error('Gagal mengambil Master Data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllMasterData()
  }, [loadAllMasterData])

  const handleAddItem = async (
    type: 'kategori' | 'merek' | 'lokasi',
    data: { nama: string; kode: string; deskripsi: string }
  ) => {
    const payload = {
      name: data.nama,
      code: data.kode,
      description: data.deskripsi,
    }

    const toastId = toast.loading(`Menyimpan ${type}...`)

    try {
      if (type === 'kategori') await masterDataService.createCategory(payload)
      else if (type === 'merek') await masterDataService.createBrand(payload)
      else if (type === 'lokasi') await masterDataService.createLocation(payload)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil ditambahkan!`, { id: toastId })
      loadAllMasterData()
    } catch (error: any) {
      console.error('Gagal menyimpan data:', error)
      const cleanMessage = formatErrorMessage(error, `Gagal menambahkan ${type}`)
      toast.error(cleanMessage, { id: toastId })
    }
  }

  const handleEditItem = async (
    type: 'kategori' | 'merek' | 'lokasi',
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
      if (type === 'kategori') await masterDataService.updateCategory(numId, payload)
      else if (type === 'merek') await masterDataService.updateBrand(numId, payload)
      else if (type === 'lokasi') await masterDataService.updateLocation(numId, payload)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil diperbarui!`, { id: toastId })
      loadAllMasterData()
    } catch (error: any) {
      console.error('Gagal memperbarui data:', error)
      const cleanMessage = formatErrorMessage(error, `Gagal memperbarui ${type}`)
      toast.error(cleanMessage, { id: toastId })
    }
  }

  const handleRequestDelete = (type: 'kategori' | 'merek' | 'lokasi', id: string | number) => {
    setDeleteTarget({ type, id })
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    const { type, id } = deleteTarget
    setDeleteTarget(null)

    const toastId = toast.loading(`Menghapus ${type}...`)

    try {
      const numId = Number(id)
      if (type === 'kategori') await masterDataService.deleteCategory(numId)
      else if (type === 'merek') await masterDataService.deleteBrand(numId)
      else if (type === 'lokasi') await masterDataService.deleteLocation(numId)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus!`, { id: toastId })
      loadAllMasterData()
    } catch (error: any) {
      console.error('Gagal menghapus data:', error)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">
                Hapus {deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)}?
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus {deleteTarget.type} ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer shadow-2xs transition-all"
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