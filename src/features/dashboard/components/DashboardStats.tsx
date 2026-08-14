

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <div className="lg:col-span-2 rounded-3xl bg-[#FFD02C] p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-800">
            TOTAL NILAI ASET TERCATAT
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mt-2">
            Rp 1.421.870.000
          </h2>
          <hr className="border-neutral-900/10 my-4" />
          <p className="text-xs text-neutral-800 leading-relaxed">
            Baru <strong className="font-bold">33 dari 95 aset</strong> punya harga perolehan. Angka ini akan berubah saat 62 aset sisanya dilengkapi.
          </p>
        </div>
        <button className="w-fit px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition">
          Lengkapi 62 harga →
        </button>
      </div>

      <div className="space-y-4 flex flex-col justify-between">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm">
            <p className="text-[10px] text-neutral-400 font-medium">Jenis aset</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">84</p>
            <p className="text-[9px] text-neutral-400 mt-0.5">11 kandidat duplikat</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm">
            <p className="text-[10px] text-neutral-400 font-medium">Total unit</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">213</p>
            <p className="text-[9px] text-neutral-400 mt-0.5">Unit • Pos • Set</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm">
            <p className="text-[10px] text-neutral-400 font-medium">Tanpa foto</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">95</p>
            <p className="text-[9px] text-neutral-400 mt-0.5">Kolom FOTO kosong</p>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-900 text-white rounded-md">
              Perlu tindakan
            </span>
            <span className="text-[11px] text-rose-800 font-medium">2 aset • FR-006</span>
          </div>
          <p className="text-xs font-semibold text-rose-900">
            Keterangan mencatat "1 Unit Rusak", tetapi kondisi masih tercatat Bagus.
          </p>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-[11px] bg-white/60 p-2 rounded-xl">
              <span className="font-mono text-neutral-700">853/INC-GA/1/26 <span className="font-sans text-neutral-500">CPU Redaksi Lantai 3 - 4 Unit</span></span>
              <button className="text-rose-600 font-semibold hover:underline">Pecah record →</button>
            </div>
            <div className="flex justify-between items-center text-[11px] bg-white/60 p-2 rounded-xl">
              <span className="font-mono text-neutral-700">854/INC-GA/1/26 <span className="font-sans text-neutral-500">Monitor Redaksi - 8 Unit</span></span>
              <button className="text-rose-600 font-semibold hover:underline">Pecah record →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}