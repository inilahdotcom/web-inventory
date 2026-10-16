import { type ReactNode, useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { assetService } from "@/services/assetServices"
import {
  masterDataService,
  type MasterDataItem,
} from "@/services/masterDataService"
import type { AssetListItem } from "@/types/asset"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InputField } from "@/components/ui/InputField"
import { SelectedField } from "@/components/ui/SelectedField"

const today = new Date().toISOString().slice(0, 10)

export function AssetMutationView() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<AssetListItem[]>([])
  const [locations, setLocations] = useState<MasterDataItem[]>([])
  const [assetId, setAssetId] = useState("")
  const [toLocationId, setToLocationId] = useState(0)
  const [holder, setHolder] = useState("")
  const [movementDate, setMovementDate] = useState(today)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === assetId) ?? null,
    [assetId, assets]
  )

  const destinationLocation = useMemo(
    () => locations.find((location) => location.id === toLocationId) ?? null,
    [locations, toLocationId]
  )

  useEffect(() => {
    let isMounted = true

    const loadMutationData = async () => {
      setIsLoading(true)
      setError("")

      try {
        const [assetResult, locationResult] = await Promise.all([
          assetService.list({ pageSize: 100, sort: "name:asc" }),
          masterDataService.getMutationLocations(),
        ])

        if (!isMounted) return

        setAssets(assetResult.assets)
        setLocations(locationResult)
        setAssetId("")
        setToLocationId(0)
        setHolder("")
      } catch {
        if (isMounted) {
          setError(
            "Data aset atau lokasi gagal dimuat. Silakan muat ulang halaman."
          )
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadMutationData()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAssetChange = (nextAssetId: string) => {
    const nextAsset = assets.find((asset) => asset.id === nextAssetId)
    if (!nextAsset) {
      setAssetId("")
      setToLocationId(0)
      setHolder("")
      setReason("")
      setError("")
      return
    }

    const nextLocation =
      locations.find(
        (location) => location.id !== nextAsset.attributes.locationId
      ) ?? locations[0]

    setAssetId(nextAssetId)
    setToLocationId(nextLocation?.id ?? 0)
    setHolder(nextAsset.attributes.holder ?? "")
    setReason("")
    setError("")
  }

  const reset = () => {
    if (!selectedAsset) return

    const defaultLocation =
      locations.find(
        (location) => location.id !== selectedAsset.attributes.locationId
      ) ?? locations[0]

    setToLocationId(defaultLocation?.id ?? 0)
    setHolder(selectedAsset.attributes.holder ?? "")
    setMovementDate(today)
    setReason("")
    setError("")
  }

  const handleSave = async () => {
    if (!selectedAsset) {
      setError("Pilih aset yang akan dimutasi.")
      return
    }

    if (!toLocationId) {
      setError("Lokasi tujuan wajib dipilih.")
      return
    }

    if (!reason.trim()) {
      setError("Alasan mutasi wajib diisi.")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      await assetService.moveAsset(selectedAsset.id, {
        to_location_id: toLocationId,
        to_holder: holder.trim() || undefined,
        movement_date: movementDate,
        reason: reason.trim(),
      })

      const nextLocationName = destinationLocation?.name ?? "lokasi tujuan"
      setAssets((current) =>
        current.map((asset) =>
          asset.id === selectedAsset.id
            ? {
                ...asset,
                attributes: {
                  ...asset.attributes,
                  locationId: toLocationId,
                  location: nextLocationName,
                  holder: holder.trim() || null,
                },
              }
            : asset
        )
      )
      setReason("")
      toast.success(
        `Mutasi ${selectedAsset.attributes.name} berhasil disimpan.`
      )
      await navigate({
        to: "/asset",
      })
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: unknown; error?: unknown } }
      }
      const serverMessage = [
        apiError.response?.data?.message,
        apiError.response?.data?.error,
      ].find(
        (message): message is string =>
          typeof message === "string" &&
          message.trim().length > 0 &&
          message.trim().toLowerCase() !== "error"
      )
      const message =
        serverMessage ||
        "Mutasi gagal disimpan. Pastikan lokasi, tanggal, dan alasan sudah benar."
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const assetDetail = selectedAsset?.attributes
  const assetSummary = assetDetail
    ? [
        assetDetail.category,
        assetDetail.quantity + " " + assetDetail.unit,
        assetDetail.condition,
      ]
        .filter(Boolean)
        .join(" · ")
    : ""

  const assetOptions = [
    { label: "Pilih aset", value: "" },
    ...assets.map((asset) => ({
      label: `${asset.attributes.code} — ${asset.attributes.name}`,
      value: asset.id,
    })),
  ]

  const locationOptions = [
    { label: "Pilih lokasi tujuan", value: "0" },
    ...locations.map((location) => ({
      label: `${location.name}${location.id === assetDetail?.locationId ? " (lokasi saat ini)" : ""}`,
      value: String(location.id),
    })),
  ]

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="flex h-16 items-center overflow-hidden border-b border-hairline bg-card py-0 pr-4 pl-16 text-[13px] text-muted-foreground sm:pr-6 lg:px-6">
        <span className="text-muted-foreground">Daftar Aset</span>
        <span className="px-2">/</span>
        <span className="truncate font-mono">
          {assetDetail?.code ?? (isLoading ? "Memuat..." : "-")}
        </span>
        <span className="px-2">/</span>
        <span className="text-foreground">Mutasi</span>
      </header>

      <main className="mx-auto flex w-full max-w-219 flex-col gap-4.5 p-4 py-7 sm:p-7">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-.6px]">
            Mutasi &amp; serah terima aset
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Mutasi memperbarui lokasi atau pemegang aset dan tercatat di riwayat
            mutasi.
          </p>
        </div>

        {error && (
          <Alert
            variant="destructive"
            onClick={() => setError("")}
            className="cursor-pointer"
          >
            <AlertDescription>{error} ×</AlertDescription>
          </Alert>
        )}

        <Card className="rounded-[20px]">
          <CardContent className="flex flex-col gap-5 p-5 sm:p-5.5">
            <SelectedField
              label="Aset yang dimutasi *"
              value={assetId}
              onChange={(e) => handleAssetChange(e.target.value)}
              disabled={isLoading || isSaving || assets.length === 0}
              options={assetOptions}
            />

            {assetDetail ? (
              <>
                <div className="flex items-center gap-3.5 border-b border-hairline pb-4.5">
                  {assetDetail.photos?.[0]?.url ? (
                    <img
                      src={assetDetail.photos[0].url}
                      alt={assetDetail.name}
                      className="size-14 rounded-xl border border-hairline object-cover"
                    />
                  ) : (
                    <div className="size-14 rounded-xl border border-hairline bg-[repeating-linear-gradient(135deg,#f7f8fa_0_8px,#eef0f3_8px_16px)]" />
                  )}
                  <div className="min-w-0">
                    <p className="font-mono text-[12px] text-brand-blue">
                      {assetDetail.code}
                    </p>
                    <h2 className="truncate text-[17px] font-semibold">
                      {assetDetail.name}
                    </h2>
                    <p className="text-[12px] text-muted-foreground">
                      {assetSummary}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_40px_1fr] md:items-center">
                  <LocationCard title="Dari" tone="neutral">
                    <Data
                      label="Lokasi"
                      value={assetDetail.location || "Belum ditentukan"}
                    />
                    <Data
                      label="Pemegang"
                      value={assetDetail.holder || "Belum ditentukan"}
                    />
                  </LocationCard>
                  <span className="text-center text-[22px] text-muted-foreground">
                    →
                  </span>
                  <LocationCard title="Ke" tone="target">
                    <SelectedField
                      label="Lokasi tujuan *"
                      value={String(toLocationId)}
                      onChange={(e) => setToLocationId(Number(e.target.value))}
                      disabled={isSaving}
                      options={locationOptions}
                    />
                    <InputField
                      label="Pemegang baru"
                      value={holder}
                      onChange={(e) => setHolder(e.target.value)}
                      disabled={isSaving}
                      placeholder="Kosongkan jika tidak ada pemegang"
                    />
                  </LocationCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                  <InputField
                    label="Tanggal mutasi *"
                    value={movementDate}
                    onChange={(e) => setMovementDate(e.target.value)}
                    type="date"
                    max={today}
                    disabled={isSaving}
                  />
                  <InputField
                    label="Alasan mutasi *"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isSaving}
                    maxLength={500}
                    placeholder="Jelaskan alasan pemindahan aset"
                  />
                </div>

                <p className="text-[12px] text-muted-foreground">
                  Berita acara PDF belum tersedia pada endpoint backend.
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={reset}
                    disabled={isSaving}
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving || !assetId}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Mutasi"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[14px] text-muted-foreground">
                {isLoading
                  ? "Memuat aset..."
                  : "Tidak ada aset yang dapat dimutasi."}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function LocationCard({
  title,
  tone,
  children,
}: {
  title: string
  tone: "neutral" | "target"
  children: ReactNode
}) {
  return (
    <div
      className={
        "flex flex-col gap-3 rounded-2xl p-4.5 " +
        (tone === "target" ? "bg-[#c3faf5]" : "bg-muted/50")
      }
    >
      <span
        className={
          "text-[11px] font-semibold tracking-[.5px] uppercase " +
          (tone === "target" ? "text-[#187574]" : "text-muted-foreground")
        }
      >
        {title}
      </span>
      {children}
    </div>
  )
}

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
      <p className="text-[15px] font-semibold">{value}</p>
    </div>
  )
}
