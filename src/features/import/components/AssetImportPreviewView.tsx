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

export type ImportStep = 1 | 2 | 3

interface AssetImportPreviewViewProps {
  currentStep?: ImportStep
  fileName?: string
  fileInfo?: string
  stats?: {
    siapSimpan: number
    gagal: number
    dinormalkan: number
    diabaikan: number
  }
  data?: ImportItem[]
  onStepClick?: (step: ImportStep) => void
  onGantiFile?: () => void
  onSimpanValid?: () => void
  onUnduhTemplate?: () => void
}

const STEPS = [
  { id: 1 as const, label: "Unggah file" },
  { id: 2 as const, label: "Pratinjau & koreksi" },
  { id: 3 as const, label: "Simpan" },
]

export function AssetImportPreviewView({
  currentStep = 2,
  fileName = "File_Import.xlsx",
  fileInfo = "0 baris terbaca",
  stats = { siapSimpan: 0, gagal: 0, dinormalkan: 0, diabaikan: 0 },
  data = [],
  onStepClick,
  onGantiFile,
  onSimpanValid,
  onUnduhTemplate,
}: AssetImportPreviewViewProps) {
  const [filterTab, setFilterTab] = useState<'gagal' | 'semua'>('gagal')

  const filteredData = filterTab === 'gagal' ? data.filter(item => item.isGagal) : data

  return (
    <div className="w-full space-y-6 pb-12 text-[#1C1C1E]">
      
      {/* STICKY HEADER STEPPER DINAMIS */}
      <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 sm:px-6 lg:px-8 py-3 mb-6 w-full shadow-2xs">
        
        <div className="flex items-center gap-3 overflow-x-auto py-1 text-xs font-medium no-scrollbar pl-14 lg:pl-0">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isActive = step.id === currentStep
            const isUpcoming = step.id > currentStep

            return (
              <div key={step.id} className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isUpcoming || !onStepClick}
                  onClick={() => onStepClick?.(step.id)}
                  className={`relative flex items-center gap-2 py-1 ${
                    isActive ? 'font-semibold text-neutral-900' : 'text-neutral-400'
                  } ${!isUpcoming && onStepClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <span
                    className={`flex items-center justify-center rounded-full text-xs transition-colors ${
                      isCompleted
                        ? 'h-5 w-5 bg-neutral-900 text-white text-[10px]'
                        : isActive
                          ? 'h-6 w-6 bg-neutral-900 text-white font-bold'
                          : 'h-5 w-5 bg-neutral-200 text-neutral-600 font-semibold'
                    }`}
                  >
                    {isCompleted ? "✓" : step.id}
                  </span>
                  
                  <span className={isActive ? 'text-neutral-900' : isCompleted ? 'text-neutral-600' : 'text-neutral-400'}>
                    {step.id}. {step.label}
                  </span>

                  {/* Line indikator di bawah step aktif */}
                  {isActive && (
                    <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-neutral-900"></div>
                  )}
                </button>

                {index < STEPS.length - 1 && (
                  <span className="text-neutral-300 shrink-0">—</span>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onUnduhTemplate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh Template Excel
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Pratinjau import</h1>
            <p className="text-xs text-neutral-500 mt-1 break-all">{fileName} · {fileInfo}</p>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button 
              type="button" 
              onClick={onGantiFile}
              className="rounded-xl border border-neutral-300 px-5 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer transition-colors"
            >
              Ganti file
            </button>
            <button 
              type="button" 
              onClick={onSimpanValid}
              disabled={stats.siapSimpan === 0}
              className={`rounded-xl px-5 py-2.5 text-xs font-medium shadow-2xs transition-all ${
                stats.siapSimpan > 0 
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer' 
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              Simpan {stats.siapSimpan} baris valid
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-medium text-[#065F46]">Siap disimpan</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-[#064E3B]">{stats.siapSimpan}</span>
              <span className="text-xs text-[#047857] font-medium">baris valid</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#FECDD3] bg-[#FFF1F2] p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-medium text-[#9F1239]">Gagal</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-[#881337]">{stats.gagal}</span>
              <span className="text-xs text-[#BE123C] font-medium">butuh koreksi</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#FDE68A] bg-[#FEF3C7] p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-medium text-[#92400E]">Dinormalkan</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-[#78350F]">{stats.dinormalkan}</span>
              <span className="text-xs text-[#B45309] font-medium">harga teks → angka</span>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-1 shadow-2xs">
            <span className="text-xs font-medium text-neutral-600">Diabaikan</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-neutral-900">{stats.diabaikan}</span>
              <span className="text-xs text-neutral-500 font-medium">baris header ulang</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-neutral-200 gap-3">
            <p className="text-xs font-medium text-neutral-700">
              <span className="font-bold text-[#1C1C1E]">{stats.gagal} baris gagal</span> — Koreksi langsung di tabel ini, atau lanjutkan tanpa baris tersebut.
            </p>
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs self-start sm:self-auto shadow-inner">
              <button
                type="button"
                onClick={() => setFilterTab('gagal')}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filterTab === 'gagal' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Hanya yang gagal ({stats.gagal})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('semua')}
                className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${filterTab === 'semua' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Semua baris ({data.length})
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
                      <td className={`py-4 px-6 font-mono ${row.dibacaJadi.includes('-') ? 'text-rose-700 font-bold' : 'text-neutral-700'}`}>{row.dibacaJadi}</td>
                      <td className="py-4 px-6 text-rose-700 font-medium">{row.alasanGagal}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      Tidak ada data yang perlu ditampilkan untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}