

export function RecentActivityTable() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-neutral-900">10 aktivitas terakhir <span className="text-neutral-400 font-normal">FR-005</span></h3>
        <button className="text-xs text-blue-600 font-semibold hover:underline">Lihat audit log →</button>
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
            <tr className="hover:bg-neutral-50/50 transition">
              <td className="py-3 px-4"><span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-md">Tambah</span></td>
              <td className="py-3 px-4 font-mono font-medium text-blue-600">896/INC-GA/8/26</td>
              <td className="py-3 px-4 text-neutral-600">Monitor LG 24MK430H - 2 Unit - Redaksi L3</td>
              <td className="py-3 px-4 font-medium">Rizky Saputra • Admin GA</td>
              <td className="py-3 px-4 text-right text-neutral-400 text-[11px]">05/08/2026 09.12</td>
            </tr>
            <tr className="hover:bg-neutral-50/50 transition">
              <td className="py-3 px-4"><span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">Ubah</span></td>
              <td className="py-3 px-4 font-mono font-medium text-blue-600">853/INC-GA/1/26</td>
              <td className="py-3 px-4 text-neutral-600">Kondisi Bagus → <strong className="text-rose-600">Rusak Berat</strong> • Status → Diperbaiki</td>
              <td className="py-3 px-4 font-medium">Dewi Anggraini • Staff GA</td>
              <td className="py-3 px-4 text-right text-neutral-400 text-[11px]">05/08/2026 08.47</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}