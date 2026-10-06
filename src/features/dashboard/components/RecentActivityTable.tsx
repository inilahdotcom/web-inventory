import { useNavigate } from "@tanstack/react-router"

export interface ActivityItem {
  id: number
  entity_type: string
  entity_id: string
  action: string
  changed_by: string
  created_at: string
}

const ACTION_BADGE_STYLES: Record<string, string> = {
  CREATE: "bg-teal-100 text-teal-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-rose-100 text-rose-800",
  RESTORE: "bg-purple-100 text-purple-800",
}

interface RecentActivityTableProps {
  data?: ActivityItem[]
}

export function RecentActivityTable({ data = [] }: RecentActivityTableProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-900">
          10 aktivitas terakhir{" "}
          <span className="font-normal text-neutral-400">FR-005</span>
        </h3>
        <button
          type="button"
          onClick={() => navigate({ to: "/audit-log" })}
          className="cursor-pointer text-xs font-semibold text-blue-600 hover:underline"
        >
          Lihat audit log →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
              <th className="px-4 py-3">Aksi</th>
              <th className="px-4 py-3">Entitas</th>
              <th className="px-4 py-3">ID Entitas</th>
              <th className="px-4 py-3">Pelaku (User ID)</th>
              <th className="px-4 py-3 text-right">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {data.length > 0 ? (
              data.map((item) => {
                const actionKey = item.action ? item.action.toUpperCase() : ""
                const badgeStyle =
                  ACTION_BADGE_STYLES[actionKey] || "bg-gray-100 text-gray-800"

                return (
                  <tr
                    key={item.id}
                    className="transition hover:bg-neutral-50/50"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badgeStyle}`}
                      >
                        {item.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium capitalize">
                      {item.entity_type}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-blue-600">
                      {item.entity_id}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      User #{item.changed_by}
                    </td>
                    <td className="px-4 py-3 text-right text-[11px] text-neutral-400">
                      {item.created_at}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-xs text-neutral-400"
                >
                  Belum ada riwayat aktivitas terbaru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
