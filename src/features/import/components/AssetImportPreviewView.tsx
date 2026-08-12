import { useState } from 'react'

export interface ImportItem {
    id: string | number
    baris: number | string
    kode: string
    item: string
    hargaFile: string
    dibacaJadi: string
    alasanGagal: string
    isGagal?: boolean
}

interface AssetImportPreviewViewProps {
    fileName?: string
    fileInfo?: string
    stats?: {
        siapSimpan: number
        gagal: number
        dinormalkan: number
        diabaikan: number
    }
    data?: ImportItem[]
    onGantiFile?: () => void
    onSimpanValid?: () => void
    onUnduhTemplate?: () => void
}

export function AssetImportPreviewView({
    fileName = "ASET_PT__INDONESIA_NEWS_CENTER_1_Sheet1.xlsx",
    fileInfo = "95 baris terbaca · 1,2 MB",
    stats = { siapSimpan: 88, gagal: 4, dinormalkan: 33, diabaikan: 3 },
    data = [
        { id: 1, baris: 41, kode: "021/INC-GA/1/26", item: 'Macbook Pro M1 13"', hargaFile: "Rp 19.519.088", dibacaJadi: "19519088", alasanGagal: "Kode aset sudah ada di sistem – pilih Perbarui atau lewati (FR-105)", isGagal: true },
        { id: 2, baris: 42, kode: "022/INC-GA/1/26", item: "MSI GF65 Thin 10UE", hargaFile: "18.650.000", dibacaJadi: "18650000", alasanGagal: "Kode aset sudah ada di sistem – duplikat baris 22", isGagal: true },
        { id: 3, baris: 67, kode: "kosong", item: "Kabel HDMI 5m", hargaFile: "–", dibacaJadi: "null", alasanGagal: "Kode aset wajib diisi – sistem menawarkan 096/INC-GA/8/26", isGagal: true },
        { id: 4, baris: 88, kode: "088/INC-GA/1/26", item: "Kursi", hargaFile: "Rp -50.000", dibacaJadi: "-50000", alasanGagal: "Nama minimal 3 karakter (BR-06) & harga tidak boleh negatif (BR-04)", isGagal: true },
    ],
    onGantiFile,
    onSimpanValid,
    onUnduhTemplate
}: AssetImportPreviewViewProps) {
    const [filterTab, setFilterTab] = useState<'gagal' | 'semua'>('gagal')

    const filteredData = filterTab === 'gagal' ? data.filter(item => item.isGagal) : data

    return (
        <div className="w-full space-y-6 pb-12 text-[#1C1C1E]">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6 lg:px-8 py-3 mb-6 w-full shadow-xs">
                <div className="flex items-center gap-4 text-xs overflow-hidden py-1 font-medium">
                    <div className="flex items-center gap-2 text-neutral-400 shrink-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white text-[10px]">✓</span>
                        <span className="text-neutral-500">1. Unggah file</span>
                    </div>
                    <span className="text-neutral-300">—</span>

                    <div className="relative flex items-center gap-2 text-neutral-900 font-semibold shrink-0 py-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-bold">2</span>
                        <span className="text-neutral-900">2. Pratinjau & koreksi</span>
                        <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-pink-500"></div>
                    </div>
                    <span className="text-neutral-300">—</span>

                    <div className="flex items-center gap-2 text-neutral-400 shrink-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 text-xs font-semibold">3</span>
                        <span className="text-neutral-400">3. Simpan</span>
                    </div>
                </div>

                <button 
                    type="button" 
                    onClick={onUnduhTemplate}
                    className="text-xs font-medium text-blue-600 hover:underline text-left sm:text-right shrink-0"
                >
                    Unduh template Excel
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Pratinjau import</h1>
                        <p className="text-xs text-neutral-500 mt-1 break-all">{fileName} · {fileInfo}</p>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto">
                        <button 
                            type="button" 
                            onClick={onGantiFile}
                            className="rounded-xl border border-neutral-300 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-sm"
                        >
                            Ganti file
                        </button>
                        <button 
                            type="button" 
                            onClick={onSimpanValid}
                            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-medium text-white hover:bg-neutral-800 shadow-sm"
                        >
                            Simpan {stats.siapSimpan} baris valid
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-[#A7F3D0] bg-[#C3FAF5] p-5 space-y-1 shadow-sm">
                        <span className="text-xs font-medium text-[#065F46]">Siap disimpan</span>
                        <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-3xl font-bold text-[#064E3B]">{stats.siapSimpan}</span>
                            <span className="text-xs text-[#047857] font-medium">baris valid</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#FECDD3] bg-[#FFC6C6] p-5 space-y-1 shadow-sm">
                        <span className="text-xs font-medium text-[#9F1239]">Gagal</span>
                        <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-3xl font-bold text-[#881337]">{stats.gagal}</span>
                            <span className="text-xs text-[#BE123C] font-medium">butuh koreksi</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#FDE68A] bg-[#FFF8E0] p-5 space-y-1 shadow-sm">
                        <span className="text-xs font-medium text-[#92400E]">Dinormalkan</span>
                        <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-3xl font-bold text-[#78350F]">{stats.dinormalkan}</span>
                            <span className="text-xs text-[#B45309] font-medium">harga teks → angka</span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-[#FFFFFF] p-5 space-y-1 shadow-sm">
                        <span className="text-xs font-medium text-neutral-600">Diabaikan</span>
                        <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-3xl font-bold text-neutral-900">{stats.diabaikan}</span>
                            <span className="text-xs text-neutral-500 font-medium">baris header ulang</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-neutral-200 gap-3">
                        <p className="text-xs font-medium text-neutral-700">
                            <span className="font-bold text-[#1C1C1E]">{stats.gagal} baris gagal</span> — Koreksi langsung di tabel ini, atau lanjutkan tanpa baris tersebut.
                        </p>
                        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs self-start sm:self-auto shadow-inner">
                            <button
                                type="button"
                                onClick={() => setFilterTab('gagal')}
                                className={`px-4 py-1.5 rounded-lg font-medium transition-all ${filterTab === 'gagal' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                                Hanya yang gagal
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterTab('semua')}
                                className={`px-4 py-1.5 rounded-lg font-medium transition-all ${filterTab === 'semua' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                                Semua baris
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs min-w-175">
                            <thead>
                                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                                    <th className="py-3.5 px-6">Baris</th>
                                    <th className="py-3.5 px-6">Kode</th>
                                    <th className="py-3.5 px-6">Item</th>
                                    <th className="py-3.5 px-6">Harga di File</th>
                                    <th className="py-3.5 px-6">Dibaca Jadi</th>
                                    <th className="py-3.5 px-6">Alasan Gagal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 text-neutral-800">
                                {filteredData.length > 0 ? (
                                    filteredData.map((row) => (
                                        <tr key={row.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4 px-6 font-mono text-neutral-400">{row.baris}</td>
                                            <td className={`py-4 px-6 font-mono ${row.kode === 'kosong' ? 'text-neutral-400 italic' : 'text-neutral-700'}`}>{row.kode}</td>
                                            <td className="py-4 px-6 font-semibold text-neutral-900">{row.item}</td>
                                            <td className="py-4 px-6 text-neutral-500">{row.hargaFile}</td>
                                            <td className={`py-4 px-6 font-mono ${row.dibacaJadi.includes('-') ? 'text-[#600000]' : 'text-neutral-700'}`}>{row.dibacaJadi}</td>
                                            <td className="py-4 px-6 text-[#600000] font-medium">{row.alasanGagal}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-neutral-400">
                                            Tidak ada data yang ditampilkan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5 text-xs text-[#746019] shadow-sm">
                    <div>
                        <span className="font-semibold block mb-1">Normalisasi otomatis yang dijalankan</span>
                        <p className="text-[#746019] text-[11px] leading-relaxed">
                            Harga bertipe teks (Rp 19.519.088) dikonversi ke numerik · 3 baris header yang muncul ulang di tengah data dilewati · spasi ganda pada nama item dirapikan · merek kosong dibiarkan kosong, tidak diisi "LOKAL".
                        </p>
                    </div>
                    <button type="button" className="rounded-xl bg-neutral-900 text-white px-4 py-2 text-xs font-medium hover:bg-neutral-800 shrink-0 shadow-sm self-start sm:self-auto">
                        Lihat detail
                    </button>
                </div>

            </div>
        </div>
    )
}