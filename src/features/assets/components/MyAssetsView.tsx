import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { CheckCircle2, Search } from "lucide-react"
import { toast } from "sonner"
import { ProfileDropdown } from "@/components/ui/ProfileDropdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state"
import { assetService } from "@/services/assetServices"
import { profileService } from "@/services/profileService"
import type { AssetCondition, AssetListItem } from "@/types/asset"
import { filterAssetsByHolder } from "../my-assets-rules"

const conditionVariant: Record<
  AssetCondition,
  "bagus" | "rusak-ringan" | "rusak-berat" | "hilang"
> = {
  Bagus: "bagus",
  "Rusak Ringan": "rusak-ringan",
  "Rusak Berat": "rusak-berat",
  Hilang: "hilang",
}

const confirmationDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

function errorMessage(error: unknown): string {
  const apiError = error as {
    message?: string
    response?: { data?: { message?: string; error?: string } }
  }
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    apiError.message ||
    "Terjadi kesalahan. Silakan coba lagi."
  )
}

function confirmationErrorMessage(error: unknown): string {
  const apiError = error as { response?: { status?: number } }
  if (apiError.response?.status === 404) {
    return "Fitur konfirmasi pemegang belum tersedia di server."
  }

  return errorMessage(error)
}

async function loadAssetsByHolder(holderName: string) {
  const assets: AssetListItem[] = []
  let cursor: string | undefined

  do {
    const result = await assetService.list({
      search: holderName,
      sort: "name:asc",
      pageSize: 100,
      cursor,
    })
    assets.push(...result.assets)
    cursor = result.pagination.hasNextPage
      ? result.pagination.nextCursor
      : undefined
  } while (cursor)

  return filterAssetsByHolder(assets, holderName)
}

export function MyAssetsView() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [confirmationTarget, setConfirmationTarget] =
    useState<AssetListItem | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.get(),
  })
  const holderName = profileQuery.data?.attributes.name.trim() ?? ""

  const assetsQuery = useQuery({
    queryKey: ["my-assets", holderName],
    queryFn: () => loadAssetsByHolder(holderName),
    enabled: Boolean(holderName),
  })

  const visibleAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
    if (!normalizedQuery) return assetsQuery.data ?? []

    return (assetsQuery.data ?? []).filter((asset) => {
      const attributes = asset.attributes
      return [
        attributes.code,
        attributes.name,
        attributes.category,
        attributes.location,
      ].some((value) =>
        String(value ?? "")
          .toLocaleLowerCase("id-ID")
          .includes(normalizedQuery)
      )
    })
  }, [assetsQuery.data, query])

  const totalUnits = (assetsQuery.data ?? []).reduce(
    (total, asset) => total + Number(asset.attributes.quantity || 0),
    0
  )

  const handleConfirmation = async () => {
    if (!confirmationTarget) return

    const assetId = confirmationTarget.id
    setConfirmingId(assetId)
    try {
      await assetService.confirmHolder(assetId)
      await assetsQuery.refetch()
      setConfirmationTarget(null)
      toast.success("Kepemilikan aset berhasil dikonfirmasi.")
    } catch (error) {
      toast.error(confirmationErrorMessage(error))
    } finally {
      setConfirmingId(null)
    }
  }

  const loading = profileQuery.isLoading || assetsQuery.isLoading
  const error = profileQuery.error || assetsQuery.error

  return (
    <div className="min-h-svh bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-[#e0e2e8] bg-white pr-4 pl-16 sm:pr-7 lg:pl-7">
        <div className="relative min-w-0 flex-1 sm:max-w-96">
          <Search
            size={16}
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[#8e91a0]"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari aset yang saya pegang"
            aria-label="Cari aset yang saya pegang"
            className="h-10 w-full rounded-lg border border-[#e0e2e8] bg-[#f7f8fa] pr-3 pl-9 text-sm outline-none focus:border-[#4262ff]"
          />
        </div>
        <div className="ml-auto">
          <ProfileDropdown />
        </div>
      </header>

      <main className="space-y-5 px-4 py-6 sm:px-7">
        <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wide text-[#6b6f7e] uppercase">
              Tanggung jawab saya
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Aset yang saya pegang
            </h1>
            <p className="mt-1.5 text-sm text-[#6b6f7e]">
              Aset yang tercatat atas nama {holderName || "profil Anda"}.
            </p>
          </div>
          {!loading && !error && (
            <div className="flex gap-2 text-xs text-[#6b6f7e]">
              <span className="rounded-full border border-[#e0e2e8] bg-white px-3 py-1.5">
                {assetsQuery.data?.length ?? 0} jenis aset
              </span>
              <span className="rounded-full border border-[#e0e2e8] bg-white px-3 py-1.5">
                {totalUnits} unit
              </span>
            </div>
          )}
        </section>

        {loading && <LoadingState message="Memuat aset yang Anda pegang..." />}
        {!loading && error && (
          <ErrorState
            message={errorMessage(error)}
            onRetry={() => {
              void profileQuery.refetch()
              void assetsQuery.refetch()
            }}
          />
        )}
        {!loading && !error && visibleAssets.length === 0 && (
          <EmptyState
            title={
              query ? "Aset tidak ditemukan" : "Belum ada aset atas nama Anda"
            }
            description={
              query
                ? "Coba gunakan kata pencarian lain."
                : "Daftar akan tampil ketika nama Anda tercatat sebagai pemegang aset."
            }
          />
        )}

        {!loading && !error && visibleAssets.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleAssets.map((asset) => {
              const attributes = asset.attributes
              const isConfirmed = Boolean(attributes.holderConfirmedAt)
              const condition = attributes.condition as AssetCondition

              return (
                <article
                  key={asset.id}
                  className="flex min-h-64 flex-col rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_8px_24px_rgba(28,28,30,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-semibold text-[#4262ff]">
                        {attributes.code}
                      </p>
                      <h2 className="mt-1 truncate text-lg font-semibold">
                        {attributes.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-[#6b6f7e]">
                        {attributes.category} ·{" "}
                        {attributes.brand || "Tanpa merek"}
                      </p>
                    </div>
                    <Badge variant={conditionVariant[condition] ?? "outline"}>
                      {condition}
                    </Badge>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#f7f8fa] p-3.5 text-xs">
                    <div>
                      <dt className="text-[#8e91a0]">Jumlah</dt>
                      <dd className="mt-0.5 font-semibold">
                        {attributes.quantity} {attributes.unit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8e91a0]">Lokasi</dt>
                      <dd className="mt-0.5 truncate font-semibold">
                        {attributes.location || "Belum ditentukan"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[#8e91a0]">Pemegang tercatat</dt>
                      <dd className="mt-0.5 truncate font-semibold">
                        {holderName}
                      </dd>
                    </div>
                    <div className="col-span-2 border-t border-[#e0e2e8] pt-3">
                      <dt className="text-[#8e91a0]">Status konfirmasi</dt>
                      <dd className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant={isConfirmed ? "bagus" : "warning"}>
                          {isConfirmed
                            ? "Sudah dikonfirmasi"
                            : "Belum dikonfirmasi"}
                        </Badge>
                        {attributes.holderConfirmedAt && (
                          <span className="text-[11px] text-[#6b6f7e]">
                            {confirmationDateFormatter.format(
                              new Date(attributes.holderConfirmedAt)
                            )}
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        navigate({
                          to: "/asset/$id",
                          params: { id: asset.id },
                        })
                      }
                    >
                      Lihat detail
                    </Button>
                    <Button
                      variant={isConfirmed ? "secondary" : "primary"}
                      size="sm"
                      disabled={isConfirmed}
                      onClick={() => setConfirmationTarget(asset)}
                      className="gap-1.5"
                    >
                      {isConfirmed && <CheckCircle2 size={15} />}
                      {isConfirmed
                        ? "Sudah dikonfirmasi"
                        : "Konfirmasi pemegang"}
                    </Button>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </main>

      <Dialog
        open={Boolean(confirmationTarget)}
        onOpenChange={(open) => {
          if (!open && !confirmingId) setConfirmationTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi pemegang aset</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm leading-6 text-[#6b6f7e]">
            Pastikan Anda memang memegang aset
            {confirmationTarget
              ? ` “${confirmationTarget.attributes.name}”`
              : " ini"}
            . Konfirmasi akan dicatat sebagai aktivitas aset.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setConfirmationTarget(null)}
              disabled={Boolean(confirmingId)}
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleConfirmation()}
              disabled={Boolean(confirmingId)}
            >
              {confirmingId ? "Mengonfirmasi..." : "Ya, konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
