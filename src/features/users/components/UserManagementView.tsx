export function UserManagementView() {
  return (
    <div className="flex min-h-svh min-w-0 flex-col bg-[#f7f8fa] text-[#1c1c1e]">
      {/* Header */}
      <div className="flex h-16 flex-none items-center gap-3.5 border-b border-[#e0e2e8] bg-white pr-4 pl-16 sm:pr-6 sm:pl-16 lg:px-6">
        <div className="flex h-10 w-[300px] items-center gap-[9px] rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] px-[13px]">
          <span className="text-[13px] text-[#a5a8b5]">⌕</span>
          <span className="text-[13px] text-[#a5a8b5]">Cari nama atau email…</span>
        </div>
        <span className="ml-auto flex h-10 cursor-pointer items-center rounded-full bg-[#1c1c1e] px-[19px] text-[13.5px] font-semibold text-white">
          + Tambah pengguna
        </span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-[18px] px-7 py-6">
        <div className="flex flex-col gap-[5px]">
          <h2 className="m-0 text-[28px] font-semibold tracking-[-0.6px]">Pengguna</h2>
          <span className="text-[13px] text-[#6b6f7e]">
            7 akun aktif · otorisasi selalu diperiksa di sisi server, bukan hanya disembunyikan di UI (NFR-07).
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-[#eef0f3] bg-white">
          {/* Table Header */}
          <div className="grid h-[42px] grid-cols-[1fr_260px_140px_130px_170px_120px] items-center gap-[14px] border-b border-[#e0e2e8] bg-[#f7f8fa] px-5">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Nama</span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Email</span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Peran</span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Status</span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Login terakhir</span>
              <span className="text-right text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Aksi</span>
            </div>

            {/* Row 1 */}
            <div className="grid h-[60px] grid-cols-[1fr_260px_140px_130px_170px_120px] items-center gap-[14px] border-b border-[#eef0f3] px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#ffc6c6] text-[11px] font-semibold text-[#600000]">RS</span>
                <span className="text-[13.5px] font-semibold">Rizky Saputra</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">rizky.saputra@inc.co.id</span>
              <span>
                <span className="rounded-full bg-[#1c1c1e] px-2.5 py-1 text-[11px] font-semibold text-white">Admin</span>
              </span>
              <span>
                <span className="rounded-full bg-[#c3faf5] px-2.5 py-1 text-[11px] font-semibold text-[#187574]">Aktif</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">05/08/2026 09.02</span>
              <span className="text-right text-[12.5px] text-[#c7cad5]">Akun Anda</span>
            </div>

            {/* Row 2 */}
            <div className="grid h-[60px] grid-cols-[1fr_260px_140px_130px_170px_120px] items-center gap-[14px] border-b border-[#eef0f3] px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#c3faf5] text-[11px] font-semibold text-[#187574]">DA</span>
                <span className="text-[13.5px] font-semibold">Dewi Anggraini</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">dewi.anggraini@inc.co.id</span>
              <span>
                <span className="rounded-full bg-[#f5f3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4262ff]">Staff GA</span>
              </span>
              <span>
                <span className="rounded-full bg-[#c3faf5] px-2.5 py-1 text-[11px] font-semibold text-[#187574]">Aktif</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">05/08/2026 08.41</span>
              <span className="flex justify-end gap-2.5">
                <a href="#" className="text-[12.5px] font-semibold text-[#4262ff] hover:text-[#2a41b6]">Ubah</a>
              </span>
            </div>

            {/* Row 3 */}
            <div className="grid h-[60px] grid-cols-[1fr_260px_140px_130px_170px_120px] items-center gap-[14px] border-b border-[#eef0f3] px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#fde0f0] text-[11px] font-semibold text-[#600000]">BH</span>
                <span className="text-[13.5px] font-semibold">Budi Hartono</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">budi.hartono@inc.co.id</span>
              <span>
                <span className="rounded-full bg-[#f5f3ff] px-2.5 py-1 text-[11px] font-semibold text-[#4262ff]">Staff GA</span>
              </span>
              <span>
                <span className="rounded-full bg-[#c3faf5] px-2.5 py-1 text-[11px] font-semibold text-[#187574]">Aktif</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">04/08/2026 17.20</span>
              <span className="flex justify-end gap-2.5">
                <a href="#" className="text-[12.5px] font-semibold text-[#4262ff] hover:text-[#2a41b6]">Ubah</a>
              </span>
            </div>

            {/* Row 4 */}
            <div className="grid h-[60px] grid-cols-[1fr_260px_140px_130px_170px_120px] items-center gap-[14px] border-b border-[#eef0f3] px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#fff8e0] text-[11px] font-semibold text-[#746019]">SF</span>
                <span className="text-[13.5px] font-semibold">Sari Fitriani</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">sari.fitriani@inc.co.id</span>
              <span>
                <span className="rounded-full border border-[#e0e2e8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#555a6a]">Viewer</span>
              </span>
              <span>
                <span className="rounded-full bg-[#c3faf5] px-2.5 py-1 text-[11px] font-semibold text-[#187574]">Aktif</span>
              </span>
              <span className="text-[12.5px] text-[#555a6a]">03/08/2026 11.15</span>
              <span className="flex justify-end gap-2.5">
                <a href="#" className="text-[12.5px] font-semibold text-[#4262ff] hover:text-[#2a41b6]">Ubah</a>
              </span>
            </div>

            {/* Row 5 */}
            <div className="grid h-[60px] grid-cols-[1fr_260px_140px_130px_170px_120px] items-center gap-[14px] px-5">
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#eef0f3] text-[11px] font-semibold text-[#8e91a0]">AW</span>
                <span className="text-[13.5px] font-semibold text-[#8e91a0]">Agus Wijaya</span>
              </span>
              <span className="text-[12.5px] text-[#a5a8b5]">agus.wijaya@inc.co.id</span>
              <span>
                <span className="rounded-full border border-[#e0e2e8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8e91a0]">Viewer</span>
              </span>
              <span>
                <span className="rounded-full bg-[#eef0f3] px-2.5 py-1 text-[11px] font-semibold text-[#555a6a]">Nonaktif</span>
              </span>
              <span className="text-[12.5px] text-[#a5a8b5]">12/06/2026 09.30</span>
              <span className="flex justify-end gap-2.5">
                <a href="#" className="text-[12.5px] font-semibold text-[#4262ff] hover:text-[#2a41b6]">Aktifkan</a>
              </span>
            </div>
        </div>

        {/* Matrix Container */}
        <div className="flex flex-col gap-3.5 rounded-2xl border border-[#eef0f3] bg-white p-5 overflow-x-auto">
          <div className="min-w-[600px] flex flex-col">
            <span className="text-[16px] font-semibold mb-3.5">Matriks hak akses</span>
            <div className="grid grid-cols-[1fr_110px_110px_110px] gap-0 text-[13px] text-[#1c1c1e]">
              {/* Matrix Header */}
              <span className="border-b border-[#e0e2e8] py-2 text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Fitur</span>
              <span className="border-b border-[#e0e2e8] py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Admin</span>
              <span className="border-b border-[#e0e2e8] py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Staff GA</span>
              <span className="border-b border-[#e0e2e8] py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.4px] text-[#6b6f7e]">Viewer</span>

              {/* Matrix Row 1 */}
              <span className="border-b border-[#eef0f3] py-[9px] text-[13px]">Lihat daftar &amp; detail aset</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>

              {/* Matrix Row 2 */}
              <span className="border-b border-[#eef0f3] py-[9px] text-[13px]">Tambah / ubah aset</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#c7cad5]">&ndash;</span>

              {/* Matrix Row 3 */}
              <span className="border-b border-[#eef0f3] py-[9px] text-[13px]">Hapus permanen / restore</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#c7cad5]">&ndash;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#c7cad5]">&ndash;</span>

              {/* Matrix Row 4 */}
              <span className="border-b border-[#eef0f3] py-[9px] text-[13px]">Import Excel</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#c7cad5]">&ndash;</span>

              {/* Matrix Row 5 */}
              <span className="border-b border-[#eef0f3] py-[9px] text-[13px]">Export laporan</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="border-b border-[#eef0f3] py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>

              {/* Matrix Row 6 */}
              <span className="py-[9px] text-[13px]">Kelola master data, pengguna, audit log</span>
              <span className="py-[9px] text-center text-[13px] text-[#00b473]">&#10003;</span>
              <span className="py-[9px] text-center text-[13px] text-[#c7cad5]">&ndash;</span>
              <span className="py-[9px] text-center text-[13px] text-[#c7cad5]">&ndash;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
