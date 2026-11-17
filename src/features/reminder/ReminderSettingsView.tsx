import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Mail, Send } from "lucide-react"
import { usePermission } from "@/hooks/usePermission"
import {
  useReminderPreview,
  useReminderSettings,
  useSendReminderNow,
} from "@/hooks/useReminder"
import {
  reminderService,
  type CategoryInterval,
} from "@/services/reminderServices"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

const PRESETS = [30, 90, 180, 365]
const MAX_INTERVAL = 3650
const MAX_WINDOW = 90

function humanDays(days: number) {
  if (days % 365 === 0) return `${days / 365} tahun`
  if (days % 30 === 0) return `${days / 30} bulan`
  if (days % 7 === 0) return `${days / 7} minggu`
  return `${days} hari`
}

function isValidInterval(n: number) {
  return Number.isInteger(n) && n >= 1 && n <= MAX_INTERVAL
}

function apiMessage(error: unknown, fallback: string) {
  const e = error as {
    response?: { data?: { error?: string; message?: string } }
  }
  return e.response?.data?.error || e.response?.data?.message || fallback
}

function mailSummary(body: string) {
  const late = /TERLAMBAT \((\d+)\)/.exec(body)?.[1]
  const soon = /SEGERA JATUH TEMPO[^\n]*\((\d+)\)\s*\n/.exec(body)?.[1]
  return { late: Number(late ?? 0), soon: Number(soon ?? 0) }
}

function SuffixInput({
  suffix,
  className = "",
  ...props
}: React.ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className={`relative ${className}`}>
      <Input {...props} className="pr-14" />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[#8e91a0]">
        {suffix}
      </span>
    </div>
  )
}

export function ReminderSettingsView() {
  const { canManageAdminData } = usePermission() // hanya Admin yang boleh mengubah
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useReminderSettings()
  const preview = useReminderPreview()
  const sendNow = useSendReminderNow()

  const [defaultDays, setDefaultDays] = useState("90")
  const [windowDays, setWindowDays] = useState("7")
  const [enabled, setEnabled] = useState(true)
  const [drafts, setDrafts] = useState<Record<number, string>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)
  const [targetEmail, setTargetEmail] = useState("")

  const saveAll = useMutation({
    mutationFn: async (payload: {
      general: {
        defaultIntervalDays: number
        windowDays: number
        enabled: boolean
      } | null
      categories: Array<{ id: number; days: number | null }>
    }) => {
      if (payload.general) {
        await reminderService.updateSettings(payload.general)
      }
      await Promise.all(
        payload.categories.map((c) =>
          reminderService.setCategoryInterval(c.id, c.days)
        )
      )
    },
    onSuccess: () => {
      toast.success("Pengaturan pengingat disimpan")
      void queryClient.invalidateQueries({ queryKey: ["reminder", "settings"] })
    },
    onError: (e) => toast.error(apiMessage(e, "Gagal menyimpan pengaturan")),
  })

  const resetDrafts = () => {
    if (!data) return
    setDefaultDays(String(data.settings.defaultIntervalDays))
    setWindowDays(String(data.settings.windowDays))
    setEnabled(data.settings.enabled)
    const next: Record<number, string> = {}
    data.categories.forEach((c) => {
      next[c.id] =
        c.checkIntervalDays === null ? "" : String(c.checkIntervalDays)
    })
    setDrafts(next)
  }

  const [prevData, setPrevData] = useState(data)
  if (data !== prevData) {
    setPrevData(data)
    if (data) {
      setDefaultDays(String(data.settings.defaultIntervalDays))
      setWindowDays(String(data.settings.windowDays))
      setEnabled(data.settings.enabled)
      const next: Record<number, string> = {}
      data.categories.forEach((c) => {
        next[c.id] =
          c.checkIntervalDays === null ? "" : String(c.checkIntervalDays)
      })
      setDrafts(next)
    }
  }

  const defaultNum = Number(defaultDays)
  const windowNum = Number(windowDays)
  const generalValid =
    isValidInterval(defaultNum) &&
    Number.isInteger(windowNum) &&
    windowNum >= 0 &&
    windowNum <= MAX_WINDOW

  const rows = useMemo(() => {
    if (!data) return []
    return data.categories.map((c: CategoryInterval) => {
      const raw = (drafts[c.id] ?? "").trim()
      const saved =
        c.checkIntervalDays === null ? "" : String(c.checkIntervalDays)
      const num = raw === "" ? null : Number(raw)
      const valid = num === null || isValidInterval(num)
      const effective =
        num ??
        (isValidInterval(defaultNum)
          ? defaultNum
          : data.settings.defaultIntervalDays)
      return { c, raw, num, valid, dirty: raw !== saved, effective }
    })
  }, [data, drafts, defaultNum])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat pengaturan pengingat.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const generalDirty =
    defaultNum !== data.settings.defaultIntervalDays ||
    windowNum !== data.settings.windowDays ||
    enabled !== data.settings.enabled
  const dirtyRows = rows.filter((r) => r.dirty)
  const changeCount = (generalDirty ? 1 : 0) + dirtyRows.length
  const hasInvalid = !generalValid || rows.some((r) => !r.valid)
  const hasChanges = changeCount > 0

  const handleSave = () => {
    if (hasInvalid || !hasChanges) return
    saveAll.mutate({
      general: generalDirty
        ? { defaultIntervalDays: defaultNum, windowDays: windowNum, enabled }
        : null,
      categories: dirtyRows.map((r) => ({ id: r.c.id, days: r.num })),
    })
  }

  const openPreview = () => {
    setPreviewOpen(true)
    preview.mutate()
  }

  const handleSendNow = async () => {
    const email = targetEmail.trim()
    if (!email) {
      toast.error("Alamat email tujuan wajib diisi")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Format alamat email tidak valid")
      return
    }

    try {
      await sendNow.mutateAsync(email)
      setSendConfirmOpen(false)
      setTargetEmail("")
    } catch {
      // toast sudah ditangani di hook
    }
  }

  const mailEntries = Object.entries(preview.data?.mails ?? {})
  const savedEnabled = data.settings.enabled

  return (
    <div className="w-full text-foreground">
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-28 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-3 pl-12 sm:flex-row sm:items-end sm:justify-between lg:pl-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Pengingat Pemeriksaan
            </h1>
            <p className="mt-0.5 text-xs text-neutral-500">
              Atur seberapa sering aset perlu diperiksa. Sistem mengirim
              ringkasan lewat email: {data.schedule}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={openPreview}
              disabled={hasChanges}
              title={
                hasChanges
                  ? "Simpan perubahan dulu supaya pratinjau sesuai"
                  : "Lihat email yang akan dikirim"
              }
              className="gap-1.5"
            >
              <Mail className="size-4" />
              <span>Pratinjau email</span>
            </Button>
            {canManageAdminData && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setSendConfirmOpen(true)}
                disabled={hasChanges}
                title={
                  hasChanges
                    ? "Simpan perubahan dulu sebelum mengirim email"
                    : "Kirim email pengingat sekarang"
                }
                className="gap-1.5"
              >
                <Send className="size-4" />
                <span>Kirim sekarang</span>
              </Button>
            )}
          </div>
        </div>

        {!canManageAdminData && (
          <Alert variant="warning">
            <AlertTitle className="text-xs font-bold">
              Mode Pratinjau (Read-Only)
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              Pengaturan pengingat hanya dapat diubah oleh pengguna dengan hak
              akses <strong>Admin</strong>.
            </AlertDescription>
          </Alert>
        )}

        {/* BANNER STATUS */}
        <div
          className={`flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center ${
            enabled
              ? "border-[#9fe6df] bg-[#c3faf5]"
              : "border-[#f3df9a] bg-[#fff8e0]"
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`size-2.5 rounded-full ${enabled ? "bg-[#187574]" : "bg-[#b08900]"}`}
              />
              <h2
                className={`text-sm font-bold ${enabled ? "text-chart-5" : "text-[#746019]"}`}
              >
                {enabled ? "Pengingat aktif" : "Pengingat dijeda"}
              </h2>
              {enabled !== savedEnabled && (
                <Badge variant="outline">Belum disimpan</Badge>
              )}
            </div>
            <p
              className={`mt-1 text-xs leading-relaxed ${enabled ? "text-chart-5" : "text-[#746019]"}`}
            >
              {enabled
                ? "Email ringkasan dikirim otomatis ke Admin, Staff GA, dan pemegang aset setiap Senin pukul 10:00."
                : "Tidak ada email yang dikirim otomatis. Pratinjau tetap bisa dilihat."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Aktifkan pengingat mingguan"
            disabled={!canManageAdminData}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              enabled ? "bg-[#187574]" : "bg-input"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* PENGATURAN UMUM + CARA KERJA */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="space-y-4 p-6 lg:col-span-2">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Aturan dasar
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Berlaku untuk semua aset, kecuali kategori yang diberi interval
                sendiri di bawah.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="rem-default">Jeda pemeriksaan bawaan</Label>
                <SuffixInput
                  id="rem-default"
                  suffix="hari"
                  type="number"
                  min={1}
                  max={MAX_INTERVAL}
                  value={defaultDays}
                  disabled={!canManageAdminData}
                  onChange={(e) => setDefaultDays(e.target.value)}
                />
                <p className="text-[11px] text-neutral-500">
                  {isValidInterval(defaultNum)
                    ? `Setara ${humanDays(defaultNum)}. Aset diingatkan setelah jeda ini lewat sejak pemeriksaan terakhir.`
                    : `Isi 1 sampai ${MAX_INTERVAL} hari.`}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rem-window">Peringatan lebih awal</Label>
                <SuffixInput
                  id="rem-window"
                  suffix="hari"
                  type="number"
                  min={0}
                  max={MAX_WINDOW}
                  value={windowDays}
                  disabled={!canManageAdminData}
                  onChange={(e) => setWindowDays(e.target.value)}
                />
                <p className="text-[11px] text-neutral-500">
                  {Number.isInteger(windowNum) &&
                  windowNum >= 0 &&
                  windowNum <= MAX_WINDOW
                    ? windowNum === 0
                      ? "Hanya aset yang sudah terlambat yang dikirim."
                      : `Aset yang jatuh tempo dalam ${windowNum} hari ke depan ikut diingatkan.`
                    : `Isi 0 sampai ${MAX_WINDOW} hari.`}
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 bg-background p-6">
            <h2 className="text-sm font-bold text-foreground">Cara kerja</h2>
            <ol className="space-y-2.5 text-xs leading-relaxed text-neutral-600">
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                  1
                </span>
                Jatuh tempo = tanggal pemeriksaan terakhir + jeda pemeriksaan.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                  2
                </span>
                Aset yang belum pernah diperiksa dihitung dari tanggal dibuat.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
                  3
                </span>
                Setiap pemeriksaan (termasuk stok opname) menggeser jatuh tempo
                ke depan.
              </li>
            </ol>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-hairline px-6 py-4">
            <h2 className="text-sm font-bold text-foreground">
              Jeda khusus per kategori
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500">
              Kosongkan kolom untuk mengikuti jeda bawaan. Contoh: laptop 90
              hari, furnitur 365 hari.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-hairline bg-muted/50">
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Kategori
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Jeda khusus
                  </TableHead>
                  <TableHead className="px-6 py-3.5 text-[10px] font-semibold tracking-wider uppercase">
                    Berlaku
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="px-6 py-8 text-center text-xs text-muted-foreground"
                    >
                      Belum ada kategori. Tambahkan di Master Data.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map(({ c, raw, valid, dirty, effective }) => (
                    <TableRow
                      key={c.id}
                      className={`transition-colors hover:bg-muted/50 ${dirty ? "bg-[#fffdf2]" : ""}`}
                    >
                      <TableCell className="px-6 py-4 align-top">
                        <p className="font-semibold text-foreground">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                          {c.assetCount} aset
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <SuffixInput
                            suffix="hari"
                            type="number"
                            min={1}
                            max={MAX_INTERVAL}
                            value={drafts[c.id] ?? ""}
                            disabled={!canManageAdminData}
                            placeholder="Bawaan"
                            aria-label={`Jeda pemeriksaan ${c.name}`}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            className="w-40"
                          />
                          {canManageAdminData && raw !== "" && (
                            <button
                              type="button"
                              onClick={() =>
                                setDrafts((prev) => ({ ...prev, [c.id]: "" }))
                              }
                              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {canManageAdminData && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {PRESETS.map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [c.id]: String(p),
                                  }))
                                }
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                                  raw === String(p)
                                    ? "bg-primary text-white"
                                    : "bg-[#f0f1f4] text-[#555a6a] hover:bg-border"
                                }`}
                              >
                                {humanDays(p)}
                              </button>
                            ))}
                          </div>
                        )}
                        {!valid && (
                          <p className="mt-1.5 text-[11px] text-destructive">
                            Isi 1 sampai {MAX_INTERVAL} hari.
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 align-top">
                        {valid && (
                          <div className="flex flex-col items-start gap-1">
                            <Badge
                              variant={raw === "" ? "outline" : "diperbaiki"}
                            >
                              {raw === "" ? "Bawaan" : "Khusus"}
                            </Badge>
                            <span className="text-xs font-semibold text-foreground">
                              Setiap {humanDays(effective)}
                            </span>
                            {dirty && (
                              <span className="text-[11px] font-medium text-amber-600">
                                Belum disimpan
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* BAR SIMPAN (muncul jika ada perubahan) */}
      {canManageAdminData && hasChanges && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4 lg:pl-58">
          <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-foreground shadow-[0_8px_30px_rgba(28,28,30,0.12)]">
            <span className="size-2.5 shrink-0 rounded-full bg-amber-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {changeCount} perubahan belum disimpan
              </p>
              {hasInvalid && (
                <p className="text-[11px] text-destructive">
                  Perbaiki isian yang berwarna merah dulu.
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={saveAll.isPending}
              onClick={resetDrafts}
              className="h-9 rounded-full border border-border bg-white px-4 text-xs font-semibold text-foreground transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batalkan
            </button>
            <button
              type="button"
              disabled={hasInvalid || saveAll.isPending}
              onClick={handleSave}
              className="h-9 rounded-full bg-primary px-4 text-xs font-semibold text-white transition hover:bg-[#343438] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveAll.isPending ? "Menyimpan…" : "Simpan semua"}
            </button>
          </div>
        </div>
      )}

      {/* DIALOG PRATINJAU */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pratinjau email pengingat</DialogTitle>
          </DialogHeader>
          {preview.isPending ? (
            <Skeleton className="h-40 w-full" />
          ) : mailEntries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tidak ada aset yang jatuh tempo, jadi tidak ada email yang akan
              dikirim.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                Dengan pengaturan tersimpan, {mailEntries.length} penerima akan
                dikirimi email. Tidak ada email yang dikirim dari pratinjau ini.
              </p>
              {mailEntries.map(([to, body]) => {
                const s = mailSummary(body)
                return (
                  <details
                    key={to}
                    className="group rounded-xl border border-hairline p-3"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {to}
                      </span>
                      {s.late > 0 && (
                        <Badge variant="destructive">{s.late} terlambat</Badge>
                      )}
                      {s.soon > 0 && (
                        <Badge variant="outline">{s.soon} segera</Badge>
                      )}
                      <span className="ml-auto text-[11px] text-neutral-400 group-open:hidden">
                        Lihat isi
                      </span>
                    </summary>
                    <pre className="mt-3 text-xs leading-relaxed whitespace-pre-wrap text-neutral-700">
                      {body}
                    </pre>
                  </details>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG KONFIRMASI KIRIM SEKARANG */}
      <Dialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kirim Email Pengingat Sekarang</DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Fitur ini akan mengirim email ringkasan pengingat pemeriksaan aset
              secara manual sekarang juga tanpa harus menunggu jadwal otomatis
              hari Senin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rem-target-email" className="text-xs font-medium">
                Alamat email tujuan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rem-target-email"
                type="email"
                required
                placeholder="contoh: user@inilah.com"
                value={targetEmail}
                disabled={sendNow.isPending}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Masukkan alamat email yang akan dikirimi ringkasan pengingat
                pemeriksaan aset.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={sendNow.isPending}
              onClick={() => {
                setSendConfirmOpen(false)
                setTargetEmail("")
              }}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={sendNow.isPending}
              onClick={handleSendNow}
              className="gap-1.5"
            >
              <Send className="size-3.5" />
              <span>{sendNow.isPending ? "Mengirim..." : "Kirim Email"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
