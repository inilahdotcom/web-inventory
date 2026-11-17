import { useNavigate } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export interface ActivityItem {
  id: number
  entity_type: string
  entity_id: string
  action: string
  changed_by: string
  created_at: string
  user_name?: string
}

/** Buat ringkasan perubahan berdasarkan entitas dan aksi */
function formatRingkasan(item: ActivityItem): string {
  const action = item.action?.toUpperCase()
  const entity = (item.entity_type || "").toLowerCase().trim()
  const actorName = item.changed_by?.split("·")[0]?.trim() || "User"

  // 1. Auth (Login/Logout)
  if (entity === "auth" || action === "LOGIN" || action === "LOGOUT") {
    if (action === "LOGIN") return `${actorName} berhasil login ke sistem.`
    if (action === "LOGOUT") return `${actorName} berhasil logout dari sistem.`
  }

  // 2. Export Actions
  if (action === "EXPORT_PDF") return "Mengekspor data ke file PDF."
  if (action === "EXPORT_EXCEL") return "Mengekspor data ke file Excel."

  // 3. Entity: Assets
  if (entity === "assets" || entity === "asset") {
    if (action === "CREATE") return "Aset baru berhasil ditambahkan."
    if (action === "UPDATE") return "Data informasi aset diperbarui."
    if (
      action === "DELETE" ||
      action === "SOFT_DELETE" ||
      action === "PERMANENT_DELETE" ||
      action === "BULK_DELETE"
    ) {
      return "Aset dihapus dari sistem."
    }
    if (action === "RESTORE") return "Aset berhasil dipulihkan dari arsip."
    if (action === "MOVE") return "Mutasi lokasi atau pemegang aset dicatat."
    if (action === "SPLIT" || action === "CREATE_SPLIT")
      return "Pemecahan unit aset berhasil dilakukan."
    if (action === "IMPORT" || action === "IMPORT_CREATE")
      return "Aset berhasil diimpor dari file Excel."
    if (action === "IMPORT_UPDATE")
      return "Data aset diperbarui lewat impor Excel."
  }

  // 4. Entity: Users
  if (entity === "users" || entity === "user") {
    if (action === "CREATE") return "Pengguna baru berhasil didaftarkan."
    if (action === "UPDATE") return "Data pengguna berhasil diperbarui."
    if (action === "DELETE") return "Akun pengguna dihapus dari sistem."
  }

  // 5. Entity: Categories
  if (entity === "categories" || entity === "category") {
    if (action === "CREATE") return "Kategori baru berhasil ditambahkan."
    if (action === "UPDATE") return "Nama kategori berhasil diperbarui."
    if (action === "DELETE") return "Kategori dihapus dari sistem."
  }

  // 6. Entity: Locations
  if (entity === "locations" || entity === "location") {
    if (action === "CREATE") return "Lokasi baru berhasil ditambahkan."
    if (action === "UPDATE") return "Data lokasi berhasil diperbarui."
    if (action === "DELETE") return "Lokasi dihapus dari sistem."
  }

  // 7. Entity: Stocktake
  if (entity.includes("stocktake") || entity.includes("opname")) {
    if (action === "CREATE") return "Sesi stock opname baru dibuat."
    if (action === "UPDATE") return "Pemeriksaan sesi stock opname diperbarui."
    if (action === "FINISH" || action === "SUBMIT")
      return "Sesi stock opname berhasil diselesaikan."
  }

  // Default fallback kontekstual
  const labelEntity = item.entity_type
    ? item.entity_type.charAt(0).toUpperCase() +
      item.entity_type.slice(1).toLowerCase()
    : "data"

  if (action === "CREATE" || action === "IMPORT_CREATE")
    return `Data ${labelEntity} baru ditambahkan.`
  if (action === "UPDATE" || action === "IMPORT_UPDATE")
    return `Data ${labelEntity} diperbarui.`
  if (
    action === "DELETE" ||
    action === "BULK_DELETE" ||
    action === "PERMANENT_DELETE"
  )
    return `Data ${labelEntity} dihapus.`
  if (action === "RESTORE") return `Data ${labelEntity} dipulihkan.`

  return `Aktivitas ${item.action} pada ${labelEntity}.`
}

/** Format tanggal waktu agar persis dengan format di audit log (id-ID) */
function formatTimestamp(dateStr: string): string {
  if (!dateStr) return "—"

  // Backend /dashboard/stats mengirimkan string waktu UTC seperti "2026-11-10 02:46:31" tanpa akhiran Z,
  // sedangkan /audit-logs mengirimkan ISO string lengkap seperti "2026-11-10T02:46:31Z".
  // Tambahkan 'Z' jika belum ada offset/Z agar dikonversi ke waktu lokal pengguna dengan benar.
  let isoStr = dateStr.trim()
  if (isoStr.includes(" ") && !isoStr.includes("T")) {
    isoStr = isoStr.replace(" ", "T")
  }
  if (!isoStr.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(isoStr)) {
    isoStr += "Z"
  }

  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return dateStr

  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function getActivityBadgeVariant(_action?: string) {
  void _action
  return "secondary" as const
}

interface RecentActivityTableProps {
  data?: ActivityItem[]
}

export function RecentActivityTable({ data = [] }: RecentActivityTableProps) {
  const navigate = useNavigate()

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground">
          10 aktivitas terakhir{" "}
          <span className="font-normal text-muted-foreground">FR-005</span>
        </h3>
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => navigate({ to: "/audit-log" })}
          className="h-auto p-0 font-semibold text-blue-600 hover:underline"
        >
          Lihat audit log →
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-hairline bg-muted/50">
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Aksi
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Entitas
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Ringkasan Perubahan
              </TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-semibold tracking-wider uppercase">
                Pelaku
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-[10px] font-semibold tracking-wider uppercase">
                Waktu
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => {
                return (
                  <TableRow
                    key={item.id}
                    className="transition hover:bg-muted/50"
                  >
                    <TableCell className="px-4 py-3">
                      <Badge variant={getActivityBadgeVariant(item.action)}>
                        {item.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium capitalize">
                      {item.entity_type}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {formatRingkasan(item)}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">
                      {item.changed_by}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                      {formatTimestamp(item.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-6 text-center text-xs text-muted-foreground"
                >
                  Belum ada riwayat aktivitas terbaru.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
