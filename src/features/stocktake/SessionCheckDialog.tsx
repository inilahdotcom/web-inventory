import { useState } from "react"

import { bulkCheckInBatches } from "@/services/stocktake"
import type { BatchedCheckOutcome } from "@/services/stocktake"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InputField } from "@/components/ui/InputField"
import { SelectedField } from "@/components/ui/SelectedField"
import { Card } from "@/components/ui/card"
import { CONDITION_LOST } from "@/types/stocktake"
import { ProgressBar } from "./stockTakeUi"

// Samakan dengan AssetCondition di "@/types/asset".
const CONDITIONS = ["Bagus", "Rusak Ringan", "Rusak Berat", CONDITION_LOST]

const RESULT_LABEL: Record<string, string> = {
  ok: "Berhasil diperiksa",
  not_in_scope: "Di luar cakupan sesi",
  not_found: "Aset tidak ditemukan",
  already_checked: "Sudah diperiksa",
  error: "Gagal diproses",
}

function mergeSummary(
  a: Record<string, number> = {},
  b: Record<string, number> = {}
) {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? 0) + v
  return out
}

type Phase = "form" | "running" | "result"

export function SessionCheckDialog({
  sessionId,
  assetIds,
  onClose,
}: {
  sessionId: string
  assetIds: string[]
  // changed = true bila ada aset yang berhasil diperiksa (perlu refresh data)
  onClose: (changed: boolean) => void
}) {
  const [condition, setCondition] = useState(CONDITIONS[0])
  const [notes, setNotes] = useState("")
  const [quantity, setQuantity] = useState("")
  const [phase, setPhase] = useState<Phase>("form")
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [outcome, setOutcome] = useState<BatchedCheckOutcome | null>(null)

  const quantityInvalid =
    quantity !== "" && (!/^\d+$/.test(quantity) || Number(quantity) < 0)
  const isLost = condition === CONDITION_LOST
  const okCount = outcome?.summary.ok ?? 0

  const run = async (ids: string[], previous?: BatchedCheckOutcome) => {
    setPhase("running")
    setProgress({ done: 0, total: ids.length })

    const res = await bulkCheckInBatches(
      sessionId,
      {
        assetIds: ids,
        condition,
        notes: notes.trim() || null,
        countedQuantity: quantity === "" ? null : Number(quantity),
      },
      (done, total) => setProgress({ done, total })
    )

    setOutcome({
      results: [...(previous?.results ?? []), ...(res.results ?? [])],
      summary: mergeSummary(previous?.summary, res.summary),
      notProcessed: res.notProcessed,
      error: res.error,
    })
    setPhase("result")
  }

  const failures = (outcome?.results ?? []).filter((r) => r.status !== "ok")

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && phase !== "running") onClose(okCount > 0)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {phase === "result"
              ? "Hasil pemeriksaan"
              : `Periksa ${assetIds.length} aset`}
          </DialogTitle>
        </DialogHeader>

        {phase === "form" && (
          <div className="space-y-4">
            <SelectedField
              label="Kondisi aset"
              labelClassName="text-sm font-semibold text-[#1c1c1e]"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              options={CONDITIONS.map((opt) => ({ label: opt, value: opt }))}
            />

            {isLost && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-800">
                Aset akan ditandai hilang di sesi ini, dan kondisi aset di data
                utama ikut diubah menjadi <b>Hilang</b>.
              </p>
            )}

            <InputField
              label="Jumlah terhitung (opsional)"
              labelClassName="text-sm font-semibold text-[#1c1c1e]"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Kosongkan jika tidak dihitung"
              errorText={
                quantityInvalid
                  ? "Isi dengan angka bulat, nol atau lebih."
                  : undefined
              }
            />

            <InputField
              label="Catatan (opsional)"
              labelClassName="text-sm font-semibold text-[#1c1c1e]"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contoh: Dicek langsung di ruangan"
            />
          </div>
        )}

        {phase === "running" && (
          <div className="space-y-3 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Memeriksa aset... {progress.done} dari {progress.total}
            </p>
            <ProgressBar
              percent={
                progress.total > 0 ? (progress.done / progress.total) * 100 : 0
              }
            />
          </div>
        )}

        {phase === "result" && outcome && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              {Object.entries(outcome.summary).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-hairline bg-muted/30 px-3.5 py-2.5 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {RESULT_LABEL[status] ?? status}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      status === "ok" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>

            {failures.length > 0 && (
              <Card className="space-y-1.5 rounded-xl border border-hairline p-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  Aset yang tidak diproses
                </p>
                <ul className="max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] text-muted-foreground">
                  {failures.slice(0, 20).map((r) => (
                    <li key={r.assetId} className="truncate">
                      {r.assetId} &middot; {RESULT_LABEL[r.status] ?? r.status}
                    </li>
                  ))}
                </ul>
                {failures.length > 20 && (
                  <p className="text-[10px] text-muted-foreground">
                    dan {failures.length - 20} lainnya
                  </p>
                )}
              </Card>
            )}

            {outcome.error && (
              <div className="space-y-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-800">
                <p className="font-semibold">{outcome.error.message}</p>
                <p>{outcome.notProcessed.length} aset belum sempat diproses.</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-3">
          {phase === "form" && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onClose(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant={isLost ? "destructive" : "primary"}
                size="sm"
                disabled={quantityInvalid || assetIds.length === 0}
                onClick={() => void run(assetIds)}
              >
                {isLost ? "Tandai Hilang" : "Simpan Pemeriksaan"}
              </Button>
            </>
          )}

          {phase === "result" && (
            <>
              {outcome && outcome.notProcessed.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void run(outcome.notProcessed, outcome)}
                >
                  Coba lagi
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onClose(okCount > 0)}
              >
                Selesai
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
