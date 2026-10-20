import { useQuery } from "@tanstack/react-query"
import { profileService } from "@/services/profileService"

export function usePermission() {
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.get(),
  })

  // Mengambil string role langsung dari DB (misal: "admin", "staff_ga", "viewer")
  const role = profile?.attributes?.role?.toLowerCase() || ""

  const isAdmin = role === "admin"
  const isStaffGA = role === "staff_ga"
  const isViewer = role === "viewer"

  return {
    role,
    // Matriks Hak Akses Frontend
    canViewAsset: isAdmin || isStaffGA || isViewer, // Lihat daftar & detail aset
    canCreateEditAsset: isAdmin || isStaffGA, // Tambah / ubah aset
    canDeleteRestoreAsset: isAdmin, // Hapus permanen / restore
    canImportExcel: isAdmin || isStaffGA, // Import Excel
    canExportLaporan: isAdmin || isStaffGA || isViewer, // Export laporan
    canManageAdminData: isAdmin, // Kelola master data, pengguna, audit log

    // Properti Spesifik untuk Audit Log & Master Data (Memperbaiki Error TypeScript)
    canViewAuditLog: isAdmin, // Akses halaman & data Audit Log
    canManageMasterData: isAdmin, // Tambah, Edit, Hapus Master Data
  }
}
