import { useState, useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Search, Package, ArrowRight, Loader2, X } from "lucide-react"
import { api } from "@/lib/axios"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface AssetSearchResult {
  id: string
  asset_code: string
  name: string
  category_name?: string
  condition?: string
}

function getConditionBadgeVariant(condition?: string) {
  const c = condition?.toLowerCase() || ""
  if (c.includes("ringan")) return "rusak-ringan" as const
  if (c.includes("berat")) return "rusak-berat" as const
  if (c.includes("bagus")) return "bagus" as const
  if (c.includes("hilang")) return "hilang" as const
  return "outline" as const
}

export function HeaderSearchDropdown() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AssetSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce API call saat user mengetik
  useEffect(() => {
    if (!query.trim()) {
      queueMicrotask(() => {
        setResults([])
        setLoading(false)
      })
      return
    }

    queueMicrotask(() => {
      setLoading(true)
    })

    const timer = setTimeout(async () => {
      try {
        const response = await api.get("/assets", {
          params: { search: query.trim(), limit: 5 },
        })
        const fetchedData = response.data?.data || response.data?.assets || []

        // Penyesuaian mapping properti dari Backend Go tanpa tipe 'any'
        const mapped = fetchedData
          .slice(0, 5)
          .map((item: Record<string, unknown>) => {
            const attr = (item.attributes || item) as Record<string, unknown>
            return {
              id: String(item.id || attr.id || ""),
              asset_code: String(
                attr.assetCode || attr.code || attr.asset_code || ""
              ),
              name: String(
                attr.name || attr.assetName || attr.asset_name || "Tanpa Nama"
              ),
              category_name: String(
                attr.categoryName || attr.category || attr.category_name || ""
              ),
              condition: String(attr.condition || "Bagus"),
            }
          })

        setResults(mapped)
      } catch (err) {
        console.error("Gagal mengambil data search preview:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsOpen(false)
    navigate({
      to: "/asset",
      search: { search: query.trim() },
    })
  }

  const handleSelectAsset = (assetId: string) => {
    setIsOpen(false)
    setQuery("")
    navigate({
      to: "/asset/$id",
      params: { id: String(assetId) },
    })
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <Input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          placeholder="Cari kode, nama barang, merek, keterangan..."
          className="rounded-2xl pr-8 pl-9"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {/* Popover Preview Results */}
      {isOpen && query.trim().length > 0 && (
        <Card className="absolute top-11 left-0 z-50 w-full min-w-85 overflow-hidden p-2 shadow-xl">
          {loading && results.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Mencari aset...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Aset tidak ditemukan untuk "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                HASIL PENCARIAN ASET
              </div>

              {results.map((item) => {
                // Formatting subtext agar rapi tanpa pemisah gantung
                const subtextParts = [
                  item.asset_code,
                  item.category_name,
                ].filter(Boolean)
                const subtext =
                  subtextParts.length > 0
                    ? subtextParts.join(" • ")
                    : "Tanpa Detail"

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectAsset(item.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted/70"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {item.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {subtext}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getConditionBadgeVariant(item.condition)}>
                      {item.condition}
                    </Badge>
                  </button>
                )
              })}

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-1 flex w-full cursor-pointer items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
              >
                <span>Lihat semua hasil untuk "{query}"</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
