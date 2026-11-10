import { useRef, useState } from "react"
import { FileText, Plus, Trash2, Upload } from "lucide-react"
import {
  assetService,
  type AssetDocument,
  type AssetDocumentType,
} from "@/services/assetServices"
import {
  validateAssetDocument,
  warrantyDueState,
} from "@/features/assets/asset-documents"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectItem } from "@/components/ui/select"

const documentLabels: Record<AssetDocumentType, string> = {
  invoice: "Invoice",
  warranty: "Kartu garansi",
  condition_evidence: "Bukti kondisi",
}

type Props = {
  assetId: string
  documents: AssetDocument[]
  canManage: boolean
  onChanged: () => Promise<unknown>
  onNotice: (message: string) => void
}

function formatSize(size: number) {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
}

function requestError(error: unknown) {
  const value = error as {
    response?: { data?: { message?: string; error?: string } }
  }
  return (
    value.response?.data?.message ||
    value.response?.data?.error ||
    "Permintaan dokumen gagal diproses."
  )
}

function WarrantyStatus({ expiresAt }: { expiresAt: string }) {
  const status = warrantyDueState(expiresAt)
  const styles =
    status === "expired"
      ? "bg-[#ffc6c6] text-[#600000]"
      : status === "due"
        ? "bg-[#fff8e0] text-[#746019]"
        : "bg-[#c3faf5] text-[#187574]"
  const label =
    status === "expired"
      ? "Garansi berakhir"
      : status === "due"
        ? "Segera berakhir"
        : "Garansi aktif"
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}
    >
      {label}
    </span>
  )
}

export function AssetDocumentsCard({
  assetId,
  documents,
  canManage,
  onChanged,
  onNotice,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [documentType, setDocumentType] = useState<AssetDocumentType>("invoice")
  const [warrantyExpiresAt, setWarrantyExpiresAt] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState("")
  const [busy, setBusy] = useState(false)

  const resetForm = () => {
    setDocumentType("invoice")
    setWarrantyExpiresAt("")
    setFile(null)
    setFormError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const closeForm = () => {
    resetForm()
    setFormOpen(false)
  }

  const uploadDocument = async () => {
    const validation = validateAssetDocument(
      file,
      documentType,
      warrantyExpiresAt
    )
    if (validation || !file) {
      setFormError(validation)
      return
    }

    setBusy(true)
    setFormError("")
    try {
      await assetService.uploadDocument(
        assetId,
        file,
        documentType,
        warrantyExpiresAt || undefined
      )
      await onChanged()
      closeForm()
      onNotice("Lampiran dokumen berhasil ditambahkan.")
    } catch (error) {
      setFormError(requestError(error))
    } finally {
      setBusy(false)
    }
  }

  const deleteDocument = async (document: AssetDocument) => {
    if (!window.confirm(`Hapus ${document.fileName}?`)) return
    setBusy(true)
    try {
      await assetService.deleteDocument(assetId, document.id)
      await onChanged()
      onNotice("Lampiran dokumen berhasil dihapus.")
    } catch (error) {
      onNotice(requestError(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4 rounded-[20px] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div>
          <h2 className="text-[16px] font-semibold">Lampiran dokumen</h2>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {documents.length} dokumen tersimpan
          </p>
        </div>
        {canManage && !formOpen && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="ml-auto"
            disabled={busy}
            onClick={() => setFormOpen(true)}
          >
            <Plus aria-hidden="true" />
            Tambah lampiran
          </Button>
        )}
      </div>

      {formOpen && (
        <div className="grid gap-3 rounded-2xl border border-hairline bg-muted/40 p-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="asset-document-type">Jenis dokumen</Label>
            <Select
              id="asset-document-type"
              value={documentType}
              disabled={busy}
              onChange={(event) => {
                const nextType = event.target.value as AssetDocumentType
                setDocumentType(nextType)
                if (nextType !== "warranty") setWarrantyExpiresAt("")
                setFormError("")
              }}
            >
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="warranty">Kartu garansi</SelectItem>
              <SelectItem value="condition_evidence">
                Foto bukti kondisi
              </SelectItem>
            </Select>
          </div>

          {documentType === "warranty" && (
            <div className="grid gap-1.5">
              <Label htmlFor="warranty-expires-at">Tanggal akhir garansi</Label>
              <Input
                id="warranty-expires-at"
                type="date"
                value={warrantyExpiresAt}
                disabled={busy}
                onChange={(event) => {
                  setWarrantyExpiresAt(event.target.value)
                  setFormError("")
                }}
              />
            </div>
          )}

          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="asset-document-file">File dokumen</Label>
            <Input
              ref={inputRef}
              id="asset-document-file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setFormError("")
              }}
            />
            <span className="text-[11px] text-muted-foreground">
              PDF, JPG, PNG, atau WEBP · maksimal 10 MB
            </span>
          </div>

          {formError && (
            <Alert variant="destructive" className="sm:col-span-2">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2 sm:col-span-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={closeForm}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => void uploadDocument()}
            >
              <Upload aria-hidden="true" />
              {busy ? "Mengunggah…" : "Unggah dokumen"}
            </Button>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline-strong px-4 py-7 text-center">
          <FileText
            aria-hidden="true"
            className="mx-auto mb-2 size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">Belum ada lampiran</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invoice, kartu garansi, dan bukti kondisi akan tampil di sini.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  <FileText aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {document.fileName}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>{documentLabels[document.type]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatSize(document.fileSize)}</span>
                    {document.warrantyExpiresAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>
                          sampai {formatDate(document.warrantyExpiresAt)}
                        </span>
                        <WarrantyStatus
                          expiresAt={document.warrantyExpiresAt}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  Buka / unduh
                </a>
                {canManage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={busy}
                    aria-label={`Hapus ${document.fileName}`}
                    onClick={() => void deleteDocument(document)}
                  >
                    <Trash2 aria-hidden="true" className="text-[#600000]" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
