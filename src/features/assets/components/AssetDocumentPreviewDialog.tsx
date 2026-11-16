import { useRef, useState } from "react"
import { Download, Expand, FileText } from "lucide-react"
import { assetService, type AssetDocument } from "@/services/assetServices"
import { documentPreviewKind } from "@/features/assets/asset-documents"
import { downloadBlob } from "@/lib/DownloadBlob"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  assetId: string
  document: AssetDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetDocumentPreviewDialog({
  assetId,
  document,
  open,
  onOpenChange,
}: Props) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState("")

  if (!document) return null

  const previewKind = documentPreviewKind(document.mimeType)

  const downloadDocument = async () => {
    setDownloading(true)
    setDownloadError("")
    try {
      const response = await assetService.downloadDocument(assetId, document.id)
      downloadBlob(response, document.fileName)
    } catch {
      setDownloadError("Dokumen gagal diunduh. Silakan coba lagi.")
    } finally {
      setDownloading(false)
    }
  }

  const showFullscreen = async () => {
    if (!previewRef.current?.requestFullscreen) {
      window.open(document.fileUrl, "_blank", "noopener,noreferrer")
      return
    }
    try {
      await previewRef.current.requestFullscreen()
    } catch {
      window.open(document.fileUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setDownloadError("")
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="flex h-[min(90vh,820px)] max-w-5xl flex-col overflow-hidden p-4 sm:p-5">
        <DialogHeader className="mb-3 shrink-0">
          <DialogTitle className="flex min-w-0 items-center gap-2 text-lg">
            <FileText aria-hidden="true" className="size-5 shrink-0" />
            <span className="truncate">{document.fileName}</span>
          </DialogTitle>
          <DialogDescription>
            Pratinjau lampiran dokumen sebelum diunduh.
          </DialogDescription>
        </DialogHeader>

        <div
          ref={previewRef}
          className="fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none fullscreen:border-0 fullscreen:p-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-hairline bg-[#f0eee9] p-2"
        >
          {previewKind === "image" ? (
            <img
              src={document.fileUrl}
              alt={`Pratinjau ${document.fileName}`}
              className="fullscreen:h-full fullscreen:w-full max-h-full max-w-full object-contain"
            />
          ) : (
            <iframe
              src={document.fileUrl}
              title={`Pratinjau ${document.fileName}`}
              className="fullscreen:rounded-none h-full min-h-80 w-full rounded-xl bg-white"
            />
          )}
        </div>

        {downloadError && (
          <Alert variant="warning" className="mt-3 shrink-0">
            <AlertDescription>{downloadError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-3 shrink-0 flex-row justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void showFullscreen()}
          >
            <Expand aria-hidden="true" />
            Layar penuh
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={downloading}
            onClick={() => void downloadDocument()}
          >
            <Download aria-hidden="true" />
            {downloading ? "Mengunduh…" : "Unduh"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
