import { useState } from "react"
import { usePermission } from "@/hooks/usePermission"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Download } from "lucide-react"

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
  // Panggil permission hook untuk membatasi aksi manipulasi data import
  const { canCreateEditAsset } = usePermission()

  const [filterTab, setFilterTab] = useState<"gagal" | "semua">("gagal")

  const filteredData =
    filterTab === "gagal" ? data.filter((item) => item.isGagal) : data

  return (
    <div className="w-full space-y-6 pb-12 text-[#1C1C1E]">
      <div className="sticky top-0 z-10 mb-6 flex w-full flex-col justify-between gap-4 border-b border-neutral-200 bg-white px-4 py-3 shadow-2xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto py-1 pl-14 text-xs font-medium lg:pl-0">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isActive = step.id === currentStep
            const isUpcoming = step.id > currentStep

            return (
              <div key={step.id} className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={isUpcoming || !onStepClick}
                  onClick={() => onStepClick?.(step.id)}
                  className={`relative flex items-center gap-2 py-1 ${
                    isActive
                      ? "font-semibold text-neutral-900"
                      : "text-neutral-400"
                  } ${!isUpcoming && onStepClick ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                >
                  <span
                    className={`flex items-center justify-center rounded-full text-xs transition-colors ${
                      isCompleted
                        ? "h-5 w-5 bg-neutral-900 text-[10px] text-white"
                        : isActive
                          ? "h-6 w-6 bg-neutral-900 font-bold text-white"
                          : "h-5 w-5 bg-neutral-200 font-semibold text-neutral-600"
                    }`}
                  >
                    {isCompleted ? "✓" : step.id}
                  </span>

                  <span
                    className={
                      isActive
                        ? "text-neutral-900"
                        : isCompleted
                          ? "text-neutral-600"
                          : "text-neutral-400"
                    }
                  >
                    {step.id}. {step.label}
                  </span>

                  {/* Line indikator di bawah step aktif */}
                  {isActive && (
                    <div className="absolute right-0 -bottom-3 left-0 h-0.5 bg-neutral-900"></div>
                  )}
                </button>

                {index < STEPS.length - 1 && (
                  <span className="shrink-0 text-neutral-300">—</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Sembunyikan Tombol Unduh Template Excel jika hanya Viewer */}
        {canCreateEditAsset && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUnduhTemplate}
            className="gap-2"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            Unduh Template Excel
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Banner Peringatan jika bukan Admin/Staff GA */}
        {!canCreateEditAsset && (
          <Alert variant="warning">
            <AlertDescription>
              <strong>Mode Pratinjau (Read-Only):</strong> Akun Anda tidak
              memiliki izin untuk menyimpan atau mengunggah data aset baru.
            </AlertDescription>
          </Alert>
        )}

        <Card className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Pratinjau import
            </h1>
            <p className="mt-1 text-xs break-all text-muted-foreground">
              {fileName} · {fileInfo}
            </p>
          </div>

          {/* Sembunyikan Aksi Ganti File & Simpan jika Viewer */}
          {canCreateEditAsset && (
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onGantiFile}
              >
                Ganti file
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onSimpanValid}
                disabled={stats.siapSimpan === 0}
              >
                Simpan {stats.siapSimpan} baris valid
              </Button>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="space-y-1 border-[#A7F3D0] bg-[#ECFDF5] p-5">
            <span className="text-xs font-medium text-[#065F46]">
              Siap disimpan
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-[#064E3B]">
                {stats.siapSimpan}
              </span>
              <span className="text-xs font-medium text-[#047857]">
                baris valid
              </span>
            </div>
          </Card>

          <Card className="space-y-1 border-[#FECDD3] bg-[#FFF1F2] p-5">
            <span className="text-xs font-medium text-[#9F1239]">Gagal</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-[#881337]">
                {stats.gagal}
              </span>
              <span className="text-xs font-medium text-[#BE123C]">
                butuh koreksi
              </span>
            </div>
          </Card>

          <Card className="space-y-1 border-[#FDE68A] bg-[#FEF3C7] p-5">
            <span className="text-xs font-medium text-[#92400E]">
              Dinormalkan
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-[#78350F]">
                {stats.dinormalkan}
              </span>
              <span className="text-xs font-medium text-[#B45309]">
                harga teks → angka
              </span>
            </div>
          </Card>

          <Card className="space-y-1 p-5">
            <span className="text-xs font-medium text-muted-foreground">
              Diabaikan
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold text-foreground">
                {stats.diabaikan}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                baris header ulang
              </span>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b border-hairline p-5 sm:flex-row sm:items-center">
            <p className="text-xs font-medium text-foreground">
              <span className="font-bold">{stats.gagal} baris gagal</span> —
              Koreksi langsung di tabel ini, atau lanjutkan tanpa baris
              tersebut.
            </p>
            <div className="flex items-center gap-1 self-start rounded-xl bg-muted p-1 text-xs sm:self-auto">
              <Button
                type="button"
                variant={filterTab === "gagal" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterTab("gagal")}
                className="h-8 text-xs"
              >
                Hanya yang gagal ({stats.gagal})
              </Button>
              <Button
                type="button"
                variant={filterTab === "semua" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setFilterTab("semua")}
                className="h-8 text-xs"
              >
                Semua baris ({data.length})
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table className="w-full min-w-175">
              <TableHeader>
                <TableRow className="border-b border-hairline bg-muted/50">
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Baris
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Kode
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Item
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Harga di File
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Dibaca Jadi
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Alasan Gagal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="px-6 py-4 font-mono text-muted-foreground">
                        {row.baris}
                      </TableCell>
                      <TableCell
                        className={`px-6 py-4 font-mono ${row.kode === "kosong" ? "text-muted-foreground italic" : "text-foreground"}`}
                      >
                        {row.kode}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-semibold text-foreground">
                        {row.item}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground">
                        {row.hargaFile}
                      </TableCell>
                      <TableCell
                        className={`px-6 py-4 font-mono ${row.dibacaJadi.includes("-") ? "font-bold text-destructive" : "text-foreground"}`}
                      >
                        {row.dibacaJadi}
                      </TableCell>
                      <TableCell className="px-6 py-4 font-medium text-destructive">
                        {row.alasanGagal}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      Tidak ada data yang perlu ditampilkan untuk filter ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
