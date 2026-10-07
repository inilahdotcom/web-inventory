import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ShieldAlert } from "lucide-react"
import { usePermission } from "@/hooks/usePermission"
import { auditLogService } from "@/services/auditLogServices"

export interface AuditLogItem {
  id: string | number
  type: "UPDATE" | "DELETE" | "CREATE" | "IMPORT" | "RESTORE" | string
  user: {
    name: string
    role: string
    ip: string
  }
  timestamp: string
  target: string
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  description?: string
}

interface AuditLogViewProps {
  onExport?: () => void
}

export function AuditLogView({ onExport }: AuditLogViewProps) {
  // Panggil permission hook untuk membatasi akses halaman Audit Log (Khusus Admin)
  const { canViewAuditLog } = usePermission()

  // State Filter Interaktif
  const [selectedEntity, setSelectedEntity] = useState<string>("assets")
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Fetching Data dari Backend Go memakai TanStack Query
  const {
    data: logs = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "audit-logs",
      selectedEntity,
      selectedAction,
      startDate,
      endDate,
    ],
    queryFn: () =>
      auditLogService.getLogs({
        entity: selectedEntity || undefined,
        action: selectedAction || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        pageSize: 50,
      }),
    enabled: canViewAuditLog, // Mencegah request dikirim jika pengguna bukan Admin
  })

  // Style badge warna sesuai Figma
  const getBadgeStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case "UPDATE":
        return "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
      case "DELETE":
      case "PERMANENT_DELETE":
        return "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]"
      case "CREATE":
        return "bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]"
      case "IMPORT":
      case "RESTORE":
        return "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]"
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200"
    }
  }

  // Tampilan jika pengguna BUKAN Admin (Staff GA / Viewer)
  if (!canViewAuditLog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50/50 p-4 text-[#1C1C1E]">
        <div className="flex max-w-md flex-col items-center rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-2xs">
          <div className="grid size-12 place-items-center rounded-full bg-rose-100 text-rose-600">
            <ShieldAlert size={24} />
          </div>
          <h1 className="mt-4 text-lg font-semibold">Akses Terbatas</h1>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Halaman Audit Log hanya dapat diakses oleh Admin sistem. Anda tidak
            memiliki izin yang cukup untuk melihat catatan aktivitas ini.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50/50 text-[#1C1C1E]">
      {/* STICKY HEADER FILTER */}
      <div className="sticky top-0 z-10 mb-6 flex w-full flex-col justify-between gap-4 border-b border-neutral-200/80 bg-white/90 px-4 py-3 shadow-2xs backdrop-blur-md sm:px-6 lg:px-8 xl:flex-row xl:items-center">
        <div className="no-scrollbar w-full overflow-x-auto pb-1 pl-14 lg:pl-0 xl:pb-0">
          <div className="flex min-w-max items-center gap-2 text-xs">
            {/* Filter Entitas */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 font-medium shadow-2xs">
              <span className="text-neutral-500">Entitas:</span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="cursor-pointer bg-transparent font-semibold text-neutral-900 outline-none"
              >
                <option value="">Semua</option>
                <option value="assets">assets</option>
                <option value="categories">categories</option>
                <option value="brands">brands</option>
                <option value="locations">locations</option>
              </select>
            </div>

            {/* Filter Aksi */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 font-medium shadow-2xs">
              <span className="text-neutral-500">Aksi:</span>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="cursor-pointer bg-transparent font-semibold text-neutral-900 outline-none"
              >
                <option value="">Semua</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="RESTORE">RESTORE</option>
              </select>
            </div>

            {/* Filter Tanggal */}
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 font-medium shadow-2xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-semibold text-neutral-900 outline-none"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-semibold text-neutral-900 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-2 text-xs font-medium text-[#78350F] shadow-2xs">
          Hanya baca — log tidak dapat diubah atau dihapus
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pt-2 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Audit log
            </h1>
            <p className="mt-0.5 text-xs text-neutral-400">
              {logs.length} catatan ditampilkan dari database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="cursor-pointer rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onExport}
              className="cursor-pointer rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              Export log
            </button>
          </div>
        </div>

        {/* State Handler */}
        {isLoading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500">
            Memuat audit log dari database...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-12 text-center text-xs text-rose-600">
            Gagal mengambil audit log. Pastikan server backend berjalan.
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-500">
            Belum ada rekam jejak aktivitas pada filter ini.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              // Pemisah target entitas dan kode aset
              const targetParts = log.target
                ? log.target.split("·")
                : ["assets", ""]
              const entityName = targetParts[0]?.trim() || "assets"
              const targetCode = targetParts[1]?.trim() || ""

              return (
                <div
                  key={log.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-2xs md:flex-row"
                >
                  {/* KOLOM KIRI: User Info, Action Badge & Timestamp */}
                  <div className="w-full shrink-0 space-y-1.5 md:w-56">
                    <span
                      className={`inline-block rounded-md border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${getBadgeStyle(
                        log.type
                      )}`}
                    >
                      {log.type}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        {log.user.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        {log.user.role} · {log.user.ip}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-neutral-400">
                        {log.timestamp}
                      </p>
                    </div>
                  </div>

                  {/* KOLOM KANAN: Target & Diff / Description */}
                  <div className="flex-1 space-y-3">
                    {/* Target Label */}
                    <div className="flex justify-start font-mono text-xs font-semibold text-neutral-700 md:justify-start">
                      <span className="font-normal text-neutral-500">
                        {entityName} ·{" "}
                      </span>
                      <span className="ml-1 text-[#3B82F6]">{targetCode}</span>
                    </div>

                    {/* Body Content: JSON Diff vs Text Description */}
                    {log.oldValues || log.newValues ? (
                      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                        {/* OLD VALUES BOX */}
                        <div className="space-y-1 rounded-xl border border-neutral-200/80 bg-[#FAFAFA] p-3 font-mono text-[11px]">
                          <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                            OLD_VALUES
                          </div>
                          <pre className="leading-relaxed whitespace-pre-wrap text-[#991B1B]">
                            {log.oldValues
                              ? JSON.stringify(log.oldValues, null, 2)
                              : "(Kosong)"}
                          </pre>
                        </div>

                        {/* NEW VALUES BOX */}
                        <div className="space-y-1 rounded-xl border border-neutral-200/80 bg-[#FAFAFA] p-3 font-mono text-[11px]">
                          <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                            NEW_VALUES
                          </div>
                          <pre className="leading-relaxed whitespace-pre-wrap text-[#065F46]">
                            {log.newValues
                              ? JSON.stringify(log.newValues, null, 2)
                              : "(Kosong)"}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 text-xs leading-relaxed text-neutral-600">
                        {log.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
