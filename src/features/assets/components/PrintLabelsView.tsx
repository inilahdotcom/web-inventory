import { useEffect, useState } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { QRCodeSVG } from "qrcode.react"
import { Printer, ArrowLeft } from "lucide-react"
import { assetService } from "@/services/assetServices"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PrintLabelsView() {
  const navigate = useNavigate()
  const { id } = useParams({ strict: false }) as { id?: string }

  const [asset, setAsset] = useState<{
    id: string
    code: string
    name: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchAssetForPrint = async () => {
      setLoading(true)
      try {
        if (id) {
          const res = await assetService.getAssetById(id)

          const rawData = (
            res?.attributes ? { id: res.id, ...res.attributes } : res
          ) as Record<string, unknown> | undefined

          if (active && rawData) {
            const codeVal =
              rawData.code || rawData.assetCode || rawData.asset_code
            const nameVal =
              rawData.name || rawData.assetName || rawData.asset_name

            setAsset({
              id: String(rawData.id || id),
              code: typeof codeVal === "string" ? codeVal : "—",
              name: typeof nameVal === "string" ? nameVal : "Tanpa Nama",
            })
          }
        }
      } catch (err) {
        console.error("Gagal memuat data cetak QR:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchAssetForPrint()
    return () => {
      active = false
    }
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#f7f8fa] p-4 sm:p-8">
        <Skeleton className="h-8 w-48 sm:w-64" />
        <Skeleton className="h-64 w-64 rounded-2xl sm:h-72 sm:w-72" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#f7f8fa] text-[#1c1c1e] print:bg-white print:p-0">
      {/* Header Responsif: Ditambahkan pl-16 untuk memberikan ruang bagi Hamburger Menu Mobile */}
      <header className="sticky top-0 z-10 border-b border-[#e0e2e8] bg-white py-3 pr-4 pl-16 shadow-xs sm:px-6 print:hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              Cetak Label QR Aset
            </h1>
            <p className="hidden text-xs text-[#6b6f7e] sm:block">
              Pratinjau posisi & ukuran label sebelum dikirim ke printer fisik.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => void navigate({ to: "/asset" })}
              className="h-8.5 flex-1 gap-1.5 px-3 text-xs font-semibold sm:h-9 sm:flex-none sm:px-4"
            >
              <ArrowLeft size={14} />
              Kembali
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              disabled={!asset}
              className="h-8.5 flex-1 gap-1.5 px-3 text-xs font-semibold sm:h-9 sm:flex-none sm:px-4"
            >
              <Printer size={14} />
              Cetak Sekarang
            </Button>
          </div>
        </div>
      </header>

      {/* Container Utamny: Flex Center Responsif */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 print:block print:p-0">
        {!asset ? (
          <div className="w-full max-w-sm rounded-2xl border border-[#e0e2e8] bg-white p-6 text-center shadow-xs">
            <p className="text-xs font-medium text-[#6b6f7e] sm:text-sm">
              Data aset tidak ditemukan untuk ID ini.
            </p>
            <Button
              variant="secondary"
              onClick={() => void navigate({ to: "/asset" })}
              className="mt-4 h-8 px-3 text-xs"
            >
              Kembali ke Daftar Aset
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            {/* Box Preview Kertas Cetak */}
            <div className="w-full max-w-[320px] rounded-2xl border border-[#e0e2e8] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:w-auto sm:max-w-none sm:p-8 print:border-none print:bg-transparent print:p-0 print:shadow-none">
              <Card
                className="flex w-full flex-col items-center justify-center border border-neutral-300 bg-white p-4 text-black shadow-none sm:w-72 sm:p-6 print:w-auto print:border-none print:p-0"
                style={{ pageBreakInside: "avoid" }}
              >
                {/* Header Label */}
                <div className="mb-2.5 text-center sm:mb-3">
                  <span className="block text-[9px] font-bold tracking-widest text-neutral-400 uppercase sm:text-[10px]">
                    INVENTARIS KANTOR
                  </span>
                  <p className="mt-0.5 font-mono text-xs font-bold tracking-tight break-all text-neutral-800 sm:text-sm">
                    {asset.code}
                  </p>
                </div>

                {/* Container QR Code */}
                <div className="rounded-xl border border-neutral-200 bg-white p-2.5 shadow-xs sm:p-3 print:border-neutral-400 print:shadow-none">
                  <QRCodeSVG
                    value={`${window.location.origin}/asset/${asset.id}`}
                    size={120}
                    className="sm:hidden"
                    level="M"
                  />
                  <QRCodeSVG
                    value={`${window.location.origin}/asset/${asset.id}`}
                    size={136}
                    className="hidden sm:block"
                    level="M"
                  />
                </div>

                {/* Footer Label */}
                <div className="mt-3 max-w-full text-center sm:mt-3.5 sm:max-w-60">
                  <span className="block truncate text-xs font-semibold text-neutral-800">
                    {asset.name}
                  </span>
                </div>
              </Card>
            </div>

            {/* Hint Tampilan Kertas */}
            <p className="mt-3 text-center text-[11px] font-medium text-[#8e91a0] sm:mt-4 sm:text-xs print:hidden">
              Ukuran standar pratinjau: 7.5 cm × 7.5 cm
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
