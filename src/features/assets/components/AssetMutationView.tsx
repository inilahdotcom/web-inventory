import { type ReactNode, useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { assetService } from "@/services/assetServices"
import {
  masterDataService,
  type MasterDataItem,
} from "@/services/masterDataService"
import type { AssetListItem } from "@/types/asset"

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

  const movableAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const locationId = asset.attributes.locationId
        return typeof locationId === "number" && locationId > 0
      }),
    [assets]
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
          masterDataService.getLocations(),
        ])

        if (!isMounted) return

        const assetsWithLocation = assetResult.assets.filter((asset) => {
          const locationId = asset.attributes.locationId
          return typeof locationId === "number" && locationId > 0
        })

        setAssets(assetResult.assets)
        setLocations(locationResult)
        const firstAsset = assetsWithLocation[0]
        const firstDestination = locationResult.find(
          (location) => location.id !== firstAsset?.attributes.locationId
        ) ?? locationResult[0]
        setAssetId(firstAsset?.id ?? "")
        setToLocationId(firstDestination?.id ?? 0)
        setHolder(firstAsset?.attributes.holder ?? "")
      } catch {
        if (isMounted) {
          setError("Data aset atau lokasi gagal dimuat. Silakan muat ulang halaman.")
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
    const nextLocation =
      locations.find(
        (location) => location.id !== nextAsset?.attributes.locationId
      ) ?? locations[0]

    setAssetId(nextAssetId)
    setToLocationId(nextLocation?.id ?? 0)
    setHolder(nextAsset?.attributes.holder ?? "")
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

    if (!selectedAsset.attributes.locationId) {
      setError(
        "Aset ini belum memiliki lokasi asal. Tentukan lokasi aset terlebih dahulu sebelum melakukan mutasi."
      )
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
      toast.success(`Mutasi ${selectedAsset.attributes.name} berhasil disimpan.`)
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
    ? [assetDetail.category, assetDetail.quantity + " " + assetDetail.unit, assetDetail.condition]
        .filter(Boolean)
        .join(" · ")
    : ""

  return (
    <div className="min-h-svh bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center overflow-hidden border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 text-[13px] text-[#8e91a0] sm:pr-6 lg:px-6">
        <span className="text-[#6b6f7e]">Daftar Aset</span>
        <span className="px-2">/</span>
        <span className="truncate font-mono">
          {assetDetail?.code ?? (isLoading ? "Memuat..." : "-")}
        </span>
        <span className="px-2">/</span>
        <span className="text-[#1c1c1e]">Mutasi</span>
      </header>

      <main className="mx-auto flex w-full max-w-219 flex-col gap-4.5 p-4 py-7 sm:p-7">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-.6px]">
            Mutasi &amp; serah terima aset
          </h1>
          <p className="mt-1 text-[13px] text-[#6b6f7e]">
            Mutasi memperbarui lokasi atau pemegang aset dan tercatat di riwayat mutasi.
          </p>
        </div>

        {error && (
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg bg-[#ffe3e3] px-4 py-3 text-left text-[13px] text-[#a21c1c]"
          >
            {error} ×
          </button>
        )}

        <section className="flex flex-col gap-5 rounded-[20px] border border-[#eef0f3] bg-white p-5 sm:p-5.5">
          <SelectField
            label="Aset yang dimutasi *"
            value={assetId}
            onChange={handleAssetChange}
            disabled={isLoading || isSaving || movableAssets.length === 0}
          >
            <option value="">Pilih aset</option>
            {movableAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.attributes.code} — {asset.attributes.name}
              </option>
            ))}
          </SelectField>

          {!isLoading && assets.length > 0 && movableAssets.length === 0 && (
            <p className="-mt-2 text-[12px] text-[#6b6f7e]">
              Belum ada aset dengan lokasi asal yang dapat dimutasi.
            </p>
          )}

          {assetDetail ? (
            <>
              <div className="flex items-center gap-3.5 border-b border-[#eef0f3] pb-4.5">
                {assetDetail.photos?.[0]?.url ? (
                  <img
                    src={assetDetail.photos[0].url}
                    alt={assetDetail.name}
                    className="size-14 rounded-xl border border-[#e0e2e8] object-cover"
                  />
                ) : (
                  <div className="size-14 rounded-xl border border-[#e0e2e8] bg-[repeating-linear-gradient(135deg,#f7f8fa_0_8px,#eef0f3_8px_16px)]" />
                )}
                <div className="min-w-0">
                  <p className="font-mono text-[12px] text-[#4262ff]">
                    {assetDetail.code}
                  </p>
                  <h2 className="truncate text-[17px] font-semibold">
                    {assetDetail.name}
                  </h2>
                  <p className="text-[12px] text-[#6b6f7e]">{assetSummary}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_40px_1fr] md:items-center">
                <LocationCard title="Dari" tone="neutral">
                  <Data label="Lokasi" value={assetDetail.location || "Belum ditentukan"} />
                  <Data label="Pemegang" value={assetDetail.holder || "Belum ditentukan"} />
                </LocationCard>
                <span className="text-center text-[22px] text-[#8e91a0]">→</span>
                <LocationCard title="Ke" tone="target">
                  <SelectField
                    label="Lokasi tujuan *"
                    value={String(toLocationId)}
                    onChange={(value) => setToLocationId(Number(value))}
                    disabled={isSaving}
                  >
                    <option value="0">Pilih lokasi tujuan</option>
                    {locations.map((location) => (
                      <option
                        key={location.id}
                        value={location.id}
                        disabled={location.id === assetDetail.locationId}
                      >
                        {location.name}
                        {location.id === assetDetail.locationId ? " (lokasi saat ini)" : ""}
                      </option>
                    ))}
                  </SelectField>
                  <Field
                    label="Pemegang baru"
                    value={holder}
                    onChange={setHolder}
                    disabled={isSaving}
                    placeholder="Kosongkan jika tidak ada pemegang"
                  />
                </LocationCard>
              </div>

              <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                <Field
                  label="Tanggal mutasi *"
                  value={movementDate}
                  onChange={setMovementDate}
                  type="date"
                  max={today}
                  disabled={isSaving}
                />
                <Field
                  label="Alasan mutasi *"
                  value={reason}
                  onChange={setReason}
                  disabled={isSaving}
                  maxLength={500}
                  placeholder="Jelaskan alasan pemindahan aset"
                />
              </div>

              <p className="text-[12px] text-[#8e91a0]">
                Berita acara PDF belum tersedia pada endpoint backend.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={reset}
                  disabled={isSaving}
                  className="h-11 rounded-full px-5 text-[14px] font-semibold text-[#555a6a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !assetId}
                  className="h-11 rounded-full bg-[#1c1c1e] px-6 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Mutasi"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-[14px] text-[#6b6f7e]">
              {isLoading ? "Memuat aset..." : "Tidak ada aset yang dapat dimutasi."}
            </p>
          )}
        </section>
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
        (tone === "target" ? "bg-[#c3faf5]" : "bg-[#f7f8fa]")
      }
    >
      <span
        className={
          "text-[11px] font-semibold tracking-[.5px] uppercase " +
          (tone === "target" ? "text-[#187574]" : "text-[#6b6f7e]")
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
      <p className="text-[11.5px] text-[#6b6f7e]">{label}</p>
      <p className="text-[15px] font-semibold">{value}</p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  max,
  maxLength,
  disabled = false,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: "date" | "text"
  max?: string
  maxLength?: number
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] text-[#6b6f7e]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        max={max}
        maxLength={maxLength}
        disabled={disabled}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-[#c7cad5] bg-white px-3.25 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  disabled = false,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] text-[#6b6f7e]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-11 rounded-lg border border-[#c7cad5] bg-white px-3.25 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {children}
      </select>
    </label>
  )
}
