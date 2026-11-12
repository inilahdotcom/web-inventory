import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}

/**
 * Modal — wrapper tipis di atas shadcn Dialog.
 * Selalu terbuka (controlled dari luar via kondisi render).
 *
 * @example
 * {isOpen && <Modal title="Judul" onClose={() => setOpen(false)}> ... </Modal>}
 */
export function Modal({ title, children, onClose, className }: ModalProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
