import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { AssetImportPreviewView } from './AssetImportPreviewView'
import type { ImportItem as UIImportItem, ImportStep } from './AssetImportPreviewView'
import { importService } from '@/services/importDataService'
import type { ImportPreviewResponse } from '@/services/importDataService'
import { toast } from 'sonner'

const formatImportErrorMessage = (error: any, fallbackMessage: string): string => {
  const rawMsg = error.response?.data?.error || error.response?.data?.message || error.message || ''

  if (rawMsg.includes('Duplicate entry') || rawMsg.includes('1062') || rawMsg.includes('duplicate key')) {
    return 'Terdapat kode aset duplikat yang sudah terdaftar di sistem.'
  }

  if (rawMsg.includes('invalid file format') || rawMsg.includes('zip: not a valid zip file') || rawMsg.includes('excel')) {
    return 'Format file Excel tidak valid atau rusak. Pastikan menggunakan file .xlsx yang benar.'
  }

  if (rawMsg.includes('foreign key constraint') || rawMsg.includes('1451')) {
    return 'Sebagian data mereferensikan master data (kategori/merek/lokasi) yang tidak ditemukan.'
  }

  if (rawMsg && !rawMsg.includes('sql:') && !rawMsg.includes('Error 10') && !rawMsg.includes('panic:')) {
    return rawMsg
  }

  return fallbackMessage
}

const STEPS = [
  { id: 1 as const, label: "Unggah file" },
  { id: 2 as const, label: "Pratinjau & koreksi" },
  { id: 3 as const, label: "Simpan" },
]

export default function AssetImportPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewResponse, setPreviewResponse] = useState<ImportPreviewResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [executing, setExecuting] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<ImportStep>(1)

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mapToUIImportItems = (
    validData: any[],
    errors: any[]
  ): UIImportItem[] => {
    const list: UIImportItem[] = []

    const formatFailureReason = (reason: string, column?: string) => {
      if (!reason) return 'Gagal validasi data'

      const lowerReason = reason.toLowerCase()
      const lowerCol = (column || '').toLowerCase()

      if (
        lowerReason.includes('nama') ||
        lowerReason.includes('name') ||
        lowerCol.includes('nama')
      ) {
        return 'Nama barang wajib diisi — Silakan isi nama/deskripsi aset pada file Excel.'
      }

      if (
        lowerReason.includes('sudah terdaftar') ||
        lowerReason.includes('duplicate') ||
        lowerReason.includes('sudah ada')
      ) {
        return 'Kode aset sudah terdaftar — Silakan gunakan kode unik yang belum dipakai, atau kosongkan kolom kode agar sistem membuatkan kode otomatis.'
      }

      if (
        (lowerReason.includes('wajib diisi') || lowerReason.includes('kosong')) &&
        (lowerReason.includes('kode') || lowerCol.includes('kode'))
      ) {
        return 'Kode aset tidak valid — Isi kode unik, atau kosongkan jika ingin auto-generate oleh sistem.'
      }

      return reason
    }

    errors?.forEach((err: any, idx: number) => {
      const rawReason = err.reason ?? err.Reason ?? 'Gagal validasi'

      list.push({
        id: `err-${idx}`,
        baris: err.row ?? err.Row ?? idx + 1,
        kode: err.code ?? err.Code ?? 'kosong',
        item: err.item ?? err.Item ?? `Baris ${err.row ?? err.Row ?? idx + 1} (${err.column ?? err.Column ?? 'Kode Aset'})`,
        hargaFile: err.price ?? err.Price ?? '–',
        dibacaJadi: 'null',
        alasanGagal: formatFailureReason(rawReason),
        isGagal: true,
      })
    })

    validData?.forEach((item: any, idx: number) => {
      const rowNum = item.rowNumber ?? item.row_number ?? item.RowNumber ?? idx + 1
      const assetCode = item.assetCode ?? item.asset_code ?? item.AssetCode ?? 'kosong'
      const name = item.name ?? item.Name ?? 'Tanpa Nama'
      const price = item.price ?? item.Price ?? item.purchasePrice ?? 0
      const isDup = item.isDuplicate ?? item.is_duplicate ?? item.IsDuplicate ?? false

      list.push({
        id: `valid-${idx}`,
        baris: rowNum,
        kode: assetCode,
        item: name,
        hargaFile: price ? `Rp ${Number(price).toLocaleString('id-ID')}` : '–',
        dibacaJadi: String(price || 0),
        alasanGagal: isDup
          ? 'Kode aset sudah terdaftar — Silakan gunakan kode unik yang belum dipakai, atau kosongkan kolom kode agar sistem membuatkan kode otomatis.'
          : '-',
        isGagal: isDup,
      })
    })

    return list.sort((a, b) => Number(a.baris) - Number(b.baris))
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Format file harus berupa .xlsx atau .xls')
      return
    }

    setSelectedFile(file)
    setLoading(true)
    // 👉 Teks kustom saat membaca file di frontend
    const toastId = toast.loading('Sedang memindai dan memvalidasi file Excel...')

    try {
      const res = await importService.previewImport(file)
      setPreviewResponse(res)
      setCurrentStep(2)
      toast.success('File Excel berhasil diurai!', { id: toastId })
    } catch (error: any) {
      console.error('Gagal preview file excel:', error)
      const cleanMessage = formatImportErrorMessage(error, 'Gagal memproses file Excel')
      toast.error(cleanMessage, { id: toastId })
      setPreviewResponse(null)
      setCurrentStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleGantiFile = () => {
    setSelectedFile(null)
    setPreviewResponse(null)
    setCurrentStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleStepClick = (step: ImportStep) => {
    if (step === 1) {
      handleGantiFile()
    }
  }

  const handleUnduhTemplate = async () => {
    const toastId = toast.loading('Mengunduh template...')
    try {
      const blob = await importService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Template_Import_Aset.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Template berhasil diunduh', { id: toastId })
    } catch (error: any) {
      const cleanMessage = formatImportErrorMessage(error, 'Gagal mengunduh template Excel')
      toast.error(cleanMessage, { id: toastId })
    }
  }

  const handleRequestSimpanValid = () => {
    const rawData = (previewResponse as any)
    const validItems = previewResponse?.validData ?? rawData?.valid_data ?? rawData?.ValidData ?? []

    if (!validItems || validItems.length === 0) {
      toast.error('Tidak ada data valid yang dapat disimpan!')
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSimpanValid = async () => {
    setShowConfirmModal(false)

    const rawData = (previewResponse as any)
    const validItems = previewResponse?.validData ?? rawData?.valid_data ?? rawData?.ValidData ?? []

    if (!validItems || validItems.length === 0) return

    setExecuting(true)
    setCurrentStep(3)
    
    // 👉 Teks kustom yang tampil di frontend saat proses penyimpanan
    const toastId = toast.loading('Sedang menyimpan data aset ke sistem...')

    try {
      const result = await importService.executeImport({
        mode: 'skip',
        items: validItems,
      })

      queryClient.invalidateQueries({ queryKey: ['assets'] })

      const totalImported = result.insertedCount || validItems.length
      toast.success(`Berhasil mengimpor ${totalImported} aset baru!`, { id: toastId })

      const resAny = result as any
      const importedData = resAny.data || resAny.items || resAny.insertedAssets || []
      let newAssetCodes: string[] = []

      if (Array.isArray(importedData) && importedData.length > 0) {
        newAssetCodes = importedData
          .map((item: any) => item.code || item.assetCode || item.asset_code || item.AssetCode)
          .filter(Boolean)
      }

      setSelectedFile(null)
      setPreviewResponse(null)
      setCurrentStep(1)

      navigate({
        to: '/asset',
        search: {
          highlight: newAssetCodes.length > 0 ? newAssetCodes.join(',') : undefined,
          newCount: totalImported,
        },
      })
    } catch (error: any) {
      console.error('Gagal menyimpan data import:', error)
      const cleanMessage = formatImportErrorMessage(error, 'Gagal menyimpan data import ke database')
      toast.error(cleanMessage, { id: toastId })
      setCurrentStep(2)
    } finally {
      setExecuting(false)
    }
  }

  if (previewResponse && !loading && !executing) {
    const rawResponse = previewResponse as any
    const totalRows = previewResponse.totalRows ?? rawResponse.total_rows ?? rawResponse.TotalRows ?? 0
    const validCount = previewResponse.validCount ?? rawResponse.valid_count ?? rawResponse.ValidCount ?? 0
    const failedCount = previewResponse.failedCount ?? rawResponse.failed_count ?? rawResponse.FailedCount ?? 0
    const ignoredCount = Math.max(0, totalRows - (validCount + failedCount))

    const validDataList = previewResponse.validData ?? rawResponse.valid_data ?? rawResponse.ValidData ?? []
    const errorList = previewResponse.errors ?? rawResponse.errors ?? rawResponse.Errors ?? []

    const uiItems = mapToUIImportItems(validDataList, errorList)

    return (
      <>
        <AssetImportPreviewView
          currentStep={currentStep}
          fileName={selectedFile?.name || 'File_Import.xlsx'}
          fileInfo={`${totalRows} baris terbaca · ${selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(1) : '0.0'} MB`}
          stats={{
            siapSimpan: validCount,
            gagal: failedCount,
            dinormalkan: validCount,
            diabaikan: ignoredCount,
          }}
          data={uiItems}
          onStepClick={handleStepClick}
          onGantiFile={handleGantiFile}
          onSimpanValid={handleRequestSimpanValid}
          onUnduhTemplate={handleUnduhTemplate}
        />

        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">Simpan Data Aset?</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Apakah Anda yakin ingin menyimpan <span className="font-semibold text-neutral-800">{validCount} baris data valid</span> ini ke dalam sistem?
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSimpanValid}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer shadow-2xs transition-all"
                >
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="w-full space-y-6 pb-12 text-[#1C1C1E]">
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 sm:px-6 lg:px-8 py-3 mb-6 w-full shadow-2xs">
        <div className="flex items-center gap-3 overflow-x-auto py-1 text-xs font-medium no-scrollbar pl-14 lg:pl-0">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isActive = step.id === currentStep

            return (
              <div key={step.id} className="flex items-center gap-3 shrink-0">
                <div
                  className={`relative flex items-center gap-2 py-1 ${
                    isActive ? 'font-semibold text-neutral-900' : 'text-neutral-400'
                  }`}
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

                  <span className={isActive ? 'text-neutral-900' : 'text-neutral-400'}>
                    {step.id}. {step.label}
                  </span>

                  {isActive && (
                    <div className="absolute -bottom-3 left-0 right-0 h-0.5 bg-neutral-900"></div>
                  )}
                </div>

                {index < STEPS.length - 1 && (
                  <span className="text-neutral-300 shrink-0">—</span>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleUnduhTemplate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Unduh Template Excel
        </button>
      </div>

      {(loading || executing) ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-neutral-900">
              {/* 👉 Teks kustom pada layar loading frontend */}
              {loading ? 'Sedang membaca & memvalidasi file Excel...' : 'Sedang memproses dan menyimpan data ke sistem...'}
            </p>
            <p className="text-xs text-neutral-500">Mohon tunggu sebentar, proses sedang berlangsung.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Import Data Aset</h1>
              <p className="text-xs text-neutral-500 mt-1">
                Upload file Excel sesuai format template untuk mengunggah dan menambahkan data aset secara massal.
              </p>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer text-center ${
              isDragging
                ? 'border-neutral-900 bg-neutral-100/80 scale-[0.99]'
                : 'border-neutral-300/80 bg-white hover:border-neutral-400 hover:bg-neutral-50/60 hover:shadow-sm'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-700 shadow-2xs group-hover:scale-105 transition-transform duration-200">
              <svg className="w-7 h-7 text-neutral-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div className="mt-5 space-y-1">
              <p className="text-sm font-bold text-neutral-900">
                Pilih atau seret file Excel ke sini
              </p>
              <p className="text-xs text-neutral-500">
                Format yang didukung: <span className="font-semibold text-neutral-700">.XLSX</span> atau <span className="font-semibold text-neutral-700">.XLS</span> (Maksimal 10MB)
              </p>
            </div>

            <span className="mt-6 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl group-hover:bg-neutral-800 transition-colors shadow-2xs">
              Pilih File Dari Komputer
            </span>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-neutral-200/80 bg-white/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Langkah 1</span>
              <p className="text-xs font-semibold text-neutral-800">Unduh Template</p>
              <p className="text-[11px] text-neutral-500">Gunakan format Excel standar agar kolom terbaca dengan tepat.</p>
            </div>
            <div className="p-4 rounded-2xl border border-neutral-200/80 bg-white/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Langkah 2</span>
              <p className="text-xs font-semibold text-neutral-800">Isi & Upload</p>
              <p className="text-[11px] text-neutral-500">Isi data aset lalu upload file ke area dropzone di atas.</p>
            </div>
            <div className="p-4 rounded-2xl border border-neutral-200/80 bg-white/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Langkah 3</span>
              <p className="text-xs font-semibold text-neutral-800">Pratinjau & Simpan</p>
              <p className="text-[11px] text-neutral-500">Cek status validasi data sebelum menyimpannya ke sistem.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}