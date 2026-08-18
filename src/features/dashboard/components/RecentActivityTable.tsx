import React from 'react'

export interface ActivityItem {
  id: string
  action: 'Tambah' | 'Ubah' | 'Hapus' | 'Mutasi'
  assetCode: string
  description: React.ReactNode
  actor: string
  time: string
}
const DUMMY_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    action: 'Tambah',
    assetCode: '896/INC-GA/8/26',
    description: 'Monitor LG 24MK430H - 2 Unit - Redaksi L3',
    actor: 'Rizky Saputra • Admin GA',
    time: '05/08/2026 09.12',
  },
  {
    id: '2',
    action: 'Ubah',
    assetCode: '853/INC-GA/1/26',
    description: (
      <>
        Kondisi Bagus → <strong className="text-rose-600">Rusak Berat</strong> • Status → Diperbaiki
      </>
    ),
    actor: 'Dewi Anggraini • Staff GA',
    time: '05/08/2026 08.47',
  },
  {
    id: '3',
    action: 'Hapus',
    assetCode: '847/INC-GA/1/26',
    description: 'Alasan: duplikat baris 41-51 hasil migrasi',
    actor: 'Rizky Saputra • Admin GA',
    time: '05/08/2026 08.20',
  },
  {
    id: '4',
    action: 'Mutasi',
    assetCode: '818/INC-GA/1/26',
    description: 'Studio L2 → Ruang Server L2 - pemegang Budi H.',
    actor: 'Dewi Anggraini • Staff GA',
    time: '04/08/2026 16.31',
  },
]
const ACTION_BADGE_STYLES: Record<ActivityItem['action'], string> = {
  Tambah: 'bg-teal-100 text-teal-800',
  Ubah: 'bg-amber-100 text-amber-800',
  Hapus: 'bg-rose-100 text-rose-800',
  Mutasi: 'bg-purple-100 text-purple-800',
}

interface RecentActivityTableProps {
  data?: ActivityItem[]
}

export function RecentActivityTable({ data = DUMMY_ACTIVITIES }: RecentActivityTableProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-900">
          10 aktivitas terakhir <span className="text-neutral-400 font-normal">FR-005</span>
        </h3>
        <button className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
          Lihat audit log →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/50 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Aksi</th>
              <th className="py-3 px-4">Kode Aset</th>
              <th className="py-3 px-4">Ringkasan Perubahan</th>
              <th className="py-3 px-4">Pelaku</th>
              <th className="py-3 px-4 text-right">Waktu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-50/50 transition">
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${ACTION_BADGE_STYLES[item.action]}`}>
                    {item.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-medium text-blue-600">
                  {item.assetCode}
                </td>
                <td className="py-3 px-4 text-neutral-600">
                  {item.description}
                </td>
                <td className="py-3 px-4 font-medium">
                  {item.actor}
                </td>
                <td className="py-3 px-4 text-right text-neutral-400 text-[11px]">
                  {item.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}