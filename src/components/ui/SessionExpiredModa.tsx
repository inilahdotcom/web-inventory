import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SessionExpiredModalProps {
  isOpen: boolean
  onConfirm: () => void
}

export function SessionExpiredModal({
  isOpen,
  onConfirm,
}: SessionExpiredModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onConfirm()
      }}
    >
      <DialogContent hideCloseButton className="max-w-sm text-center">
        <DialogHeader className="items-center gap-3 pr-0">
          {/* Icon peringatan */}
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="size-6" strokeWidth={1.5} />
          </div>

          <DialogTitle>Sesi Berakhir</DialogTitle>

          <DialogDescription>
            Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan masuk
            kembali untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            onClick={onConfirm}
            variant="primary"
            size="md"
            className="w-full"
          >
            Masuk Kembali
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
